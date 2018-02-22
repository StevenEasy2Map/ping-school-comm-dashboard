import {AfterViewInit, Component, OnInit, ViewEncapsulation} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import 'rxjs/add/operator/switchMap';
import {Notice} from '../models/notice';
import {StorageService} from '../../../providers/storage-service';
import {NoticeService} from '../services/notice.service';
import {AuthService} from '../../../providers/auth-service';
import {GroupService} from '../../group/group.service';
import {PingBaseComponent} from '../../ping.base.component';
import {MomentDateAdapter} from '@angular/material-moment-adapter';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from '@angular/material/core';
import * as moment from 'moment';
import {DATE_FORMATS} from '../../common/moment.date.formats';

@Component({
  selector: 'app-homework-new-component',
  templateUrl: './homework.new.template.html',
  styleUrls: ['../../notice/notice_new/notice.new.style.scss'],
  providers: [NoticeService, GroupService,
    {provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE]},
    {provide: MAT_DATE_FORMATS, useValue: DATE_FORMATS}],
  encapsulation: ViewEncapsulation.None
})
export class NewHomeworkComponent extends PingBaseComponent implements OnInit, AfterViewInit {

  notice: Notice = this.initiateNewNotice();
  groupId = 0;
  schoolId = 0;
  noticeId = 0;
  noticeGroups: any[] = [];
  groupSummary: any = {};
  title = 'Homework for today';
  emailStatus = '1';
  step = 0;
  error = '';

  ckEditorConfig = {
    'uiColor': '#EBEBEB',
    'toolbarGroups': [
      {'name': 'styles'},
      {'name': 'basicstyles', 'groups': ['basicstyles', 'cleanup']},
      {'name': 'links'},
      {'name': 'editing', 'groups': ['find', 'selection', 'spellchecker', 'editing']},
      {'name': 'paragraph', 'groups': ['list', 'indent', 'blocks', 'align']}
    ],
    'removeButtons': 'Source,Save,Templates,Find,Replace,Scayt,SelectAll'
  };

  showDate = moment();
  hideDate = moment().add(1, 'days');

  constructor(private auth: AuthService,
              public noticeService: NoticeService,
              public groupService: GroupService,
              public storageService: StorageService,
              public router: Router,
              public route: ActivatedRoute) {

    super();

  }

  ngOnInit() {
  }

  ngAfterViewInit(): void {

    this.setupFileUploadLogic();
    this.getEditNoticeDetails();

  }

  initiateNewNotice(): Notice {

    const showDate = new Date();
    const hideDate = new Date();
    hideDate.setMonth(hideDate.getMonth() + 1);

    return new Notice(0, showDate.toString(),
      showDate.toString(), hideDate.toString(),
      `Homework for ${moment().format('dddd Do MMM')}`, '', '',
      '', 0, '', '', '', '', '', 0, 0, '', '', '', '', '', '', 1, 1, 1, '');

  }

  getGroupSummary(): void {

    this.groupService.getGroupSummary(this.groupId).subscribe(
      response => {

        this.groupSummary = response.group_summary;

      }, error => {
        this.error = <any>error;
      });

  }

  getEditNoticeDetails(): void {

    this.auth.getFirebaseTokenAsPromise().then(() => {
      this.route.params.subscribe(params => {
        this.noticeId = params['notice_id'];
        this.groupId = params['group_id'];
        this.schoolId = params['school_id'];

        this.getGroupSummary();

        if (this.noticeId) {

          this.getNoticeDetails();
          this.getNoticeGroups();

        } else {
          this.loading = false;
        }

      });
    });
  }

  getNoticeDetails(): void {

    this.noticeService.getNoticeDetails(this.noticeId).subscribe(
      response => {
        this.notice = response;
        this.notice.description = this.notice.description.replace("'", "").replace("'", "");
        console.log(this.notice);
        this.loading = false;
        this.title = 'Edit homework item';

        this.showDate = moment(new Date(this.notice.show_date));
        this.hideDate = moment(new Date(this.notice.hide_date));

      },
      error => {
        this.error = <any>error;
        this.loading = false;
      });

  }

  getNoticeGroups(): void {

    this.noticeService.getNoticeGroups(this.noticeId).subscribe(
      response => {
        this.noticeGroups = response;
        console.log(this.noticeGroups);

      },
      error => this.error = <any>error);
  }

  setupFileUploadLogic(): void {

    const fileUpload = document.getElementById('fileUpload');
    fileUpload.addEventListener('change', (e) => {
      const file = e.target['files'][0];
      this.auth.processing = true;
      this.storageService.uploadFileToCloudStorage('/ notice_documents /', file).then(
        storageInfo => {
          this.notice.attachment_link = storageInfo.downloadURL;
          this.auth.processing = false;
        }, errMessage => {
          alert(errMessage);
          this.auth.processing = false;
        });
    });
    const imageUpload = document.getElementById('imageUpload');
    imageUpload.addEventListener('change', (e) => {
      const imageFile = e.target['files'][0];
      this.auth.processing = true;
      this.storageService.uploadFileToCloudStorage('/ notice_images /', imageFile).then(
        storageInfo => {
          console.log(this.notice);
          console.log(storageInfo.downloadURL);
          this.notice.image = storageInfo.downloadURL;
          console.log(this.notice.image);
          this.auth.processing = false;
        }, errMessage => {
          alert(errMessage);
          this.auth.processing = false;
        });
    });


  }

  backToList(): void {
    window.history.back();
    // this.router.navigate(['/group-notices-list', {group_id: this.groupId, school_id: this.schoolId}]);
  }

  createNotice(): void {

    this.notice.show_date = this.showDate.toDate().toString();
    this.notice.hide_date = this.hideDate.toDate().toString();

    const postValue = {};
    for (const item in this.notice) {
      postValue[item] = this.notice[item];
    }

    postValue['group_ids'] = [this.groupId];
    postValue['school_id'] = this.schoolId;
    postValue['email_status'] = parseInt(this.emailStatus, 10);
    this.loading = true;

    if (this.noticeId) {

      this.noticeService.editNotice(postValue).subscribe(
        result => {

          this.loading = false;
          this.backToList();

        },
        error => this.error = <any>error);

    } else {

      this.noticeService.createNotice(postValue).subscribe(
        result => {

          this.loading = false;
          this.backToList();
        },
        error => {
          this.loading = false;
          this.error = <any>error;
        });

    }

  }


}
