import {AfterViewInit, Component, OnInit, ViewEncapsulation} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import 'rxjs/add/operator/switchMap';
import {Notice} from '../models/notice';
import {StorageService} from '../../../providers/storage-service';
import {NoticeService} from '../services/notice.service';
import {AuthService} from '../../../providers/auth-service';
import {GroupService} from '../../group/group.service';
import {DocumentSigningService} from '../../document_signing/services/document.signing.service';
import {DocSigningSetupComponent} from '../../document_signing/doc.signing.setup.component';
import {MomentDateAdapter} from '@angular/material-moment-adapter';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from '@angular/material/core';
import * as moment from 'moment';
import {DATE_FORMATS} from '../../common/moment.date.formats';

@Component({
  selector: 'app-notice-new-component',
  templateUrl: './notice.new.template.html',
  styleUrls: ['./notice.new.style.scss'],
  providers: [NoticeService, GroupService, DocumentSigningService,
    {provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE]},
    {provide: MAT_DATE_FORMATS, useValue: DATE_FORMATS}],
  encapsulation: ViewEncapsulation.None
})
export class NewNoticeComponent extends DocSigningSetupComponent implements OnInit, AfterViewInit {

  showDate = moment();
  hideDate = moment().add(1, 'months');

  notice: Notice = this.initiateNewNotice();
  groupId = 0;
  schoolId = 0;
  noticeId = 0;
  noticeGroups: any[] = [];
  groups: any[] = [];
  groupSummary: any = {};
  title = 'Create new notice';
  emailStatus = '1';
  step = 0;

  paymentApplicable = false;
  allowUsersToSetPaymentAmount = false;
  appendPaymentRefUserLastName = false;

  constructor(private auth: AuthService,
              public noticeService: NoticeService,
              public groupService: GroupService,
              public storageService: StorageService,
              public documentSigningService: DocumentSigningService,
              public router: Router,
              public route: ActivatedRoute) {

    super(documentSigningService, storageService);

  }


  ngOnInit() {
    this.getEditNoticeDetails();
  }

  ngAfterViewInit(): void {

    this.setupFileUploadLogic();
    this.setupDocSigningFileUploadLogic();
  }


  initiateNewNotice(): Notice {

    const showDate = new Date();
    const hideDate = new Date();
    hideDate.setMonth(hideDate.getMonth() + 1);

    return new Notice(0, showDate.toString(),
      showDate.toString(), hideDate.toString(),
      '', '', '',
      '', 0, '', '', '', '', '', 0, 0, '', '', '', '', '', '', 1, 0, 1, 'Make payment');

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
        this.getSigningCategories();

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
        this.title = 'Edit notice';

        this.allowUsersToSetPaymentAmount = !!this.notice.payment_allow_user_to_set;
        this.appendPaymentRefUserLastName = !!this.notice.payment_ref_append_lastname;
        this.paymentApplicable = !!this.notice.payment_applicable;

        this.showDate = moment(new Date(this.notice.show_date));
        this.hideDate = moment(new Date(this.notice.hide_date));

        if (this.notice['signature_document_id'] && this.notice['signature_template_id']) {
          this.getEntityDocumentForSigning(this.notice, this.schoolId, this.noticeId, 'notice');
        }

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


  getMyGroups(): void {

    this.groupService.getMyGroups().subscribe(
      results => {
        this.groups = results;

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

    this.notice.payment_allow_user_to_set = this.allowUsersToSetPaymentAmount ? 1 : 0;
    this.notice.payment_ref_append_lastname = this.appendPaymentRefUserLastName ? 1 : 0;
    this.notice.payment_applicable = this.paymentApplicable ? 1 : 0;

    const postValue = {};
    for (const item in this.notice) {
      postValue[item] = this.notice[item];
    }

    let templateDetails = {};
    if (this.documentTemplate) {
      templateDetails = this.retrieveDocumentTemplateDetails(this.schoolId, 'notice');
    }

    if (this.documentTemplate && !templateDetails) {

      alert('Please ensure all document fields are completed');
      return;
    }

    postValue['group_ids'] = [this.groupId];
    postValue['school_id'] = this.schoolId;
    postValue['email_status'] = parseInt(this.emailStatus, 10);
    this.loading = true;

    if (this.noticeId) {

      this.noticeService.editNotice(postValue).subscribe(
        result => {

          if (this.documentTemplate && templateDetails['template_id']) {

            templateDetails['entity_id'] = this.noticeId;

            if (this.notice['signature_template_id'] && this.notice['signature_document_id'] &&
              parseInt(this.notice['signature_template_id'], 10) === parseInt(templateDetails['template_id'], 10)) {

              // this notice already had a digital document attached and it WASN'T changed
              templateDetails['document_id'] = this.notice['signature_document_id'];
              this.updateDocument(templateDetails).subscribe(
                response => {
                  this.loading = false;
                  this.backToList();
                }
              );

            } else {
              this.createDocument(templateDetails).subscribe(
                response => {
                  this.loading = false;
                  this.backToList();
                }
              );
            }


          } else {

            if (this.notice['signature_template_id'] && this.notice['signature_document_id']) {

              // this notice already had a digital document attached and it's BEEN REMOVED
              templateDetails['document_id'] = this.notice['signature_document_id'];
              this.removeDocument(templateDetails).subscribe(
                response => {
                  this.loading = false;
                  this.backToList();
                }
              );

            } else {
              this.loading = false;
              this.backToList();
            }

          }

        },
        error => this.error = <any>error);

    } else {

      this.noticeService.createNotice(postValue).subscribe(
        result => {

          if (this.documentTemplate && templateDetails['template_id'] && typeof this.documentTemplate['id'] !== 'undefined') {
            templateDetails['entity_id'] = result.notice_id;
            this.createDocument(templateDetails).subscribe(
              res => {
                this.loading = false;
                this.backToList();
              });
          } else {
            this.loading = false;
            this.backToList();
          }

        },
        error => {
          this.loading = false;
          this.error = <any>error;
        });

    }

  }


}
