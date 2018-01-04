import { UUID } from "angular2-uuid";
import { ITableService } from "../services/table.service";
import { IModel } from "./i-model";

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