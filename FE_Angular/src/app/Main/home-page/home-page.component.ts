import { ChangeDetectorRef, Component, ComponentRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription } from 'rxjs';
import { AlertType } from 'src/app/Alert/alert/alert.component';
import { ComponentFactory } from 'src/app/Factories/component-factory';
import { AbstractFilterAmountsComponent } from 'src/app/List/filter/abstract-filter-amounts.component';
import { FilterOnConfirmedComponent } from 'src/app/List/filter/filter-on-confirmed/filter-on-confirmed.component';
import { FilterOnDatesComponent } from 'src/app/List/filter/filter-on-dates/filter-on-dates.component';
import { FilterOnEmailComponent } from 'src/app/List/filter/filter-on-email/filter-on-email.component';
import { Amount } from 'src/app/Model/amount.model';
import { AmountsService, ModOperations } from 'src/app/Services/Amounts/amounts.service';
import { constants } from 'src/assets/constants';
import { DynamicDirective } from '../../Directives/dynamic.directive';
import { PopupFormComponent } from '../../Popup/popup-form/popup-form.component';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css']
})
export class HomePageComponent implements OnInit, OnDestroy {

  title = 'DebtsTracker';
  pageSpinnerName = 'pageSpinner';
  listSpinnerName = 'listSpinner';
  constants = constants;

  closePopupSub: Subscription;
  submittedAmountSub: Subscription;
  popupCompDynRef: ComponentRef<PopupFormComponent>;
  @ViewChild(DynamicDirective, { static: false }) popupBlock: DynamicDirective;

  alertMessage: string;
  alertType: AlertType;
  showAlert: boolean = false;

  filterFactories: ComponentFactory<AbstractFilterAmountsComponent>[] = [
    new ComponentFactory<FilterOnEmailComponent>(FilterOnEmailComponent), 
    new ComponentFactory<FilterOnDatesComponent>(FilterOnDatesComponent), 
    new ComponentFactory<FilterOnConfirmedComponent>(FilterOnConfirmedComponent)
  ];

  amounts: Amount[] = [];
  filteredAmounts: Amount[] = [];
  selectedAmounts: Amount[] = [];
  total: number = 0;
  loading: boolean = true;

  modOperations = ModOperations;
  selectedOperation = null;

  constructor(
    private amountsService: AmountsService, 
    private spinnerService: NgxSpinnerService, 
    private changeDetector: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.amountsService.amountsActions.subscribe({
      next: (action) => {
        if(action === this.amountsService.RELOADING) {
          this.loading = true;
          this.spinnerService.show(this.listSpinnerName);
        } else if(action === this.amountsService.RELOADED) {
          console.log("New amounts loaded!");
          this.amounts = this.amountsService.unsettledAmounts;
          this.spinnerService.hide(this.listSpinnerName);
          this.loading = false;
        }
      }, 
      error: (err) => {
        console.log(err);
        this.spinnerService.hide(this.listSpinnerName);
        this.loading = false;
      }
    });
    this.amountsService.getAmounts();
  }

  ngOnDestroy(): void {
    this.destroyPopup();
  }

  private destroyPopup(): void {
    if(this.closePopupSub)
      this.closePopupSub.unsubscribe();
    if(this.submittedAmountSub)
      this.submittedAmountSub.unsubscribe();
    if(this.popupCompDynRef)
      this.popupCompDynRef.destroy();
  }

  onPopupButtonClick(credit: boolean = false) {
    this.popupBlock.viewContainerRef.clear();
		this.popupCompDynRef = this.popupBlock.viewContainerRef.createComponent(PopupFormComponent);
    this.popupCompDynRef.instance.credit = credit;
    this.submittedAmountSub = this.popupCompDynRef.instance.amountSubmitted.subscribe(amount => {
      this.spinnerService.show(this.pageSpinnerName);
      this.amountsService.addAmount(amount).then(_ => {
        this.onAlertRequired(AlertType.Success, 'Amount successfully inserted');
      }).catch(error => {
        this.onAlertRequired(AlertType.Fail, 'Fail: an error occurred');
      }).finally(() => {
        this.spinnerService.hide(this.pageSpinnerName);
      });
    });
    this.closePopupSub = this.popupCompDynRef.instance.closeButtonClicked.subscribe(close => {
      if(close) 
        this.destroyPopup();
    });
  }

  onAlertRequired(type: AlertType, message: string): void {
    this.alertType = type;
    this.alertMessage = message;
    this.showAlert = true;
    setTimeout(() => {
      this.showAlert = false;
    }, 3000);
  }

  onNewFilteredAmounts(newFilteredAmounts: Iterable<Amount>): void {
    console.log('Amounts have been filtered');
    this.filteredAmounts = [...newFilteredAmounts];
    this.updateTotal();
    this.changeDetector.detectChanges();
  }

  onNewSelectedAmounts(onNewSelectedAmounts: Iterable<Amount>): void {
    console.log('New selected amounts');
    this.selectedAmounts = [...onNewSelectedAmounts];
    this.changeDetector.detectChanges();
  }

  private updateTotal(): void {
    this.total = this.filteredAmounts.reduce((acc, x) => acc + x.quantity * (x.isCredit ? 1 : -1), 0);
  }

  onRefreshClick(): void {
    console.log("Amounts are going to be reloaded");
    this.amountsService.getAmounts();
  }

  private isEnabled(condSatisfied: (amount: Amount) => boolean): boolean {
    if(this.selectedAmounts.length == 0)
      return false;
    return this.selectedAmounts.reduce((acc, curr) => acc && condSatisfied(curr), true);
  }

  isSettleEnabled(): boolean {
    return this.isEnabled(amount => amount.isConfirmedCredit() || amount.isConfirmedDebt());
  }

  isConfirmEnabled(): boolean {
    return this.isEnabled(amount => amount.isNewReceivedDebt() || amount.isPossiblyPaidCredit());
  }

  isCancelEnabled(): boolean {
    return this.isEnabled(amount => amount.isNewProposedCredit() || amount.isNewReceivedDebt() || amount.isPossiblyPaidCredit() || amount.isPaidDebtToBeConfirmed());
  }

  onOffcanvasConfirm() {
    this.spinnerService.show(this.pageSpinnerName);
    const modAmounts = this.selectedAmounts.length;
    this.amountsService.modAmounts(this.selectedAmounts, this.selectedOperation).then(errors => {
      if(errors.length != 0)
        this.onAlertRequired(AlertType.Warning, 'There have been: ' + errors.length + ' errors, out of ' + modAmounts + ' amounts');
      else
        this.onAlertRequired(AlertType.Success, 'Amounts successfully modified');
    }).catch(err => {
      this.onAlertRequired(AlertType.Fail, 'Fail: an error occurred');
      console.log(err);
    }).finally(() => {
      this.spinnerService.hide(this.pageSpinnerName);
    });
  }
}
