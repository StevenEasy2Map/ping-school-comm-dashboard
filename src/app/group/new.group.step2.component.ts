import {AfterViewInit, Component} from '@angular/core';
import {UserService} from '../security/user.service';
import {ActivatedRoute, Router} from '@angular/router';
import {StorageService} from '../../providers/storage-service';
import {GroupService} from './group.service';
import {Group} from './models/group';
import {GroupMembershipQuestion} from './models/question';
import {AuthService} from '../../providers/auth-service';
import {Observable} from 'rxjs';
import 'rxjs/add/observable/throw';

@Component({
  selector: 'app-new-group-step2-component',
  templateUrl: 'new.group.step2.component.html',
  styleUrls: ['group.style.scss'],
  providers: [GroupService],
})
export class NewGroupStep2Component implements AfterViewInit {

  error = '';
  schoolId = '';
  schoolName = '';
  groupName = '';
  groupImage = '';
  whatsApp = '';
  groupDescription = '';
  groupPrivate = false;
  childNames = false;
  groupId: any = 0;
  token = '';
  questionId: any = 0;
  questions: any = [];
  question: any = {};
  questionProcessing = false;
  newMembersVetted = false;

  constructor(private auth: AuthService,
              private userService: UserService,
              private router: Router,
              private route: ActivatedRoute,
              private storageService: StorageService,
              private groupService: GroupService) {
  }

  ngAfterViewInit(): void {

    this.setupImageUploadLogic();

    this.auth.getFirebaseTokenAsPromise().then(res => {

      this.route.params.subscribe(params => {
        this.schoolId = params['school_id'];
        this.schoolName = params['school_name'];
      });

    });

  }

  createGroup(): void {

    const group = new Group(0, this.schoolId, this.groupName, this.groupDescription, this.groupImage,
      this.groupPrivate ? 1 : 0, 0, '', 1, (new Date()).toDateString(), 0, 0, 0, 0, 0, this.whatsApp,
      this.newMembersVetted ? 1 : 0);

    this.auth.processing = true;
    this.auth.getFirebaseTokenAsPromise().then(() => {

      this.groupService.createGroup(group).subscribe(
        response => {
          this.groupId = response.groupId;
          this.token = response.token;
          console.log(this.groupId);

          if (!!this.questions) {

            // https://www.metaltoad.com/blog/angular-2-http-observables-and-concurrent-data-loading
            const observables = [];
            this.questions.forEach(question => {
              question.group_id = this.groupId;
              observables.push(this.groupService.addQuestion(question));
            });

            Observable.forkJoin(observables).subscribe(t => {

              this.auth.processing = false;
              this.router.navigate(['/invite-group-member',
                {
                  school_id: this.schoolId,
                  group_id: this.groupId,
                  token: this.token,
                  invite_others: false
                }]);

            });

          } else {

            this.auth.processing = false;
            this.router.navigate(['/invite-group-member',
              {
                school_id: this.schoolId,
                group_id: this.groupId,
                token: this.token,
                invite_others: ''
              }]);

          }


        },
        error => this.error = <any>error);

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
      '',
      true,
      '',
      1,
      99);

    this.questionProcessing = true;

  }

  saveQuestion(): void {

    if (this.question && this.question.question_title) {
      this.questions.push(this.question);
    }
    this.cancelAddEditQuestion();
  }

  setupImageUploadLogic(): void {

    const imageUpload = document.getElementById('logoUpload');
    imageUpload.addEventListener('change', (e) => {
      const file = e.target['files'][0];
      this.auth.processing = true;
      this.storageService.uploadFileToCloudStorage('/group_images/', file).then(
        storageInfo => {
          this.auth.processing = false;
          this.groupImage = storageInfo.downloadURL;

        }, errMessage => {
          alert(errMessage);
        });
    });


  }


}
