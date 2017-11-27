import { Component, ViewChild } from '@angular/core';
import { NavController } from 'ionic-angular';
import { OAuthService } from 'angular-oauth2-oidc';
import { TabsPage } from '../tabs/tabs';
declare const OktaAuth: any;

@Component({
  selector: 'page-login',
  templateUrl: 'login.html'
})
export class LoginPage {
  @ViewChild('email') email: any;
  private username: string;
  private password: string;
  private error: string;

  constructor(private navCtrl: NavController, private oauthService: OAuthService) {
    oauthService.redirectUri = window.location.origin;
    oauthService.clientId = 'vague-dev-878135';
    oauthService.scope = 'openid profile email';
    oauthService.oidc = true;
    oauthService.issuer = 'https://dev-878135-admin.oktapreview.com';
  }
login(): void {
  this.oauthService.createAndSaveNonce().then(nonce => {
    const authClient = new OktaAuth({
      clientId: this.oauthService.clientId,
      redirectUri: this.oauthService.redirectUri,
      url: this.oauthService.issuer
    });
    authClient.signIn({
      username: this.username,
      password: this.password
    }).then((response) => {
      if (response.status === 'SUCCESS') {
        authClient.token.getWithoutPrompt({
          nonce: nonce,
          responseType: ['id_token', 'token'],
          sessionToken: response.sessionToken,
          scopes: this.oauthService.scope.split(' ')
        })
          .then((tokens) => {
            // oauthService.processIdToken doesn't set an access token
            // set it manually so oauthService.authorizationHeader() works
            localStorage.setItem('access_token', tokens[1].accessToken);
            this.oauthService.processIdToken(tokens[0].idToken, tokens[1].accessToken);
            this.navCtrl.push(TabsPage);
          })
          .catch(error => console.error(error));
      } else {
        throw new Error('We cannot handle the ' + response.status + ' status');
      }
    }).fail((error) => {
      console.error(error);
      this.error = error.message;
    });
  });
}
  ionViewDidLoad(): void {
    setTimeout(() => {
      this.email.setFocus();
    }, 500);
  }
}