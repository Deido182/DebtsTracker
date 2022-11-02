import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Amount } from 'src/app/Model/amount.model';
import { API } from '@aws-amplify/api';

export enum ModOperations {
  Settle = 'SETTLE', 
  Confirm = 'CONFIRM', 
  Cancel = 'CANCEL'
};

@Injectable({
  providedIn: 'root'
})
export class AmountsService {

  RELOADING: string = 'reloading';
  RELOADED: string = 'reloaded';
  apiName = 'AmountsAPI';
  apiPath = '/amounts';

  private amounts: Amount[] = [];
  settledAmounts: Amount[] = [];
  unsettledAmounts: Amount[] = [];
  amountsActions: Subject<string> = new Subject<string>();

  constructor() {}

  getAmounts() {
    this.amountsActions.next(this.RELOADING);
    API.get(this.apiName, this.apiPath, { }).then(resp => {
      console.log('Amounts received: ' + JSON.stringify(resp));
      return resp.currentList != undefined ? resp.currentList : [];
    }).then(list => {
      this.amounts = list.map(x => 
        new Amount(x.quantity, 
                   x.isCredit, 
                   x.reason, 
                   x.involved, 
                   x.confirmed, 
                   x.id, 
                   new Date(x.date),
                   x.paidOn != null ? new Date(x.paidOn) : null
        ));
      this.settledAmounts = this.amounts.filter(x => x.isSettled());
      this.unsettledAmounts = this.amounts.filter(x => !x.isSettled());
    }).finally(() => {
      this.amountsActions.next(this.RELOADED);
    });
  }

  addAmount(amount: Amount) {
    return API.post(this.apiName, this.apiPath, { body: amount }).then(resp => {
      this.getAmounts();
    });
  }

  async modAmounts(selectedAmounts: Amount[], operation: string) {
    var errors = [];
    for(let amount of selectedAmounts) {
      try {
        await API.put(this.apiName, this.apiPath, { 
          body: { 
            'otherEmail': amount.involved, 
            'operation': operation, 
            'id': amount.id 
          } 
        });
      } catch(err) {
        errors.push(err);
      }
    }
    this.getAmounts();
    return errors;
  }
}
