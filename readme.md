# Angular 5 with RethinkDB

## Prerequisites

### Node and npm

<https://nodejs.org/en/>

### VSCode

<https://code.visualstudio.com/>

Or any code editor you like

### RethinkDB

Install RethinkDB: <https://rethinkdb.com/docs/install/>

Check the administrative portal: <http://localhost:8080/>

**Check if the path to rethinkdb.exe exist in your environment variables!**
side note: on windows I had to logout and login again before the path to rethinkdb was added

### Install Horizon

The horizon server is the api where you angular app will talk to

```cli
npm install -g horizon
hz init // will initialize the horizon settings, see the .hz map

```

And start the horizon server

```cli
hz serve --dev

```
you should note the following:

__App available at http://127.0.0.1:8181_
error: rethinkdb stderr: warn: Trying to delete non-existent file 'D:\source\playground\RethinkNGApp\rethinkdb_data\tmp'
_RethinkDB_
   _├── Admin interface: http://localhost:43534
   _└── Drivers can connect to port 43533__
_Starting Horizon..._
_🌄 Horizon ready for connections_
_

Check the administrative portal: <http://localhost:43534/> (the port can be diferent, see your output)
Note the "App available at": <http://127.0.0.1:8181>

### Angular CLI

```cli
npm install -g @angular/cli

```

## Scafold Angular APP

```cli
ng new RethinkNGApp -minimal

cd RethinkNGApp

npm i rxjs -s

npm i @horizon/client -s

npm i angular2-uuid -s
npm install @angular/material @angular/cdk -s
npm install @angular/animations -s

```

### add a horizon config section to environment.ts

```typescript
export const environment = {
  production: false,
  horizonConfiguration: {
    host: '127.0.0.1:8181',
  }
};

```

### Add the material design css to styles.css

```typescript
@import '~@angular/material/prebuilt-themes/deeppurple-amber.css';

```

### Add the material design components to app.module.ts

```typescript
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    CdkTableModule,
    MatTableModule,
    MatButtonModule,
    MatInputModule,
    BrowserAnimationsModule
  ],
```

### create a IModel interface

```cli
ng g interface models/iModel.ts

```

Replace the code in i-model.ts with

```code
import { UUID } from 'angular2-uuid';

export interface IModel {
    id: UUID;
}

```

### create generic table service to proxy rethink db tables

```cli
ng g service services/table

```

Replace the code in table.service.ts with the folowing

```typescript
import { Observable } from 'rxjs/Rx';
import * as Horizon from '@horizon/client';
import { UUID } from 'angular2-uuid';

import { environment } from '../../environments/environment'
import { IModel } from '../models/i-model';

export interface ITableService {
  readonly name: string;
}

export class TableService<T extends IModel> {
  private _hz: any;
  private _table: any;

  constructor(model: ITableService) {
    this._hz = new Horizon(environment.horizonConfiguration);
    this._table = this._hz(model.name);
  }

  addObject(data: T | Array<T>): void {
    this._table.insert(data);
  }

  clearCollection(): void {
    this._table.fetch().subscribe(
      (returnVar: Array<T>) => {
        this._table.removeAll(returnVar);
      });
  }

  removeObject(id: UUID | string | Array<UUID> | Array<string>): void {
    this._table.remove(id);
  }

  getCollection(): Observable<T[]> {
    return this._table.watch().map((rslt: Observable<T[]>) => { return rslt; });
  }

  getLimitedCollection(): Observable<T[]> {
    return this._table.limit(100).watch().map((rslt: Observable<T[]>) => { return rslt; });
  }

  getFirstObject(): Observable<T> {
    return this._table.watch().map((rslt: Observable<T[]>) => { return rslt[0]; });
  }

  getObjectThroughUuid(id: UUID | string): Observable<T> {
    return this._table.find(id).watch().map((rslt: Observable<T>) => { return rslt; });
  }

  updateObject(obj: T) {
    this._table.update(obj);
  }
}
```

### Generate a customer service

```cli
ng g service services/customer

```

Replace code with

```typescript
import { Injectable } from '@angular/core';
import { TableService } from './table.service';
import { Customer, Customers } from '../models/customer';

@Injectable()
export class CustomerService extends TableService<Customer> {
    constructor() {
        super(new Customers());
    }
}

```

### Generate a customer model (or any table you have in RethinkDB)

```cli
ng g class models/Customer
```

Replace code with

```typescript
import { UUID } from 'angular2-uuid';
import { ITableService } from '../services/table.service';
import { IModel } from './i-model';

export interface ICustomer extends IModel {
    id: UUID;
    name: string;
    contactMail: string;
    telephone: string;
    contactName: string;
    contactTitle: string;
    contactTelephone: string;

    street: string;
    houseNumber: string;
    city: string;
    postCode: string;
    country: string;
}

export class Customer {
    id: UUID;
    name: string;
    contactMail: string;
    telephone: string;
    contactName: string;
    contactTitle: string;
    contactTelephone: string;

    street: string;
    houseNumber: string;
    city: string;
    postcode: string;
    country: string;

    public constructor(init?: Partial<ICustomer>) {
        Object.assign(this, init);
    }
}
export class Customers implements ITableService{
    readonly name: string;

    constructor() {
        this.name = (<any>this).constructor.name;
    }
}
```

### Generate a customers component

```cli
ng g component components/customers
```

Add an import statement in app.module.ts to use the material components

```typescript
import { MatTableDataSource } from '@angular/material';

imports: [
    ...
  ],

```

Replace code with

```typescript
import { Customer} from '../../models/customer';
import { Component, OnInit } from '@angular/core';
import { CustomerService } from '../../services/customer.service';

@Component({
  selector: 'app-customers',
  template: `
    <div ngFor="customer in customers">
      {{customer.name}}
    </div>
  `,
  styles: []
})
export class CustomersComponent implements OnInit {
  private customers: Customer[];
  constructor(private customerService: CustomerService) { }

  ngOnInit(): void {
    this.customerService.getCollection().subscribe(customers=>{
      this.customers = customers;
    });
  }
}

```

### Generate a customer component

```cli
ng g component components/customer

```



## Create a node server to host the RethinkDB proxy

side note: for simplicity, we create the node api in the same solution as the angular app

```cli
md server
cd server
npm i horizon -s
npm i express
```

create a server.js file and copy the code below

