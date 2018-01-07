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
> On windows I had to logout and login again before the path to rethinkdb was active

### Install Horizon

The horizon server is the api where your angular app will talk to

```cli
npm install -g horizon
hz init 

```

> hz init will initialize the horizon server. See the .hz map for settings

> if you cloned the project and like run the sampl directly, run `npm i` and `npm run start`

And start the horizon server

```cli
hz serve --dev

```
you should see the following:

```note
__App available at http://127.0.0.1:8181_
_RethinkDB_
   _├── Admin interface: http://localhost:43534
   _└── Drivers can connect to port 43533__
_Starting Horizon..._
_🌄 Horizon ready for connections_
_

```
Check the administrative portal: <http://localhost:43534/> (the port can be diferent, see your output)

> Note the "App available at": <http://127.0.0.1:8181>.
> This is the endpoint your app will talk to

> you can stop the horizon server for now

### Install Angular CLI

```cli
npm install -g @angular/cli

```

## Scafold Angular APP

```cli
ng new RethinkNGDemoApp -minimal

cd RethinkNGDemoApp

npm i rxjs -s

npm i @horizon/client -s

npm i angular2-uuid -s
npm install @angular/material @angular/cdk -s
npm install @angular/animations -s
npm install concurrently --save-dev

```

> If you see an error while `ng new` is scafolding the app (e.g. 'Package install failed, see above.'), then run `yarn install` in the root folder of your app again. If it still fail, try `npm i`

### add a horizon config section to environment.ts

> open VSCode by entering `code .` (notice the '.', vscode will be opened in the working folder)

```typescript
export const environment = {
  production: false,
  horizonConfiguration: {
    host: '127.0.0.1:8181',
  }
};

```

### Add angular modules to the import section

```typescript
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";

imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule
  ],
```
### Add the material design 
> This section is optional, but the front end will look nice
#### css to styles.css


```typescript
@import '~@angular/material/prebuilt-themes/deeppurple-amber.css';

```

#### Add the material design components to app.module.ts

```typescript
  import { MatTableModule, MatButtonModule, MatInputModule } from "@angular/material";
  import { CdkTableModule } from "@angular/cdk/table";

  imports: [
    ...,
    CdkTableModule,
    MatTableModule,
    MatButtonModule,
    MatInputModule
  ],
```

### create a IModel interface

```cli
ng g interface models/iModel

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

add the CustomerService to the provider section in `app.module.ts`

```
import {CustomerService} from './services/customer.service';
providers: [CustomerService]
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
    postCode: string;
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

Replace code with

```typescript
import { Component, OnInit } from "@angular/core";
import { MatTableDataSource } from "@angular/material";
import { CustomerService } from "../../services/customer.service";
import { Customer, ICustomer } from "../../models/customer";

@Component({
  selector: "app-customers",
  template: `
    <app-customer></app-customer>
    <mat-table #table [dataSource]="dataSource">

    <!-- Name Column -->
    <ng-container matColumnDef="name">
      <mat-header-cell *matHeaderCellDef> Name </mat-header-cell>
      <mat-cell *matCellDef="let element"> {{element.name}} </mat-cell>
    </ng-container>

    <!-- remove Column -->
    <ng-container matColumnDef="remove">
      <mat-header-cell *matHeaderCellDef>
      </mat-header-cell>
      <mat-cell *matCellDef="let row">
        <button mat-button  (click)="remove(row)">Remove</button>
      </mat-cell>
    </ng-container>
  
    <mat-header-row *matHeaderRowDef="displayedColumns"></mat-header-row>
    <mat-row *matRowDef="let row; columns: displayedColumns;"></mat-row>
    
  </mat-table>
  `,
  styles: []
})
export class CustomersComponent implements OnInit {
  public customers: Customer[] = [];
  public dataSource: MatTableDataSource<Customer>;
  public displayedColumns = ["name", "remove"];
  constructor(private customerService: CustomerService) {}

  ngOnInit(): void {
    this.customerService.getCollection().subscribe(customers => {
      this.customers = customers;
      this.dataSource = new MatTableDataSource(this.customers);
    });
  }
  remove(customer: ICustomer): void {
    this.customerService.removeObject(customer.id);
  }
}
```

### Generate a customer component

```cli
ng g component components/customer
```
Replace the code

```typescript
import { Component, OnInit, Input } from "@angular/core";
import { CustomerService } from "../../services/customer.service";
import { ICustomer, Customer } from "../../models/customer";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";

@Component({
  selector: "app-customer",
  template: `
    <form #f="ngForm" (ngSubmit)="onSubmit()" name="form" >
      <mat-form-field>
        <input matInput required placeholder="Customer name" type="text" [(ngModel)]="customer.name" name="first">
      </mat-form-field>
      <button mat-button type="submit">Add</button>
      <!--[disabled]="!form.valid"-->
    </form>
  `,
  styles: []
})
export class CustomerComponent implements OnInit {
  @Input() customer: ICustomer = new Customer();
  form: FormGroup;

  constructor(private customerService: CustomerService, private formBuilder: FormBuilder) {}

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      name: [null, [Validators.required]],
    });
  }

  onSubmit(): void {
    this.customerService.addObject(this.customer);
  }
}
```

### Replace app.component.ts

```typescript
import { Component } from "@angular/core";

@Component({
  selector: "app-root",
  template: `
    <h1>Customers</h1>
    <app-customers></app-customers>
  `,
  styles: []
})
export class AppComponent {
  title = "app";
}
```
## Replace `npm run start` script

```typescript
"scripts": {
   ...
   "start": "concurrently \"hz serve --dev\" \"ng serve --open\" ",
   ... 
 }
```
## Ready to go :-)

```
npm run start
```