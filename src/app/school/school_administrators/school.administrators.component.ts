import {AfterViewInit, Component} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {AuthService} from '../../../providers/auth-service';
import {SchoolService} from '../school.service';
import {Invitation} from '../../group/models/invitation';
import {Observable} from 'rxjs/Observable';
import {HelperService} from '../../../providers/helper-service';
import {MatDialog, MatSnackBar} from '@angular/material';
import {DialogErrorComponent} from "../../common/modals/dialog.error.component";
import {GroupService} from "../../group/group.service";

@Component({
  selector: 'app-school-administrators-component',
  templateUrl: 'school.administrators.component.html',
  styleUrls: ['../../group/group.style.scss'],
  providers: [SchoolService, GroupService],
})
export class SchoolAdministratorsComponent implements AfterViewInit {

  error = '';
  schoolId = '';
  schoolName = '';
  administrators: any = [];
  schoolGroups: any = [];
  loading = true;
  inviting = false;
  emailAddresses: string[] = [];
  emailAddressesToSend = [];
  role = 'member';
  motivation = '';
  selectedGroups = [];

  autocompleteInit = {
    placeholder: 'Add another address',
    secondaryPlaceholder: 'Start typing addresses...'
  };

  constructor(private auth: AuthService,
              private router: Router,
              private route: ActivatedRoute,
              public snackBar: MatSnackBar,
              public dialog: MatDialog,
              private schoolService: SchoolService,
              private groupService: GroupService) {
  }

  ngAfterViewInit(): void {

    this.auth.getFirebaseTokenAsPromise().then(() => {
      this.route.params.subscribe(params => {
        this.schoolId = params['school_id'];
        this.schoolName = params['school_name'];

        this.getSchoolAdministrators();
        this.getSchoolGroups();

      });

    });

  }

  getSchoolAdministrators(): void {

    this.auth.processing = true;
    this.schoolService.getAllPrivateSchoolAdministrators(this.schoolId).subscribe(
      response => {

        console.log(response);

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

  getSchoolGroups(): void {

    this.auth.processing = true;
    this.groupService.getSchoolGroups(this.schoolId).subscribe(
      response => {

        console.log(response);

        this.schoolGroups = response;
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
      return (alert('You cannot remove the school owner. Please contact school comm directly to do this.'));
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

  removeSchoolMember(member): void {

    if (member.role !== 'member') {
      return;
    }

    this.auth.processing = true;

    const payload = {
      school_id: this.schoolId,
      user_id: member.id
    };

    this.schoolService.removeSchoolMember(payload).subscribe(
      response => {

        this.getSchoolAdministrators();

      }, rejection => {
        console.log(rejection);
        this.auth.processing = false;
        this.loading = false;
      }
    );

  }

  inviteSchoolMembers(): void {

    if (!this.role || !this.emailAddressesToSend) {
      this.router.navigateByUrl('/home');
      return;
    }

    const observables = [];
    this.auth.processing = true;
    this.emailAddressesToSend.forEach(email => {

      observables.push(this.schoolService.inviteSchoolMember(new Invitation(parseInt(this.schoolId, 10),
        0, this.role, email, this.motivation)));

      if (Array.isArray(this.selectedGroups) && this.selectedGroups.length > 0) {

        this.selectedGroups.forEach(groupId => {

          observables.push(this.groupService.inviteGroupMember(new Invitation(parseInt(this.schoolId, 10),
            parseInt(groupId, 10),
            this.role, email, this.motivation)));

        });

      }

    });

    Observable.forkJoin(observables).subscribe(t => {

        console.log(t);

        this.snackBar.open('Your school invitations have successfully been sent!');
        setTimeout(() => {

          this.snackBar.dismiss();

          this.inviting = false;
          this.emailAddresses = [];
          this.emailAddressesToSend = [];
          this.role = 'member';
          this.motivation = '';
          this.selectedGroups = [];

          this.getSchoolAdministrators();
        }, 1500);

      },
      error => {

        error = error.replace('500 - Internal Server Error ', '');
        error = JSON.parse(error);

        this.error = error.message;
        this.loading = false;
        this.auth.processing = false;

        console.log(this.error);

        this.dialog.open(DialogErrorComponent, {
          data: {
            message: error.error_message || 'An error occurred, please try again'
          }
        });

      });

  }

  public onAdd(tag): void {

    console.log('Chip added: ' + tag);
    if (HelperService.isValidMailFormat(tag.display)) {

      let emailAddressAlreadyAdded = false;
      for (let i = 0; i < this.emailAddressesToSend.length; i++) {

        if (this.emailAddressesToSend[i] === tag.display) {
          emailAddressAlreadyAdded = true;
          break;
        }

      }
      if (!emailAddressAlreadyAdded) {
        this.emailAddressesToSend.push(tag.display);
      }

    }

  }

  public onRemove(tag): void {
    console.log('Chip deleted: ' + tag.display);

    for (let i = 0; i < this.emailAddresses.length; i++) {

      if (this.emailAddressesToSend[i] === tag.display) {
        this.emailAddressesToSend.splice(i, 1);
        break;
      }

    }
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
