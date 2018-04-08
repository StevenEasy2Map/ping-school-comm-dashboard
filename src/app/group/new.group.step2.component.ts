import {AfterViewInit, Component, ViewContainerRef} from '@angular/core';
import {UserService} from '../security/user.service';
import {ActivatedRoute, Router} from '@angular/router';
import {StorageService} from '../../providers/storage-service';
import {GroupService} from './group.service';
import {Group} from './models/group';
import {GroupMembershipQuestion} from './models/question';
import {AuthService} from '../../providers/auth-service';
import {Observable} from 'rxjs';
import {PlatformLocation} from '@angular/common';
import 'rxjs/add/observable/throw';
import {ModalModule} from 'ngx-modialog';
import {BootstrapModalModule, Modal, bootstrap4Mode} from '../../../node_modules/ngx-modialog/plugins/bootstrap';


bootstrap4Mode();

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
  includeHomework = false;
  groupId: any = 0;
  token = '';
  questionId: any = 0;
  questions: any = [];
  question: any = {};
  questionProcessing = false;
  newMembersVetted = false;
  loading = true;

  constructor(private auth: AuthService,
              private userService: UserService,
              private router: Router,
              private route: ActivatedRoute,
              private storageService: StorageService,
              private modal: Modal,
              private platformLocation: PlatformLocation,
              private groupService: GroupService) {
  }

  ngAfterViewInit(): void {

    this.setupImageUploadLogic();

    this.auth.getFirebaseTokenAsPromise().then(res => {

      this.route.params.subscribe(params => {
        this.schoolId = params['school_id'];
        this.schoolName = params['school_name'];
      });

      this.loading = false;

    });

  }

  createGroup(): void {

    const group = new Group(0, this.schoolId, this.groupName, this.groupDescription, this.groupImage,
      this.groupPrivate ? 1 : 0, 0, '', 1, (new Date()).toDateString(), 0, 0, 0,
      0, 0, 0, this.whatsApp,
      this.newMembersVetted ? 1 : 0, this.includeHomework ? 1 : 0);

    this.auth.processing = true;
    this.loading = true;
    this.auth.getFirebaseTokenAsPromise().then(() => {

      this.groupService.createGroup(group).subscribe(
        response => {
          this.groupId = response.groupId;
          this.token = response.token;
          console.log(this.groupId);

          const inviteURL = (this.platformLocation as any).location.origin;
          const newNoticeURL = (this.platformLocation as any).location.origin;
          const newEventURL = (this.platformLocation as any).location.origin;

          if (this.questions && Array.isArray(this.questions) && this.questions.length > 0) {

            // https://www.metaltoad.com/blog/angular-2-http-observables-and-concurrent-data-loading
            const observables = [];
            this.questions.forEach(question => {
              question.group_id = this.groupId;
              console.log(question.required);
              observables.push(this.groupService.addQuestion(question));
            });

            Observable.forkJoin(observables).subscribe(t => {
              this.sendGroupOwnerEmail(this.groupId, this.groupName, this.groupDescription,
                this.token, inviteURL, newNoticeURL, newEventURL);
            });

          } else {

            this.sendGroupOwnerEmail(this.groupId, this.groupName, this.groupDescription,
              this.token, inviteURL, newNoticeURL, newEventURL);
          }


        },
        error => {

          error = error.replace('500 - Internal Server Error ', '');
          error = JSON.parse(error);

          this.error = error.message;
          this.loading = false;
          this.auth.processing = false;

          console.log(this.error);

          const dialogRef = this.modal.alert()
            .showClose(false)
            .title('')
            .body(`
            <h5>An error has occurred</h5>
            ${this.error}`)
            .open();

          dialogRef
            .then(ref => {
              // ref.result.then(result => alert(`The result is: ${result}`));
            });


        });

    });

  }

  sendGroupOwnerEmail(groupId, groupName, groupDescription, token, inviteURL, noticeURL, eventURL) {

    const payload = {
      group_id: groupId,
      group_name: groupName,
      group_description: groupDescription,
      token: token,
      invite_url: inviteURL,
      new_notice_url: noticeURL,
      new_event_url: eventURL
    };

    this.groupService.sendNewGroupOwnerEmail(payload).subscribe(
      response => {

        this.auth.processing = false;
        this.loading = false;
        this.router.navigate(['/invite-group-member',
          {
            school_id: this.schoolId,
            group_id: this.groupId,
            token: this.token,
            invite_others: ''
          }]);

      }, err => {

        this.auth.processing = false;
        this.loading = false;
        this.router.navigate(['/invite-group-member',
          {
            school_id: this.schoolId,
            group_id: this.groupId,
            token: this.token,
            invite_others: ''
          }]);

      });


  }

  goBack() {
    window.history.back();
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
