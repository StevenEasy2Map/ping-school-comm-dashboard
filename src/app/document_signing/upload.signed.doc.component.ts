import {AfterViewInit, Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {DocumentSigningService} from './services/document.signing.service';
import {AuthService} from '../../providers/auth-service';
import {StorageService} from '../../providers/storage-service';
import {MomentDateAdapter} from '@angular/material-moment-adapter';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from '@angular/material/core';
import * as moment from 'moment';
import {DATE_FORMATS} from '../common/moment.date.formats';

@Component({
  selector: 'app-upload-signed-doc-component',
  templateUrl: 'upload.signed.document.template.html',
  providers: [DocumentSigningService,
    {provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE]},
    {provide: MAT_DATE_FORMATS, useValue: DATE_FORMATS}],
  styleUrls: ['doc.signed.style.scss']
})
export class UploadSignedDocComponent implements OnInit, AfterViewInit {

  documentUrl = '';
  documentDate = '';
  documentDetails = {};
  entityId = '';
  schoolId = '';
  groupId = '';
  documentId = '';
  templateId = '';
  entityType = '';
  entityTitle = '';
  userId = '';
  userEmail = '';
  userName = '';
  signDate = moment();

  constructor(private auth: AuthService,
              public documentSignService: DocumentSigningService,
              public router: Router,
              public storageService: StorageService,
              public route: ActivatedRoute) {
  }

  ngOnInit() {
  }

  ngAfterViewInit(): void {

    this.auth.getFirebaseTokenAsPromise().then(() => {
      this.route.params.subscribe(params => {
        this.groupId = params['group_id'];
        this.schoolId = params['school_id'];
        this.entityId = params['entity_id'];
        this.documentId = params['document_id'];
        this.templateId = params['template_id'];
        this.entityType = params['entity_type'];
        this.entityTitle = params['entity_title'];
        this.userId = params['user_id'];
        this.userEmail = params['user_email'];
        this.userName = params['user_name'];
        this.getDocumentDetails();
        this.setupFileUploadLogic();
      });

    });
  }

  setupFileUploadLogic(): void {

    const fileUpload = document.getElementById('docUpload');
    fileUpload.addEventListener('change', (e) => {
      const file = e.target['files'][0];
      this.auth.processing = true;
      this.storageService.uploadFileToCloudStorage('/ signed_documents /', file).then(
        storageInfo => {
          this.documentUrl = storageInfo.downloadURL;
          this.auth.processing = false;
        }, errMessage => {
          alert(errMessage);
          this.auth.processing = false;
        });
    });

  }

  goBack() {
    window.history.back();
  }

  getDocumentDetails(): void {

    this.documentSignService.getDocumentDetails(this.documentId, this.schoolId,
      this.templateId, this.entityId, this.entityType).subscribe(res => {
      this.documentDetails = res.document;

    });

  }

  saveDocument() {

    if (!this.documentUrl) {
      return;
    }

    this.documentDate = this.signDate.toDate().toString();


  }


}
