import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router } from "@angular/router";
import { AUTH } from "src/app/app-routing.module";
import { AuthService } from "./auth.service";

@Injectable({
	providedIn: 'root' // Otherwise 'AuthGuardService' into providers of AppModule
})
export class AuthGuardService implements CanActivate {
	constructor(
        private authService: AuthService, 
		private router: Router
    ) {}
					
	canActivate(route: ActivatedRouteSnapshot): Promise<boolean> {
		return new Promise<boolean>(async (resolve, reject) => {
			const authenticated = await this.authService.alreadyAuthenticated();
			const verified = await this.authService.emailVerified();
			console.log('Already authenticated? ' + authenticated);
			console.log('Email verified? ' + verified)
			if(!authenticated || !verified) {
				this.router.navigate(['/' + AUTH]);
				reject();
			} else
				resolve(true);
		})
	}
}