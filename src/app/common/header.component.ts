import {Component} from '@angular/core';
import {UserService} from '../security/user.service';
import {AuthService} from '../../providers/auth-service';
import {Router} from '@angular/router';
import {User} from '../security/models/user';

@Component({
  selector: 'header-component',
  templateUrl: './header.component.html',
  styleUrls: ['./header.style.scss']
})
export class HeaderComponent {

  authService: AuthService;
  userService: UserService;

  constructor(private auth$: AuthService, private user$: UserService, private router: Router) {

    this.authService = auth$;
    this.userService = user$;

  }

  logout() {
    this.authService.signOut();
  }

}
