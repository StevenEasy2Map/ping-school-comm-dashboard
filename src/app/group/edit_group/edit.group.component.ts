import {AfterViewInit, Component, EventEmitter} from '@angular/core';
import {UserService} from '../../security/user.service';
import {Router, ActivatedRoute} from '@angular/router';
import {StorageService} from '../../../providers/storage-service';
import {GroupService} from '../group.service';
import {Group} from '../models/group';
import {GroupMembershipQuestion} from '../models/question';
import {AuthService} from '../../../providers/auth-service';
import {MaterializeAction} from 'angular2-materialize';

@Component({
  selector: 'app-edit-group-component',
  templateUrl: 'edit.group.component.html',
  styleUrls: ['../group.style.scss'],
  providers: [GroupService],
})
export class EditGroupComponent implements AfterViewInit {

  error = '';
  schoolId = '';
  groupId: any = 0;
  group: any = {};
  members: any = [];
  questions: any = [];
  question: any = {};
  questionProcessing = false;
  modalActions = new EventEmitter<string | MaterializeAction>();


  constructor(private auth: AuthService,
              private userService: UserService,
              private router: Router,
              private route: ActivatedRoute,
              private storageService: StorageService,
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

  openModal() {
    this.modalActions.emit({action: 'modal', params: ['open']});
  }

  closeModal() {
    this.modalActions.emit({action: 'modal', params: ['close']});
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
        this.setupImageUploadLogic();
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

  editGroup(): void {

    const group = new Group(this.group.id, this.schoolId, this.group.name, this.group.description, this.group.image,
      this.group.is_private ? 1 : 0, 0, '', 1, (new Date()).toDateString(), 0, 0, 0, 0, 0, this.group.whatsapp_group_link);

    this.auth.processing = true;
    this.groupService.editGroup(group).subscribe(
      response => {
        console.log(response);
        this.auth.processing = false;
        this.router.navigate(['/']);

      },
      error => {
        this.error = <any>error
        this.auth.processing = false;
      });

  }

  editQuestion(i): void {
    this.questionProcessing = true;
    this.question = <GroupMembershipQuestion>this.questions[i];
  }

  cancelAddEditQuestion(): void {
    this.questionProcessing = false;
    this.question = null;
  }

  deleteQuestion(i): void {

    this.question = <GroupMembershipQuestion>this.questions[i];

    this.auth.processing = true;
    this.groupService.deleteQuestion(this.question).subscribe(
      response => {
        console.log(response);

        for (let i = 0; i < this.questions.length; i++) {
          if (this.questions[i].id === this.question.id) {
            this.questions.splice(i, 1);
            break;
          }
        }

        this.questionProcessing = false;
        this.question = null;
        this.auth.processing = false;
      }, error => {
        this.error = <any>error;
        this.auth.processing = false;
      });


  }

  addQuestion(): void {

    this.question = new GroupMembershipQuestion(-1,
      this.schoolId,
      this.groupId,
      true,
      '',
      1,
      99);

    this.questionProcessing = true;

  }

  addEditQuestion(): void {

    this.auth.processing = true;

    if (this.question.id !== -1) {

      this.groupService.editQuestion(this.question).subscribe(
        response => {
          console.log(response);

          for (let i = 0; i < this.questions.length; i++) {
            if (this.questions[i].id === this.question.id) {
              this.questions[i] = this.question;
              break;
            }
          }

          this.question = null;
          this.questionProcessing = false;
          this.auth.processing = false;
        }, error => {
          this.error = <any>error;
          this.auth.processing = false;
        });

    } else {

      this.groupService.addQuestion(this.question).subscribe(
        response => {
          console.log(response);
          this.questions.push(this.question);
          this.question = null;
          this.questionProcessing = false;
          this.auth.processing = false;
        }, error => {
          this.error = <any>error;
          this.auth.processing = false;
        });

    }

  }

  /*addGroupQuestion() {

   let question = new GroupMembershipQuestion(0, this.schoolId,
   this.groupId, parseInt(this.schoolId), 'Child's Name', 1, 1);
   this.groupService.addQuestion(question).subscribe(
   response => {
   this.questionId = response.questionId;
   console.log(this.questionId);
   this.router.navigate(['/invite-group-member',
   {
   school_id: this.schoolId,
   group_id: this.groupId,
   token: this.token
   }]);
   },
   error => this.error = <any>error);


   }*/

  setupImageUploadLogic(): void {

    const imageUpload = document.getElementById('logoUpload');
    imageUpload.addEventListener('change', (e) => {
      let file = e.target['files'][0];
      this.auth.processing = true;
      this.storageService.uploadFileToCloudStorage('/group_images/', file).then(
        storageInfo => {
          this.group.image = storageInfo.downloadURL;
          this.auth.processing = false;

        }, errMessage => {
          alert(errMessage);
          this.auth.processing = false;
        });
    });


  }


}
