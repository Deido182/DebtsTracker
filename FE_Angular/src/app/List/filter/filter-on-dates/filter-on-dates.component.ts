import { Component } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Amount } from 'src/app/Model/amount.model';
import { AbstractFilterAmountsComponent } from '../abstract-filter-amounts.component';

@Component({
  selector: 'app-filter-on-dates',
  templateUrl: './filter-on-dates.component.html',
  styleUrls: ['./filter-on-dates.component.css']
})
export class FilterOnDatesComponent extends AbstractFilterAmountsComponent {

  range = new FormGroup({
    start: new FormControl(),
    end: new FormControl(),
  });

  constructor() {
    super();
  }

  filter(): Iterable<Amount> {
    var newAmounts = [...this.amounts];
    if(this.range.controls.start.value != null)
      newAmounts = newAmounts.filter(x => x.date.getTime() >= this.range.controls.start.value.getTime());
    if(this.range.controls.end.value != null) {
      (<Date>this.range.controls.end.value).setHours(23, 59, 59);
      newAmounts = newAmounts.filter(x => x.date.getTime() <= this.range.controls.end.value.getTime());
    }
    return newAmounts;
  }

  onDateChange(): void {
    console.log('Going to filter by dates');
    this.filteredAmounts.next(this.filter());
  }
}
