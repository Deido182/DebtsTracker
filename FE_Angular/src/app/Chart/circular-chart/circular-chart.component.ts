import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ChartData, ChartOptions } from 'chart.js';
import { Amount } from 'src/app/Model/amount.model';
import { constants } from 'src/assets/constants';

@Component({
  selector: 'app-circular-chart',
  templateUrl: './circular-chart.component.html',
  styleUrls: ['./circular-chart.component.css']
})
export class CircularChartComponent implements OnChanges {
  @Input() amounts: Amount[];
  chartData: ChartData<'pie'>;
  chartOptions: ChartOptions;
  constants = constants;

  chartElements = [
    {
      label: 'New possible debts', 
      countIf: (amount: Amount) => amount.isNewReceivedDebt(), 
      backgroundColor: constants.colors.lightRed,
      hoverBackgroundColor: constants.colors.darkerLightRed
    }, 
    {
      label: 'Confirmed debts', 
      countIf: (amount: Amount) => amount.isConfirmedDebt(), 
      backgroundColor: constants.colors.red,
      hoverBackgroundColor: constants.colors.darkerRed
    }, 
    {
      label: 'Proposed credits', 
      countIf: (amount: Amount) => amount.isNewProposedCredit(), 
      backgroundColor: constants.colors.lightGreen,
      hoverBackgroundColor: constants.colors.darkerLightGreen
    }, 
    {
      label: 'Confirmed credits', 
      countIf: (amount: Amount) => amount.isConfirmedCredit(), 
      backgroundColor: constants.colors.green,
      hoverBackgroundColor: constants.colors.darkerGreen
    }, 
    {
      label: 'Paid debts to be confirmed', 
      countIf: (amount: Amount) => amount.isPaidDebtToBeConfirmed(), 
      backgroundColor: constants.colors.gray,
      hoverBackgroundColor: constants.colors.darkerGray
    }, 
    {
      label: 'Possibly paid credits', 
      countIf: (amount: Amount) => amount.isPossiblyPaidCredit(), 
      backgroundColor: constants.colors.gold,
      hoverBackgroundColor: constants.colors.darkerGold
    }
  ]; 
  
  constructor() { }

  ngOnChanges(changes: SimpleChanges): void {
    if(!changes.amounts)
      return;
    this.chartData = {
      labels: this.chartElements.map(el => el.label),
      datasets: [{ 
        data: this.chartElements.map(el => this.amounts.reduce((acc, amount) => acc + (el.countIf(amount) ? 1 : 0), 0)), 
        backgroundColor: this.chartElements.map(el => el.backgroundColor),
        hoverBackgroundColor: this.chartElements.map(el => el.hoverBackgroundColor), 
        hoverBorderColor: 'white'
      }]
    };
    this.chartOptions = {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'Unsettled amounts distribution',
        }, 
        legend: { position: 'bottom' }
      }
    };
  }
}
