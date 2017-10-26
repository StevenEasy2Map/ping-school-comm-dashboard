import {Component} from '@angular/core';
import {AuthService} from '../../providers/auth-service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-signin-component',
  templateUrl: 'signin.component.html',
  styleUrls: ['./security.style.scss']
})
export class SignInComponent {

  email = '';
  password = '';
  error = '';
  resetPasswordSent = false;
  forgotPassword = false;
  resetemail = '';

  constructor(private authService: AuthService, private router: Router) {
  }

  signIn(): void {
    this.authService.processing = true;
    const promise = this.authService.signInWithPassword(this.email, this.password);
    promise.then((res) => {
      console.log(res);
      this.router.navigateByUrl('/home');
    });
    promise.catch((err) => {
      this.error = <any>err;
      this.authService.processing = false;
      console.log(err);
    });
  }

  resetPassword() {

    this.authService.processing = true;
    this.authService.afAuth.auth.sendPasswordResetEmail(this.resetemail).then(() => {

      this.authService.processing = false;
      this.resetPasswordSent = true;
      this.forgotPassword = false;
      setTimeout(() => {
        this.resetPasswordSent = false;
      }, 5000);

    }).catch(err => {
      this.error = <any>err;
      this.authService.processing = false;
      console.log(err);
    });
  }

}
