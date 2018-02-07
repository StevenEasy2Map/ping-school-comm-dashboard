import {AfterViewInit, Component} from '@angular/core';
import {UserService} from '../../security/user.service';
import {ActivatedRoute, Router} from '@angular/router';
import {GroupService} from '../group.service';
import {AuthService} from '../../../providers/auth-service';
import {MatSnackBar} from '@angular/material';

@Component({
  selector: 'app-join-group-component',
  templateUrl: 'join.group.component.html',
  styleUrls: ['../group.style.scss'],
  providers: [GroupService],
})
export class JoinGroupComponent implements AfterViewInit {

  error = '';
  groupId: any = null;
  group: any = {};
  groupQuestions: any = [];
  groupName = '';
  token = '';
  loading = true;

  constructor(private auth: AuthService,
              private userService: UserService,
              private router: Router,
              private route: ActivatedRoute,
              private snackBar: MatSnackBar,
              private groupService: GroupService) {
  }

  ngAfterViewInit(): void {
    this.auth.getFirebaseTokenAsPromise();
  }

  joinGroup() {

    this.auth.processing = true;
    this.loading = true;

    this.groupService.joinGroupViaToken({token: this.token.trim()}).subscribe(response => {

      this.auth.processing = false;
      this.loading = false;

      if (!response) {

        const snackBarRef = this.snackBar.open('An error occurred, please try again.');
        setTimeout(() => {
          snackBarRef.dismiss();
        }, 1500);

      } else {

        this.groupQuestions = response.questions;
        this.groupName = response.group_name;
        this.groupId = response.group_id;

        if (response.result === 'OK') {

          if (response.validated && response.validated === 1) {

            const snackBarRef = this.snackBar.open(`Congratulations, you are now a member of ${response.group_name}!`);

            setTimeout(() => {
              snackBarRef.dismiss();
              this.router.navigateByUrl('/home');
            }, 1500);

          } else {

            const snackBarRef = this.snackBar.open(`Thank you, you membership of ${response.group_name} will be confirmed shortly by the group administrator!`);

            setTimeout(() => {
              snackBarRef.dismiss();
              this.router.navigateByUrl('/home');
            }, 1500);
          }

        }

      }

    }, rejection => {

      console.log(rejection);
      this.auth.processing = false;
      this.loading = false;
      this.error = `An error occurred - ${rejection}`;

    });

  }

  submitQuestionResponses() {

    for (let i = 0; i < this.groupQuestions.length; i++) {

      const question = this.groupQuestions[i];
      if (question.required === 1 && question.response.trim().length === 0) {
        const snackBarRef = this.snackBar.open('Please answer all required questions');

        setTimeout(() => {
          snackBarRef.dismiss();
          this.router.navigateByUrl('/home');
        }, 1500);
        return;
      }

    }

    this.auth.processing = true;
    this.loading = true;


    this.groupService.respondToGroupQuestions(
      {
        group_name: this.groupName,
        group_id: this.groupId,
        responses: this.groupQuestions
      }
    ).subscribe(response => {

      this.auth.processing = false;
      this.loading = false;

      if (response.validated && response.validated === 1) {

        const snackBarRef = this.snackBar.open(`Congratulations, you are now a member of ${response.group_name}!`);

        setTimeout(() => {
          snackBarRef.dismiss();
          this.router.navigateByUrl('/home');
        }, 1500);


      } else {

        const snackBarRef = this.snackBar.open(`Thank you, you membership of ${response.group_name} will be confirmed shortly by the group administrator!`);

        setTimeout(() => {
          snackBarRef.dismiss();
          this.router.navigateByUrl('/home');
        }, 1500);
      }


    }, rejection => {

      console.log(rejection);
      this.auth.processing = false;
      this.loading = false;
      this.error = `An error occurred - ${rejection}`;

    });

  }


}
