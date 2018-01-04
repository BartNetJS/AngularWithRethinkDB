import { Injectable } from "@angular/core";
import { TableService } from "./table.service";
import { Customer, Customers } from "../models/customer";

@Injectable()
export class CustomerService extends TableService<Customer> {
    constructor() {
        super(new Customers());
    }
}
