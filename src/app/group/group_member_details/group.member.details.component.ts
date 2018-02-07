import {AfterViewInit, Component, EventEmitter} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {GroupService} from '../group.service';
import {GroupMembershipQuestion} from '../models/question';
import {AuthService} from '../../../providers/auth-service';
import {MaterializeAction} from 'angular2-materialize';
import {HelperService} from '../../../providers/helper-service';
import {GroupMembershipQuestionResponse} from '../models/response';
import {MatDialog} from "@angular/material";
import {DialogAreYouSureComponent} from "../../common/modals/are.you.sure.component";

@Component({
  selector: 'app-group-member-details-component',
  templateUrl: 'group.member.details.component.html',
  styleUrls: ['../group.style.scss'],
  providers: [GroupService],
})
export class GroupMemberDetailsComponent implements AfterViewInit {

  error = '';
  loading = true;
  schoolId: any = 0;
  groupId: any = 0;
  userId: any = 0;
  memberDetails: any = {};
  questions: any = [];
  responses: any = [];

  constructor(private auth: AuthService,
              private router: Router,
              private route: ActivatedRoute,
              public dialog: MatDialog,
              private groupService: GroupService) {
  }

  ngAfterViewInit(): void {

    this.auth.getFirebaseTokenAsPromise().then(() => {
      this.route.params.subscribe(params => {
        this.schoolId = params['school_id'];
        this.groupId = params['group_id'];
        this.userId = params['user_id'];

        this.getGroupMemberDetails();

      });

    });


  }

  getGroupMemberDetails(): void {

    this.auth.processing = true;
    this.groupService.getGroupMemberAdminDetails(this.schoolId, this.groupId, this.userId).subscribe(
      response => {

        this.memberDetails = response.group_details;
        this.questions = response.questions;
        const responses = response.responses;

        this.questions.forEach(question => {

          let questionResponse = '';
          let dateResponsed = '';
          responses.forEach(item => {

            if (item.question_id === question.id) {
              questionResponse = item.response;
              dateResponsed = HelperService.friendlyDateTime(new Date(new Date(item.date_responsed)));
            }
            ;

          });

          this.responses.push(new GroupMembershipQuestionResponse(new GroupMembershipQuestion(question.id,
            this.schoolId,
            this.groupId,
            !!question.required,
            question.question_title,
            question.multiple_responses_permitted,
            question.display_order), questionResponse, dateResponsed));

        });

        this.auth.processing = false;
        this.loading = false;

      }, rejection => {
        console.log(rejection);
        this.auth.processing = false;
        this.loading = false;
      }
    );

  }

  backToList(): void {

    window.history.back();
    // this.router.navigate(['/edit-group', {group_id: this.groupId, school_id: this.schoolId}]);

  }

  validateGroupMember(): void {


    const dialogRef = this.dialog.open(DialogAreYouSureComponent, {
      data: {
        title: 'Validate this user'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {

        this.auth.processing = true;
        this.loading = true;

        this.groupService.adminValidateGroupMember({
          group_id: this.groupId,
          school_id: this.schoolId,
          user_id: this.userId
        }).subscribe(result => {

          this.auth.processing = false;
          this.loading = false;
          this.memberDetails.validated = true;
          this.backToList();

        }, error => {
          this.loading = false;
          this.error = <any>error
          this.auth.processing = false;
        });


      }
    });


  }

  removeGroupMember(): void {

    const dialogRef = this.dialog.open(DialogAreYouSureComponent, {
      data: {
        title: 'Remove this user'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {

        this.auth.processing = true;

        this.groupService.adminRemoveGroupMember({
          group_id: this.groupId,
          school_id: this.schoolId,
          user_id: this.userId
        }).subscribe(result => {

          this.auth.processing = false;
          this.memberDetails.validated = true;
          this.backToList();

        }, error => {
          this.error = <any>error
          this.auth.processing = false;
        });
      }

    });

  }


}
