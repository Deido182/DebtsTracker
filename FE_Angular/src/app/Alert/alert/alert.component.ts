import { Component, Input, OnInit } from '@angular/core';
import { constants } from 'src/assets/constants';

export enum AlertType {
  Success = 'SUCCESS', 
  Fail = 'FAIL', 
  Warning = 'WARNING'
}

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.css']
})
export class AlertComponent implements OnInit {

  constants = constants;
  @Input() showWhen: boolean;
  @Input() message: string;
  @Input() type: AlertType;
  allAlertTypes = AlertType;

  constructor() { }

  ngOnInit(): void {
  }

}
