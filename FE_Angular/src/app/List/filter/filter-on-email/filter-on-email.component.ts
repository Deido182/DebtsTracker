import { Component } from '@angular/core';
import { Amount } from 'src/app/Model/amount.model';
import { AbstractFilterAmountsComponent } from '../abstract-filter-amounts.component';

@Component({
  selector: 'app-filter-on-email',
  templateUrl: './filter-on-email.component.html',
  styleUrls: ['./filter-on-email.component.css']
})
export class FilterOnEmailComponent extends AbstractFilterAmountsComponent {

  emailFilter: string;

  constructor() {
    super();
  }

  filter(): Iterable<Amount> {
    return [...this.amounts].filter(x => x.involved.includes(this.emailFilter));
  }

  onEmailFilterChange(): void {
    console.log('Going to filter by email');
    this.filteredAmounts.next(this.filter());
  }
}
