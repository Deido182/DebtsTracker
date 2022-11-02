import { Injectable } from '@angular/core';
import axios from 'axios';
import { AuthService } from './auth.service';

@Injectable({providedIn: 'root'})
export class AuthAxiosInterceptorService {

    constructor(
        private authService: AuthService
    ) {}

    intercept() {
        axios.interceptors.request.use(async request => {
            if(request.method == 'options')
                return request;
            console.log('Outgoing request intercpeted!');
            request.headers.Authorization = 'Bearer ' + (await this.authService.getAccessToken());
            return request;
        });
    }
}

export function AxiosConfigFactory(axiosIntercept: AuthAxiosInterceptorService): any {
  return () => axiosIntercept.intercept();
}