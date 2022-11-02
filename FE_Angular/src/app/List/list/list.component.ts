import { Component, Input, OnChanges, Output, Renderer2, SimpleChanges } from '@angular/core';
import { Amount } from 'src/app/Model/amount.model';
import { Subject } from 'rxjs';
import { constants } from 'src/assets/constants';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class ListComponent implements OnChanges {

  @Input() amounts: Amount[] = [];
  @Input() pageSize: number = 5;
  @Input() selectable: boolean = true;
  @Output() selected: Subject<Iterable<Amount>> = new Subject<Iterable<Amount>> ();
  selectedAmounts: Set<Amount> = new Set<Amount> ();
  constants = constants;

  constructor(
    private renderer: Renderer2
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if(!changes.amounts || !this.selectable)
      return;
    console.log('Amounts changed: going to filter the selected ones');
    this.selectedAmounts = new Set<Amount> (this.amounts.filter(x => this.selectedAmounts.has(x)));
    this.selected.next(this.selectedAmounts);
  }

  onMouseEnter(event: Event, amount: Amount): void {
    if(!this.selectedAmounts.has(amount))
      this.renderer.addClass(event.target, amount.isPossiblyPaidCredit() ? 'golden-active' : 'active');
  }

  onMouseLeave(event: Event, amount: Amount): void {
    if(!this.selectedAmounts.has(amount))
      this.renderer.removeClass(event.target, amount.isPossiblyPaidCredit() ? 'golden-active' : 'active');
  }

  onItemClick(amount: Amount): void {
    if(!this.selectable)
      return;
    if(!this.selectedAmounts.has(amount)) 
      this.selectedAmounts.add(amount);
    else 
      this.selectedAmounts.delete(amount);
    this.selected.next(this.selectedAmounts);
  }
}
