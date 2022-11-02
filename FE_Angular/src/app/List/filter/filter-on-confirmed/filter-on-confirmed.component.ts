import { Component } from '@angular/core';
import { faQuestion, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { Amount } from 'src/app/Model/amount.model';
import { constants } from 'src/assets/constants';
import { AbstractFilterAmountsComponent } from '../abstract-filter-amounts.component';

@Component({
  selector: 'app-filter-on-confirmed',
  templateUrl: './filter-on-confirmed.component.html',
  styleUrls: ['./filter-on-confirmed.component.css']
})
export class FilterOnConfirmedComponent extends AbstractFilterAmountsComponent {

  constants = constants;
  selected: IconDefinition;

  constructor() {
    super();
  }

  filter(): Iterable<Amount> {
    if(this.selected == null)
      return [...this.amounts];
    return [...this.amounts].filter(x => 
      this.selected == constants.icons.outbox ? x.isNewProposedCredit() || x.isPaidDebtToBeConfirmed() : 
      this.selected == constants.icons.inbox ? x.isPossiblyPaidCredit() || x.isNewReceivedDebt() : 
      x.isConfirmedCredit() || x.isConfirmedDebt());
  }

  onClick(symbol: IconDefinition): void {
    if(symbol == this.selected) 
      this.selected = null;
    else
      this.selected = symbol;
    this.filteredAmounts.next(this.filter());
  }
}
