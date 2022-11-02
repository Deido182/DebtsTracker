import { ComponentRef, Type } from "@angular/core";
import { DynamicDirective } from "../Directives/dynamic.directive";

export class ComponentFactory<T> {

    constructor(
        private type: Type<T>
    ) {}

    buildInto(block: DynamicDirective): ComponentRef<T> {
        block.viewContainerRef.clear();
		return block.viewContainerRef.createComponent(this.type);
    }
}