import { APP_INITIALIZER, CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ListComponent } from './List/list/list.component';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FormsModule } from '@angular/forms';

import { PopupFormComponent } from './Popup/popup-form/popup-form.component';
import { DynamicDirective } from './Directives/dynamic.directive';
import { AuthComponent } from './Auth/auth/auth.component';
import { MainPageComponent } from './Main/main-page/main-page.component'
import { AuthAxiosInterceptorService, AxiosConfigFactory } from './Auth/auth/auth-axios-interceptor.service';
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { NgxSpinnerModule } from 'ngx-spinner';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { ReactiveFormsModule } from '@angular/forms';
import { NgChartsModule } from 'ng2-charts';

import Amplify from 'aws-amplify';
import awsconfig from '../aws-exports';
import { HomePageComponent } from './Main/home-page/home-page.component';
import { NavBarComponent } from './Main/nav-bar/nav-bar.component';
import { PaginationComponent } from './List/pagination/pagination.component';
import { FilterOnEmailComponent } from './List/filter/filter-on-email/filter-on-email.component';
import { FilterOnDatesComponent } from './List/filter/filter-on-dates/filter-on-dates.component';
import { FilterAggregatorComponent } from './List/filter/filter-aggregator/filter-aggregator.component';
import { FilterOnConfirmedComponent } from './List/filter/filter-on-confirmed/filter-on-confirmed.component';
import { CircularChartComponent } from './Chart/circular-chart/circular-chart.component';
import { AlertComponent } from './Alert/alert/alert.component';
import { HistoryPageComponent } from './Main/history-page/history-page.component';
Amplify.configure(awsconfig);

@NgModule({
  declarations: [
    AppComponent,
    ListComponent,
    PopupFormComponent,
    DynamicDirective,
    AuthComponent,
    MainPageComponent,
    HomePageComponent,
    NavBarComponent,
    PaginationComponent,
    FilterOnEmailComponent,
    FilterOnDatesComponent,
    FilterAggregatorComponent,
    FilterOnConfirmedComponent,
    CircularChartComponent,
    AlertComponent,
    HistoryPageComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FontAwesomeModule, 
    HttpClientModule,
    FormsModule,
    BrowserAnimationsModule,
    NgxSpinnerModule, 
    MatDatepickerModule, 
    MatNativeDateModule, 
    ReactiveFormsModule, 
    NgChartsModule
  ],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: AxiosConfigFactory,
      deps: [AuthAxiosInterceptorService],
      multi: true
    }
  ],
  bootstrap: [AppComponent], 
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ]
})
export class AppModule { }
