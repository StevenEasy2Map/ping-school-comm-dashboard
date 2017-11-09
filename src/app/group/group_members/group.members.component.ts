import {AfterViewInit, Component, EventEmitter} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {GroupService} from '../group.service';
import {GroupMembershipQuestion} from '../models/question';
import {AuthService} from '../../../providers/auth-service';
import {MaterializeAction} from 'angular2-materialize';

@Component({
  selector: 'app-group-members-component',
  templateUrl: 'group.members.component.html',
  styleUrls: ['../group.style.scss'],
  providers: [GroupService],
})
export class GroupMembersComponent implements AfterViewInit {

  error = '';
  schoolId = '';
  groupId: any = 0;
  group: any = {};
  members: any = [];
  questions: any = [];
  question: any = {};
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

        this.getGroupDetails();

      });

    });

  }

  getGroupDetails(): void {

    this.auth.processing = true;
    this.groupService.getGroupAdminDetails(this.groupId, this.schoolId).subscribe(
      response => {

        this.group = response.group;
        this.members = response.members;

        response.questions.forEach(question => {

          this.questions.push(new GroupMembershipQuestion(question.id,
            this.schoolId,
            this.groupId,
            !!question.required,
            question.question_title,
            question.multiple_responses_permitted,
            question.display_order));
        });

        this.group.is_private = !!this.group.is_private;
        this.group.active = !!this.group.active;
        this.auth.processing = false;

      }, rejection => {
        console.log(rejection);
        this.auth.processing = false;
      }
    );

  }

  viewMemberDetails(member): void {

    this.router.navigate(['/group-member-details', {group_id: this.groupId, school_id: this.schoolId, user_id: member['user_id']}]);
  }


}
