import { Component, Input, OnChanges, Output, SimpleChanges } from "@angular/core";
import { Subject } from "rxjs";
import { Amount } from "src/app/Model/amount.model";

@Component({ template: '' })
export abstract class AbstractFilterAmountsComponent implements OnChanges {
    @Input() amounts: Iterable<Amount>;
    @Output() filteredAmounts: Subject<Iterable<Amount>> = new Subject<Iterable<Amount>>();

    abstract filter(): Iterable<Amount>;

    ngOnChanges(changes: SimpleChanges): void {
        if(!changes.amounts)
            return;
        this.filteredAmounts.next(this.filter());
    }
}