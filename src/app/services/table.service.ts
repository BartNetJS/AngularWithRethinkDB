import { Observable } from "rxjs/Rx";
import * as Horizon from "@horizon/client";
import { UUID } from "angular2-uuid";

import { environment } from "../../environments/environment"
import { IModel } from "../models/i-model";

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