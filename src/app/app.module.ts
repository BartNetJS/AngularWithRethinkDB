import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";

import { MatTableModule, MatButtonModule, MatInputModule } from "@angular/material";
import { CdkTableModule } from "@angular/cdk/table";

import { AppComponent } from "./app.component";
import { CustomersComponent } from "./components/customers/customers.component";
import { CustomerService } from "./services/customer.service";
import { CustomerComponent } from "./components/customer/customer.component";

@NgModule({
  declarations: [
    AppComponent,
    CustomersComponent,
    CustomerComponent,
  ],
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
  providers: [CustomerService],
  bootstrap: [AppComponent]
})
export class AppModule { }
