import {AfterViewInit, Component, EventEmitter} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {AuthService} from '../../../providers/auth-service';
import {MaterializeAction} from 'angular2-materialize';
import {SchoolService} from '../school.service';

@Component({
  selector: 'app-school-administrators-component',
  templateUrl: 'school.administrators.component.html',
  styleUrls: ['../../group/group.style.scss'],
  providers: [SchoolService],
})
export class SchoolAdministratorsComponent implements AfterViewInit {

  error = '';
  schoolId = '';
  schoolName = '';
  administrators: any = [];
  modalActions = new EventEmitter<string | MaterializeAction>();
  loading = true;

  constructor(private auth: AuthService,
              private router: Router,
              private route: ActivatedRoute,
              private schoolService: SchoolService) {
  }

  ngAfterViewInit(): void {

    this.auth.getFirebaseTokenAsPromise().then(() => {
      this.route.params.subscribe(params => {
        this.schoolId = params['school_id'];
        this.schoolName = params['school_name'];

        this.getSchoolAdministrators();

      });

    });

  }

  getSchoolAdministrators(): void {

    this.auth.processing = true;
    this.schoolService.getAllPrivateSchoolAdministrators(this.schoolId).subscribe(
      response => {

        this.administrators = response.administrators;
        this.auth.processing = false;
        this.loading = false;

      }, rejection => {
        console.log(rejection);
        this.auth.processing = false;
        this.loading = false;
      }
    );

  }

  goBack() {
    window.history.back();
  }

  removeSchoolAdmin(member): void {

    if (member.role === 'owner') {
      return (alert('you cannot remove the school owner. Please contact school comm directly to do this.'));
    }

    this.auth.processing = true;

    const payload = {
      school_id: this.schoolId,
      user_id: member.id
    };

    this.schoolService.removeSchoolAdministrator(payload).subscribe(
      response => {

        this.getSchoolAdministrators();

      }, rejection => {
        console.log(rejection);
        this.auth.processing = false;
        this.loading = false;
      }
    );

  }

  uninviteSchoolAdministrator(member): void {

    this.auth.processing = true;

    const payload = {
      school_id: this.schoolId,
      invite_id: member.id
    };

    this.schoolService.uninviteSchoolAdministrator(payload).subscribe(
      response => {

        this.getSchoolAdministrators();

      }, rejection => {
        console.log(rejection);
        this.auth.processing = false;
        this.loading = false;
      }
    );

  }


}
