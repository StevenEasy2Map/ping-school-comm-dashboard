import {AfterViewInit, Component, EventEmitter} from '@angular/core';
import {UserService} from '../../security/user.service';
import {Router, ActivatedRoute} from '@angular/router';
import {StorageService} from '../../../providers/storage-service';
import {GroupService} from '../group.service';
import {GroupMembershipQuestion} from '../models/question';
import {AuthService} from '../../../providers/auth-service';
import {MaterializeAction} from 'angular2-materialize';
import {HelperService} from '../../../providers/helper-service';
import {GroupMembershipQuestionResponse} from '../models/response';

@Component({
  selector: 'app-group-member-details-component',
  templateUrl: 'group.member.details.component.html',
  styleUrls: ['../group.style.scss'],
  providers: [GroupService],
})
export class GroupMemberDetailsComponent implements AfterViewInit {

  error = '';
  schoolId: any = 0;
  groupId: any = 0;
  userId: any = 0;
  memberDetails: any = {};
  questions: any = [];
  responses: any = [];
  modalActions = new EventEmitter<string | MaterializeAction>();

  constructor(private auth: AuthService,
              private router: Router,
              private route: ActivatedRoute,
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

      }, rejection => {
        console.log(rejection);
        this.auth.processing = false;
      }
    );

  }

  backToList(): void {

    this.router.navigate(['/edit-group', {group_id: this.groupId, school_id: this.schoolId}]);

  }

  validateGroupMember(): void {

    // TODO: request confirmation via model

    this.auth.processing = true;

    this.groupService.adminValidateGroupMember({
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

  removeGroupMember(): void {

    // TODO: request confirmation via model

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


}
