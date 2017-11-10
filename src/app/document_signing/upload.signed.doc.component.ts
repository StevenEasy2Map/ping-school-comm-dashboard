import {AfterViewInit, Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {DocumentSigningService} from './services/document.signing.service';
import {AuthService} from '../../providers/auth-service';
import {DateModel, DatePickerOptions} from 'ng2-datepicker';
import {StorageService} from '../../providers/storage-service';

@Component({
  selector: 'app-upload-signed-doc-component',
  templateUrl: 'upload.signed.doc.component.template.html',
  providers: [DocumentSigningService],
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

  signedDateModel: DateModel;
  signedDateOptions: DatePickerOptions;

  constructor(private auth: AuthService,
              public documentSignService: DocumentSigningService,
              public router: Router,
              public storageService: StorageService,
              public route: ActivatedRoute) {


  }

  ngOnInit() {

    const now = new Date();

    this.signedDateOptions = new DatePickerOptions({
      initialDate: now,
      format: 'DD MMMM, YYYY'
    });

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

    this.documentDate = new Date(this.signedDateModel.momentObj.toString()).toString();


  }


}
