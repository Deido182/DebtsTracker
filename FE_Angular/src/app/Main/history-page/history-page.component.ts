import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ComponentFactory } from 'src/app/Factories/component-factory';
import { AbstractFilterAmountsComponent } from 'src/app/List/filter/abstract-filter-amounts.component';
import { FilterOnDatesComponent } from 'src/app/List/filter/filter-on-dates/filter-on-dates.component';
import { FilterOnEmailComponent } from 'src/app/List/filter/filter-on-email/filter-on-email.component';
import { Amount } from 'src/app/Model/amount.model';
import { AmountsService } from 'src/app/Services/Amounts/amounts.service';
import { constants } from 'src/assets/constants';

@Component({
  selector: 'app-history-page',
  templateUrl: './history-page.component.html',
  styleUrls: ['./history-page.component.css']
})
export class HistoryPageComponent implements OnInit {

  filterFactories: ComponentFactory<AbstractFilterAmountsComponent>[] = [
    new ComponentFactory<FilterOnEmailComponent>(FilterOnEmailComponent), 
    new ComponentFactory<FilterOnDatesComponent>(FilterOnDatesComponent)
  ];

  amounts: Amount[] = [];
  filteredAmounts: Amount[] = [];
  selectedAmounts: Amount[] = [];
  loading: boolean = false;
  constants = constants;

  constructor(
    private amountsService: AmountsService, 
    private spinnerService: NgxSpinnerService, 
    private changeDetector: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.amountsService.amountsActions.subscribe({
      next: (action) => {
        if(action === this.amountsService.RELOADING) {
          this.loading = true;
          this.spinnerService.show();
        } else if(action === this.amountsService.RELOADED) {
          console.log("New amounts loaded!");
          this.amounts = this.amountsService.settledAmounts;
          console.log(this.amounts);
          this.spinnerService.hide();
          this.loading = false;
        }
      }, 
      error: (err) => {
        console.log(err);
        this.spinnerService.hide();
        this.loading = false;
      }
    });
    this.amountsService.getAmounts();
  }

  onNewFilteredAmounts(newFilteredAmounts: Iterable<Amount>): void {
    console.log('Amounts have been filtered');
    this.filteredAmounts = [...newFilteredAmounts];
    this.changeDetector.detectChanges();
  }

  onRefreshClick(): void {
    console.log("Amounts are going to be reloaded");
    this.amountsService.getAmounts();
  }
}
