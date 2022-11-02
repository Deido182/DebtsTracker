import { AfterViewInit, Component, ComponentRef, Input, OnDestroy, QueryList, ViewChildren } from '@angular/core';
import { Subscription } from 'rxjs';
import { DynamicDirective } from 'src/app/Directives/dynamic.directive';
import { ComponentFactory } from 'src/app/Factories/component-factory';
import { Amount } from 'src/app/Model/amount.model';
import { AbstractFilterAmountsComponent } from '../abstract-filter-amounts.component';

@Component({
  selector: 'app-filter-aggregator',
  templateUrl: './filter-aggregator.component.html',
  styleUrls: ['./filter-aggregator.component.css']
})
export class FilterAggregatorComponent extends AbstractFilterAmountsComponent implements AfterViewInit, OnDestroy {

  constructor() {
    super();
  }

  @Input() filterFactories: ComponentFactory<AbstractFilterAmountsComponent>[];
  @ViewChildren(DynamicDirective) blocks: QueryList<DynamicDirective>;
  filtersSub: Map<ComponentRef<AbstractFilterAmountsComponent>, Subscription> = new Map<ComponentRef<AbstractFilterAmountsComponent>, Subscription>();
  filtersAmounts: Map<ComponentRef<AbstractFilterAmountsComponent>, Amount[]> = new Map<ComponentRef<AbstractFilterAmountsComponent>, Amount[]>();

  ngAfterViewInit(): void {
    var next = 0;
    this.blocks.forEach(block => {
      const filterComponentRef = this.filterFactories[next ++].buildInto(block);
      filterComponentRef.instance.amounts = this.amounts;
      this.filtersSub.set(filterComponentRef, filterComponentRef.instance.filteredAmounts.subscribe(newAmounts => {
        this.filtersAmounts.set(filterComponentRef, [...newAmounts]);
        this.onNewFilter();
      }));
    });
  }

  ngOnDestroy(): void {
    console.log('Going to unsubscribe all');
    this.filtersSub.forEach((sub, ref) => { sub.unsubscribe(); ref.destroy(); });
  }

  filter(): Iterable<Amount> {
    return [...this.filtersAmounts.values()].reduce((acc, curr) => acc.filter(x => curr.includes(x)), [...this.amounts]);
  }

  onNewFilter(): void {
    console.log('Overall filter changed');
    this.filteredAmounts.next(this.filter());
  }
}
