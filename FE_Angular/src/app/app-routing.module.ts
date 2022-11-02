import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuardService } from './Auth/auth/auth-guard.service';
import { AuthComponent } from './Auth/auth/auth.component';
import { HistoryPageComponent } from './Main/history-page/history-page.component';
import { HomePageComponent } from './Main/home-page/home-page.component';
import { MainPageComponent } from './Main/main-page/main-page.component';

export const MAIN_PAGE = 'main-page';
export const WAITING = 'waiting-lists';
export const AUTH = 'auth';

const routes: Routes = [
  { path: '', redirectTo: '/' + MAIN_PAGE, pathMatch: 'full' },
  { path: MAIN_PAGE, component: MainPageComponent, canActivate: [AuthGuardService], 
    children: [
      { path: '', component: HomePageComponent }, 
      { path: 'history', component: HistoryPageComponent }
    ]
  }, 
  { path: AUTH, component: AuthComponent },
  { path: '**', redirectTo: '/' + MAIN_PAGE }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { onSameUrlNavigation: 'reload' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
