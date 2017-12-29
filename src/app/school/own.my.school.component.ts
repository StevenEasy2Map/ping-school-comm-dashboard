import {AfterViewInit, Component} from '@angular/core';
import {Router} from '@angular/router';
import {AuthService} from '../../providers/auth-service';
import {SchoolService} from './school.service';
import {HelperService} from '../../providers/helper-service';

@Component({
  selector: 'app-own-my-school-component',
  templateUrl: 'own.my.school.component.html',
  styleUrls: ['./school.style.scss'],
  providers: [SchoolService],
})
export class OwnMySchoolComponent implements AfterViewInit {

  error = '';
  schoolsList: any = [];
  selectedSchool: any = null;
  email = '';
  vetNewEvents = false;
  vetNewNotices = false;
  allowNewGroupsNonAdmin = false;

  constructor(private auth: AuthService,
              private router: Router, private schoolService: SchoolService) {
  }

  ngAfterViewInit(): void {
    this.getNonPrivateSchools();

  }

  ownMySchool(): void {

    if (!this.selectedSchool || !this.email) {
      return;
    }

    if (!HelperService.isValidMailFormat(this.email)) {
      return;
    }

    this.auth.processing = true;

    this.auth.getFirebaseTokenAsPromise().then(() => {

      const details = {

        school_id: this.selectedSchool.id,
        email: this.email,
        vet_new_events: this.vetNewEvents ? 1 : 0,
        vet_new_notices: this.vetNewNotices ? 1 : 0,
        allow_new_groups_non_admin: this.allowNewGroupsNonAdmin ? 1 : 0

      };

      this.schoolService.ownMySchool(details).subscribe(
        res => {
          this.router.navigateByUrl('/home');
        },
        error => this.error = <any>error);

    });

  }

  getNonPrivateSchools(): void {

    this.auth.processing = true;
    this.schoolService.getAllNonPrivateSchools().subscribe(
      schools => {
        this.schoolsList = schools;
        this.auth.processing = false;

      },
      error => {
        this.error = <any>error;
        this.auth.processing = false;
      });
  }


}
