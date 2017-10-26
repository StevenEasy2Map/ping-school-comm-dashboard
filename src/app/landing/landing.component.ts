import {AfterViewInit, Component} from '@angular/core';
import {Router} from '@angular/router';
import {GroupService} from '../group/group.service';
import {AuthService} from '../../providers/auth-service';

@Component({
  selector: 'app-landing-component',
  templateUrl: 'landing.component.html',
  styleUrls: ['./landing.style.scss'],
  providers: [],
})
export class LandingComponent implements AfterViewInit {

  constructor(private auth: AuthService, private router: Router) {
  }

  ngAfterViewInit(): void {

    if (this.auth.authenticated) {
      this.router.navigate(['/']);
    }

  }

}

