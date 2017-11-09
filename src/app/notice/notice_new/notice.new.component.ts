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
import {DocSigningSetupComponent} from '../../document_signing/doc.signing.setup.component';

//  https://www.npmjs.com/package/ng2-datepicker

@Component({
  selector: 'app-notice-new-component',
  templateUrl: './notice.new.template.html',
  styleUrls: ['./notice.new.style.scss'],
  providers: [NoticeService, GroupService, DocumentSigningService],
  encapsulation: ViewEncapsulation.None
})
export class NewNoticeComponent extends DocSigningSetupComponent implements OnInit, AfterViewInit {

  notice: Notice = this.initiateNewNotice();
  groupId = 0;
  schoolId = 0;
  noticeId = 0;
  noticeGroups: any[] = [];
  groups: any[] = [];
  groupSummary: any = {};

  showDateModel: DateModel;
  showDateOptions: DatePickerOptions;

  hideDateModel: DateModel;
  hideDateOptions: DatePickerOptions;

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

    super(documentSigningService);

  }

  ngOnInit() {

    const showDate = new Date();
    const hideDate = new Date();
    hideDate.setMonth(hideDate.getMonth() + 1);

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
      '', '', '',
      '', 0, '', '', '', '', '', 0, 0, '', '', '', '', '', '', 1);

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

        }

      });
    });
  }

  getNoticeDetails(): void {

    this.noticeService.getNoticeDetails(this.noticeId).subscribe(
      response => {
        this.notice = response;
        console.log(this.notice);

        this.allowUsersToSetPaymentAmount = !!this.notice.payment_allow_user_to_set;
        this.appendPaymentRefUserLastName = !!this.notice.payment_ref_append_lastname;
        this.paymentApplicable = !!this.notice.payment_applicable;

        this.showDateOptions = new DatePickerOptions({
          initialDate: new Date(this.notice.show_date),
          format: 'DD MMMM, YYYY'
        });

        this.hideDateOptions = new DatePickerOptions({
          initialDate: new Date(this.notice.hide_date),
          format: 'DD MMMM, YYYY'
        });

        if (this.notice['signature_document_id'] && this.notice['signature_template_id']) {
          this.getEntityDocumentForSigning(this.notice, this.schoolId, this.noticeId, 'notice');
        }

      },
      error => this.error = <any>error);

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
    this.router.navigate(['/group-notices-list', {group_id: this.groupId, school_id: this.schoolId}]);
  }

  createNotice(): void {

    this.notice.show_date = new Date(this.showDateModel.momentObj.toString()).toString();
    this.notice.hide_date = new Date(this.hideDateModel.momentObj.toString()).toString();

    this.notice.payment_allow_user_to_set = this.allowUsersToSetPaymentAmount ? 1 : 0;
    this.notice.payment_ref_append_lastname = this.appendPaymentRefUserLastName ? 1 : 0;
    this.notice.payment_applicable = this.paymentApplicable ? 1 : 1;

    const postValue = {};
    for (const item in this.notice) {
      postValue[item] = this.notice[item];
    }

    let templateDetails = {};
    if (this.documentTemplate) {
      templateDetails = this.retrieveDocumentTemplateDetails(this.schoolId);
    }

    if (this.documentTemplate && !templateDetails) {

      alert('Please ensure all document fields are completed');
      return;
    }

    postValue['group_ids'] = [this.groupId];
    postValue['school_id'] = this.schoolId;

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
                  this.backToList();
                }
              );

            } else {
              this.createDocument(templateDetails).subscribe(
                response => {
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
                  this.backToList();
                }
              );

            } else {
              this.backToList();
            }

          }

        },
        error => this.error = <any>error);

    } else {

      this.noticeService.createNotice(postValue).subscribe(
        result => {

          if (this.documentTemplate && templateDetails['template_id']) {
            templateDetails['entity_id'] = result.notice_id;
            this.createDocument(templateDetails).subscribe(
              res => {
                this.backToList();
              });
          } else {
            this.backToList();
          }

        },
        error => this.error = <any>error);

    }

  };


}
