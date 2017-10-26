import {Component, AfterViewInit} from '@angular/core';
import {UserService} from '../security/user.service';
import {Router, ActivatedRoute} from '@angular/router';
import {StorageService} from '../../providers/storage-service';
import {GroupService} from './group.service';
import {School} from './models/school';
import {Group} from './models/group';
import {GroupMembershipQuestion} from './models/question';
import {AuthService} from '../../providers/auth-service';

@Component({
  selector: 'new-group-step2-component',
  templateUrl: 'new.group.step2.component.html',
  styleUrls: ['group.style.scss'],
  providers: [GroupService],
})
export class NewGroupStep2Component implements AfterViewInit {

  error = '';
  schoolId = '';
  groupName = '';
  groupImage = '';
  whatsApp = '';
  groupDescription = '';
  groupPrivate = false;
  childNames = false;
  groupId: any = 0;
  token = '';
  questionId: any = 0;

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
      });

    });

  }

  createGroup(): void {

    const group = new Group(0, this.schoolId, this.groupName, this.groupDescription, this.groupImage,
      this.groupPrivate ? 1 : 0, 0, '', 1, (new Date()).toDateString(), 0, 0, 0, 0, 0, this.whatsApp);

    this.auth.processing = true;
    this.auth.getFirebaseTokenAsPromise().then(() => {

      this.groupService.createGroup(group).subscribe(
        response => {
          this.groupId = response.groupId;
          this.token = response.token;
          console.log(this.groupId);

          if (!!this.childNames) {

            this.addGroupQuestion();

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

  addGroupQuestion() {

    const question = new GroupMembershipQuestion(0, this.schoolId,
      this.groupId, true, 'Child\'s Name', 1, 1);
    this.auth.processing = true;
    this.groupService.addQuestion(question).subscribe(
      response => {
        this.questionId = response.questionId;
        console.log(this.questionId);
        this.auth.processing = false;
        this.router.navigate(['/invite-group-member',
          {
            school_id: this.schoolId,
            group_id: this.groupId,
            token: this.token,
            invite_others: false
          }]);
      },
      error => {
        this.error = <any>error;
        this.auth.processing = false;
      });


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
