import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';

@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.css']
})
export class MainPageComponent {

  navBarHeight: string = '0px';

  constructor(
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  onNavBarHeightChanged(newHeight: string): void {
    this.navBarHeight = newHeight;
    console.log('Navbar new height: ' + this.navBarHeight);
    this.changeDetectorRef.detectChanges();
  }
}
