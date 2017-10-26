import {Component} from '@angular/core';
import {AuthService} from "../../providers/auth-service";
import {Router} from "@angular/router";
import {UserService} from "./user.service";
import {User} from "./models/user";

@Component({
  selector: 'app-signup-component',
  templateUrl: './signup.component.html',
  providers: [],
  styleUrls: ['./security.style.scss']
})
export class SignUpComponent {

  firstName = '';
  lastName = '';
  email = '';
  password = '';
  mobile: '';
  error = '';

  constructor(private auth: AuthService,
              private router: Router,
              private userService: UserService) {
  }

  signUpUser(): void {

    const user = new User(this.email,
      this.firstName, this.lastName, this.mobile, '');

    this.userService.createUserWithPassword(user, this.password).then((res) => {

      this.auth.getFirebaseTokenAsPromise().then(() => {

        this.userService.registerUser(user).subscribe(
          () => {
            this.router.navigate(['/home']);
          },
          error => {
            console.log(error);
          }
        );

      });


    });

  }


}
