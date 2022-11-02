import { AfterViewChecked, Component, ElementRef, OnInit, Output, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { AUTH } from 'src/app/app-routing.module';
import { AuthService } from 'src/app/Auth/auth/auth.service';
import { constants } from 'src/assets/constants';

@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.css']
})
export class NavBarComponent implements OnInit, AfterViewChecked {

  myEmail: Promise<string>;
  private oldHeight: string;
  @Output() heightChanged: Subject<string> = new Subject<string>();
  @ViewChild('container') container: ElementRef;
  constants = constants;

  constructor(
    private authService: AuthService, 
    private router: Router
  ) {}

  ngOnInit(): void {
    this.myEmail = this.authService.getEmail();
  }

  ngAfterViewChecked(): void {
    const newHeight =  this.container.nativeElement.offsetHeight + 'px';
    if(newHeight == this.oldHeight)
      return;
    this.heightChanged.next(this.oldHeight = newHeight);
  }

  onLogoutClick(): void {
    this.authService.signout().then(async resp => {
      console.log(await this.authService.alreadyAuthenticated());
      this.router.navigate(['/' + AUTH]);
    });
  }
}
