import { Injectable } from '@angular/core';
import { Auth } from 'aws-amplify';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  needConfirmation: boolean = false;
  who: string = null;

  constructor() {}

  async getEmail() {
    try {
      return (await Auth.currentAuthenticatedUser()).attributes.email;
    } catch(exc) {
      return this.who;
    }
  }

  async getAccessToken() {
    try {
      return (await Auth.currentSession()).getIdToken().getJwtToken();
    } catch(exc) {
      return null;
    }
  }

  async alreadyAuthenticated() {
    try {
      await Auth.currentAuthenticatedUser();
      return true;
    } catch(exc) {
      if (exc.__type !== "UserNotFoundException")
        return this.needConfirmation;
      return false;
    }
  }

  async emailVerified() {
    try {
      return (await Auth.verifiedContact(await Auth.currentAuthenticatedUser())).verified['email'] == await this.getEmail();
    } catch(exc) {
      return false;
    }
  }

  async signup(email: string, password: string) {
    try {
      await Auth.signUp(
        {
          username: email,
          password,
          attributes: {
            email
          }
        }
      );
      console.log('User successfully signed up!');
      return true;
    } catch (error) {
      console.log('Error during sign up', error);
      return false;
    }
  }

  async verifyEmail(code: string) {
    try {
      await Auth.confirmSignUp(await this.getEmail(), code);
      this.needConfirmation = false;
      this.who = null;
      return true;
    } catch(error) {
      console.log('Error confirming sign up', error);
      return false;
    }
  }

  async signin(email: string, password: string) {
    try {
      const user = await Auth.signIn(email, password);
      return true;
    } catch(error) {
      console.log('Error signing in', error);
      this.needConfirmation = error.message == 'User is not confirmed.'
      if(this.needConfirmation)
        this.who = email;
      return this.needConfirmation;
    }
  }

  async signout(): Promise<void> {
    await Auth.signOut();
  }

  async sendEmailAgain() {
    return Auth.resendSignUp(await this.getEmail());
  }

}
