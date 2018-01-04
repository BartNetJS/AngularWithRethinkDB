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
