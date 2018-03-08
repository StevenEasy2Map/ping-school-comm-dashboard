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
  selector: 'app-entity-doc-signed-list-component',
  templateUrl: 'entity.doc.signed.list.template.html',
  providers: [DocumentSigningService,
    {provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE]},
    {provide: MAT_DATE_FORMATS, useValue: DATE_FORMATS}],
  styleUrls: ['doc.signed.style.scss']
})
export class EntityDocSignedListComponent implements OnInit, AfterViewInit {

  documents: any[] = [];
  documentDetails = {};
  entityId = '';
  schoolId = '';
  groupId = '';
  documentId = '';
  templateId = '';
  entityType = '';
  entityTitle = '';

  signDocument = '';
  signUser = 0;
  processManualSignature = false;
  outstandingSignatures = false;
  signDate = moment();

  signChartLabels: string[] = ['Signed', 'Initiated, awaiting signature', 'Not signed'];
  signChartData: number[] = [0, 0, 0];
  signChartColors : any[] = [
      {
        backgroundColor:["#95ffaa", "#6FC8CE", "#bebcbb"]
      }];
  signChartType = 'pie';

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
        this.getEntityDocuments();
        this.getDocumentDetails();
      });

    });
  }

  // events
  public chartClicked(e: any): void {
    console.log(e);
  }

  public chartHovered(e: any): void {
    console.log(e);
  }

  getDocumentDetails(): void {

    this.documentSignService.getDocumentDetails(this.documentId, this.schoolId,
      this.templateId, this.entityId, this.entityType).subscribe(res => {
      this.documentDetails = res.document;

    });

  }

  showManualSignatureControls() {

    this.processManualSignature = true;
    setTimeout(() => this.setupFileUploadLogic(), 1000);

  }

  makeManualSignature() {
    if (this.signDocument.length === 0 || !this.signUser) {
      return;
    }

    const signatureDate = this.signDate.toDate().toString();

    for (let i = 0; i < this.documents.length; i++) {

      if (this.documents[i].user_id === this.signUser) {

        this.auth.processing = true;
        const payload = {
          entity_type: this.entityType,
          entity_id: this.entityId,
          user_id: this.signUser,
          email: this.documents[i].email,
          user_name: `${this.documents[i].first_name} ${this.documents[i].last_name}`,
          document_id: this.documentId,
          signature_date: signatureDate,
          document_url: this.signDocument
        };

        this.documentSignService.createManualUserDocument(payload).subscribe(res => {
          this.processManualSignature = false;
          this.getEntityDocuments();
          this.auth.processing = false;
        });

        break;

      }

    }


  }


  setupFileUploadLogic(): void {

    const fileUpload = document.getElementById('docFileUpload');
    fileUpload.addEventListener('change', (e) => {
      const file = e.target['files'][0];
      this.auth.processing = true;
      this.storageService.uploadFileToCloudStorage('/ notice_documents /', file).then(
        storageInfo => {
          this.signDocument = storageInfo.downloadURL;
          this.auth.processing = false;
        }, errMessage => {
          alert(errMessage);
          this.auth.processing = false;
        });
    });

  }

  unsignedDocuments(itemList: any[]): any[] {
    const result: any[] = [];

    itemList.forEach(document => {
      if (!document.document_status || document.document_status !== 'complete') {
        result.push(document);
      }
    });

    return result;
  }

  backToList(): void {
    this.router.navigate(['/group-notices-list', {group_id: this.groupId, school_id: this.schoolId}]);
  }

  getEntityDocuments(): void {

    this.outstandingSignatures = false;
    this.documentSignService.getEntityUserDocuments(this.entityId, this.entityType).subscribe(res => {
      this.documents = res.documents;

      let signedTotal = 0;
      let initiatedTotal = 0;
      let notSignedTotal = 0;

      this.documents.forEach(document => {
        if (!document.document_status || document.document_status !== 'complete') {
          this.outstandingSignatures = true;
          if (!document.document_status) {
            notSignedTotal += 1;
          } else {
            initiatedTotal += 1;
          }
        } else {
          signedTotal += 1;
        }
      });

      this.signChartData = [signedTotal, initiatedTotal, notSignedTotal];

    });

  }

}
