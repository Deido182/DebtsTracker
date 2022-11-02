import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { NavigationEnd, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { AUTH, MAIN_PAGE } from 'src/app/app-routing.module';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent implements OnInit {

  @ViewChild('mainForm', { static: false }) mainForm: NgForm;
  @ViewChild('verificationForm', { static: false }) verificationForm: NgForm;
  registering: boolean = false;;
  confirming: boolean = false;;

  constructor(
    private authService: AuthService,
    private router: Router,
    private spinnerService: NgxSpinnerService
  ) { }

  ngOnInit(): void {
    this.setup();
    this.router.events.subscribe(event => {
      if(event instanceof NavigationEnd &&
         event.urlAfterRedirects == '/' + AUTH) 
          this.setup();
    });
  }

  private async setup(): Promise<void> {
    const authenticated = await this.authService.alreadyAuthenticated();
		const verified = await this.authService.emailVerified();
    this.confirming = authenticated && !verified;
    console.log('Confirmation needed? ' + this.confirming);
  }

  onMainSubmit(): void {
    const email = this.mainForm.value.email;
    const pw = this.mainForm.value.password;
    this.spinnerService.show();
    let outcome: Promise<boolean>;
    if(this.registering) {
      const confirmedPw = this.mainForm.value.passwordConfirmed;
      if(pw !== confirmedPw) {
        console.log("The passwords do not match!");
        this.mainForm.reset();
        return;
      }
      outcome = this.authService.signup(email, pw);
    } else 
      outcome = this.authService.signin(email, pw);
    outcome.then(
      (resp: boolean) => {
        this.spinnerService.hide();
        console.log('Success? ' + resp);
        if(resp) {
          this.router.navigate(['/' + MAIN_PAGE]);
          this.registering = false;
        } else 
          alert(this.registering ? 'Email already used' : 'Wrong email or password!');
      }
    ).catch(error => {
      this.spinnerService.hide();
    });
  }

  onVerifySubmit(): void {
    this.spinnerService.show();
    const code = this.verificationForm.value.verificationCode;
    this.authService.verifyEmail(code).then(
      (resp: boolean) => {
        this.spinnerService.hide();
        console.log('Confirmation success? ' + resp);
        if(resp) 
          this.router.navigate(['/' + MAIN_PAGE]);
        else 
          alert('The code is not correct');
      }
    ).catch(error => {
      this.spinnerService.hide();
    });;
  }

  onSendEmailAgain(): void {
    this.authService.sendEmailAgain().then(resp => {
      console.log('Email sent again');
    }).catch(console.log);
  }

}
