import {AfterViewInit, Component, OnInit, ViewEncapsulation} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import 'rxjs/add/operator/switchMap';
import {Notice} from '../models/notice';
import {StorageService} from '../../../providers/storage-service';
import {NoticeService} from '../services/notice.service';
import {AuthService} from '../../../providers/auth-service';
import {DateModel, DatePickerOptions} from 'ng2-datepicker';
import {GroupService} from '../../group/group.service';
import {DocumentSigningService} from '../../document_signing/services/document.signing.service';
import {PingBaseComponent} from '../../ping.base.component';
import * as moment from 'moment';

//  https://www.npmjs.com/package/ng2-datepicker

@Component({
  selector: 'app-homework-new-component',
  templateUrl: './homework.new.template.html',
  styleUrls: ['../../notice/notice_new/notice.new.style.scss'],
  providers: [NoticeService, GroupService, DocumentSigningService],
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

  showDateModel: DateModel;
  showDateOptions: DatePickerOptions;

  hideDateModel: DateModel;
  hideDateOptions: DatePickerOptions;

  constructor(private auth: AuthService,
              public noticeService: NoticeService,
              public groupService: GroupService,
              public storageService: StorageService,
              public router: Router,
              public route: ActivatedRoute) {

    super();

  }

  ngOnInit() {

    const showDate = new Date();
    const hideDate = new Date();
    hideDate.setDate(hideDate.getDate() + 1);

    this.showDateOptions = new DatePickerOptions({
      initialDate: showDate,
      format: 'DD MMMM, YYYY'
    });
    this.hideDateOptions = new DatePickerOptions({
      initialDate: hideDate,
      format: 'DD MMMM, YYYY'
    });

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
      '', 0, '', '', '', '', '', 0, 0, '', '', '', '', '', '', 1, 1);

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

        this.showDateOptions = new DatePickerOptions({
          initialDate: new Date(this.notice.show_date),
          format: 'DD MMMM, YYYY'
        });

        this.hideDateOptions = new DatePickerOptions({
          initialDate: new Date(this.notice.hide_date),
          format: 'DD MMMM, YYYY'
        });

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

    this.notice.show_date = new Date(this.showDateModel.momentObj.toString()).toString();
    this.notice.hide_date = new Date(this.hideDateModel.momentObj.toString()).toString();

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
