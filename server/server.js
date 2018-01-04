#!/usr/bin/env node
'use strict'

const debug = require('debug')('nodetest:server');
debug.enabled = true;
debug('Startup Horizon API');

//Temp fix for appInsights TLS error.  See https://github.com/Microsoft/ApplicationInsights-node.js/issues/180
// var rootcas = require('ssl-root-cas').create();
// rootcas.addFile("msit_cert.txt");
// require('https').globalAgent.options.ca = rootcas;

//Enable AppInsights
// var appInsights = require("applicationinsights");
// appInsights.setup("0d5f75c4-3a59-47c4-91b3-3634abdb6a87").start();

//require
const express = require('express');
const horizon = require('horizon');
const r = require('rethinkdb');
const http = require('http');
const https = require('https');
const fs = require('fs');

//init
var port = process.env.PORT || 80;;

//create app
const app = express();
app.set('port', port);
app.get('/', function (req, res) {
    res.send('horizon API up and running!');
});

//we use the azure common certificate, thereby the ap is listening on port 80, azure is redirecting the traffic from https to internal http
const server = http.createServer(
    //     {
    //     key: fs.readFileSync('horizon-key.pem'),
    //     cert: fs.readFileSync('horizon-cert.pem')
    // }
);
server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

//Horizon settings
//todo: move setting to environment class: check with CI deployment options
const options = {
    project_name: 'angular_rethinkdb',
    rdb_host: 'localhost',
    rdb_port: '28015',
    auto_create_collection: true,
    auto_create_index: true,
    permissions: false,
    access_control_allow_origin: '*',
    // auth: {
    //     token_secret: 'nS+QQ5ohHtdu6I2peo5ihiLl3Cc7e2Ol01nwBvrcCNwSnzV6I+0MNiNuPuMzU7dHm7Q36XPTE2o0qKrZOSMkWQ==',
    //     allow_anonymous: false,
    //     allow_unauthenticated: false,
    //     success_redirect: 'http://localhost'
    // }
};
const horizonServer = horizon(server, options);

//Horizon Authentication
// debug('Adding authentication provider');
// horizonServer.add_auth_provider(
//     horizon.auth.azuread,
//     {
//         id: 'bdf7831d-1568-4265-bbe5-7b5d42866af3',
//         secret: '8/6Us6ynIYJRh4G87milChoZa3JPCzSJfY0ybMaVjCY=',
//         path: 'azuread',
//         tenant: 'SPIKES1BE.onmicrosoft.com',
//         resource: 'bdf7831d-1568-4265-bbe5-7b5d42866af3'
//     }
// );

//error handling
function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }

    var bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}

function onListening() {
    var addr = server.address();
    var bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
    debug('Listening on ' + bind);
}

//sample
//horizonServer._reql_conn.ready().then((reql_conn) => {
//    var doc = r.db('mydb').table('customers').insert({name: "Google (I wish ;-))"}).run(reql_conn.connection());
//});
