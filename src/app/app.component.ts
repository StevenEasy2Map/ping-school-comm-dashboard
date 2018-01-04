import {Component} from '@angular/core';
import {AuthService} from '../providers/auth-service';
import {UserService} from './security/user.service';
import {Router} from '@angular/router';
import {AngularFireAuth} from 'angularfire2/auth';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  providers: [AuthService, UserService, AngularFireAuth],
  styleUrls: ['./app.style.scss']
})
export class AppComponent {

  constructor(private authService: AuthService, private router: Router) {


  }
}
