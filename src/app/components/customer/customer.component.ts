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
