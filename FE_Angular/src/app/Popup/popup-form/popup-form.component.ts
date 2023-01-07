import { Component, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Amount } from 'src/app/Model/amount.model';
import { Subject } from 'rxjs';
import { constants } from 'src/assets/constants';

@Component({
  selector: 'app-popup-form',
  templateUrl: './popup-form.component.html',
  styleUrls: ['./popup-form.component.css']
})
export class PopupFormComponent {

  @ViewChild('amountForm', { static: true }) form: NgForm;
  closeButtonClicked: Subject<boolean> = new Subject<boolean>();
  amountSubmitted: Subject<Amount> = new Subject<Amount>();
  credit: boolean = false;

  constants = constants

  constructor() {}

  onSubmit(): void {
    if(!this.form.valid) {
      console.log('The form is not valid!');
      return;
    }
    const amount = new Amount(
      this.form.value.amount,
      this.credit, 
      this.form.value.reason, 
      this.form.value.involved
    );
    if(confirm(this.form.value.amount + " €\n" + this.form.value.reason + "\n" + this.form.value.involved)) {
      this.amountSubmitted.next(amount);
      this.form.reset();
      console.log('Submitted');
    }
  }

  onCloseClick(): void {
    this.closeButtonClicked.next(true);
  }
}
