import {AfterViewInit, Component, OnInit, ViewEncapsulation} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import 'rxjs/add/operator/switchMap';
import {Event} from '../models/event';
import {StorageService} from '../../../providers/storage-service';
import {EventService} from '../services/event.service';
import {AuthService} from '../../../providers/auth-service';
import {GroupService} from '../../group/group.service';
import * as moment from 'moment';
import {DocSigningSetupComponent} from '../../document_signing/doc.signing.setup.component';
import {DocumentSigningService} from '../../document_signing/services/document.signing.service';
import {DATE_FORMATS} from '../../common/moment.date.formats';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from '@angular/material';
import {MomentDateAdapter} from '@angular/material-moment-adapter';


@Component({
  selector: 'app-event-new-component',
  templateUrl: 'event.new.template.html',
  styleUrls: ['../../notice/notice_new/notice.new.style.scss'],
  providers: [EventService, GroupService, DocumentSigningService,
    {provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE]},
    {provide: MAT_DATE_FORMATS, useValue: DATE_FORMATS}],
  encapsulation: ViewEncapsulation.None
})
export class NewEventComponent extends DocSigningSetupComponent implements OnInit, AfterViewInit {

  event: Event = this.initiateNewEvent();
  groupId = 0;
  schoolId = 0;
  eventId = 0;
  eventGroups: any[] = [];
  groups: any[] = [];
  groupSummary: any = {};
  title = 'Create new event';
  emailStatus = '1';
  step = 0;

  error = '';

  startDate = moment().add(1, 'days');
  endDate = moment().add(1, 'days');

  startTimeHours = this.padNumber((new Date()).getHours());
  startTimeMinutes = '00';

  endTimeHours = this.padNumber((new Date()).getHours());
  endTimeMinutes = '00'; // this.padNumber((new Date()).getMinutes());

  hours = Array.from({length: 24}, (v, i) => this.padNumber(i));
  minutes = ['00', '15', '30', '45']; // Array.from({length: 60}, (v, i) => i);

  paymentApplicable = false;
  allowUsersToSetPaymentAmount = false;
  appendPaymentRefUserLastName = false;

  constructor(private auth: AuthService,
              public eventService: EventService,
              public groupService: GroupService,
              public storageService: StorageService,
              public documentSigningService: DocumentSigningService,
              public router: Router,
              public route: ActivatedRoute) {

    super(documentSigningService, storageService);

  }

  ngOnInit() {
    this.getEditEventDetails();

  }

  ngAfterViewInit(): void {

    this.setupFileUploadLogic();
    this.setupDocSigningFileUploadLogic();
  }

  onEmailStatusChange(val) {
    this.emailStatus = val;
  }

  initiateNewEvent(): Event {

    const currentDate = new Date();

    return new Event(0, currentDate.toString(),
      currentDate.toString(), currentDate.toString(), '', '', '', '', 0, '', '', '', '', '',
      0, 0, 0, '', '', '', '', '', '', 1, 1, 'Make payment');

  }

  getGroupSummary(): void {

    this.groupService.getGroupSummary(this.groupId).subscribe(
      response => {

        this.groupSummary = response.group_summary;

      }, error => {
        this.error = <any>error;
      });

  }

  getEditEventDetails(): void {

    this.auth.getFirebaseTokenAsPromise().then(() => {
      this.route.params.subscribe(params => {
        this.eventId = params['event_id'];

        if (params['group_id']) {
          this.groupId = params['group_id'];
        }
        if (params['school_id']) {
          this.schoolId = params['school_id'];
        }

        this.getGroupSummary();
        this.getSigningCategories();

        if (this.eventId) {

          this.getEventDetails();
          this.getEventGroups();

        } else {
          this.loading = false;
        }

      });

    });
  }


  getEventDetails(): void {

    this.auth.processing = true;
    this.eventService.getEventDetails(this.eventId).subscribe(
      response => {
        this.auth.processing = false;
        this.event = response;
        this.event.description = this.event.description.replace("'", "").replace("'", "");
        console.log(this.event);
        this.title = 'Edit event details';

        this.loading = false;

        this.startDate = moment(new Date(this.event.start_date));
        this.endDate = moment(new Date(this.event.end_date));

        this.allowUsersToSetPaymentAmount = !!this.event.payment_allow_user_to_set;
        this.appendPaymentRefUserLastName = !!this.event.payment_ref_append_lastname;
        this.paymentApplicable = !!this.event.payment_applicable;

        if (this.event.start_date) {
          this.startTimeHours = this.padNumber((new Date(this.event.start_date)).getHours());
          this.startTimeMinutes = this.padNumber((new Date(this.event.start_date)).getMinutes());
        }

        if (this.event.end_date) {
          this.endTimeHours = this.padNumber((new Date(this.event.end_date)).getHours());
          this.endTimeMinutes = this.padNumber((new Date(this.event.end_date)).getMinutes());
        }

        if (this.event['signature_document_id'] && this.event['signature_template_id']) {
          this.getEntityDocumentForSigning(this.event, this.schoolId, this.eventId, 'event');
        }

      },
      error => {
        this.error = <any>error;
        this.auth.processing = false;
        this.loading = true;
      });


  }

  getEventGroups(): void {

    this.eventService.getEventGroups(this.eventId).subscribe(
      response => {
        this.eventGroups = response;
        console.log(this.eventGroups);

      },
      error => {
        this.error = <any>error;
      });

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
      this.storageService.uploadFileToCloudStorage('/event_documents/', file).then(
        storageInfo => {
          this.event.attachment_link = storageInfo.downloadURL;
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
      this.storageService.uploadFileToCloudStorage('/event_images/', imageFile).then(
        storageInfo => {
          console.log(this.event);
          console.log(storageInfo.downloadURL);
          this.event.image = storageInfo.downloadURL;
          console.log(this.event.image);
          this.auth.processing = false;
        }, errMessage => {
          alert(errMessage);
          this.auth.processing = false;
        });
    });


  }

  backToList(): void {
    window.history.back();
    //  this.router.navigate(['/group-events-calendar', {group_id: this.groupId, school_id: this.schoolId}]);
  }

  createEvent(): void {

    this.event.start_date = this.startDate.toDate().toString();
    this.event.end_date = this.endDate.toDate().toString();

    this.event.payment_allow_user_to_set = this.allowUsersToSetPaymentAmount ? 1 : 0;
    this.event.payment_ref_append_lastname = this.appendPaymentRefUserLastName ? 1 : 0;
    this.event.payment_applicable = this.paymentApplicable ? 1 : 0;

    const s = new Date(this.event.start_date);
    s.setHours(parseInt(this.startTimeHours, 10));
    s.setMinutes(parseInt(this.startTimeMinutes, 10));
    this.event.start_date = s.toString();

    this.event.timezone_offset = (new Date(this.event.start_date)).getTimezoneOffset();

    const e = new Date(this.event.end_date);
    e.setHours(parseInt(this.endTimeHours, 10));
    e.setMinutes(parseInt(this.endTimeMinutes, 10));
    this.event.end_date = e.toString();

    const postValue = {};
    for (const item in this.event) {
      if (this.event.hasOwnProperty(item)) {
        postValue[item] = this.event[item];
      }
    }

    postValue['group_ids'] = [this.groupId];
    postValue['school_id'] = this.schoolId;
    postValue['email_status'] = parseInt(this.emailStatus, 10);
    console.log(postValue['email_status']);

    let templateDetails = {};
    if (this.documentTemplate) {
      templateDetails = this.retrieveDocumentTemplateDetails(this.schoolId, 'event');
    }

    if (this.documentTemplate && !templateDetails) {

      alert('Please ensure all document fields are completed');
      return;
    }

    this.loading = true;

    if (!!this.eventId) {

      this.eventService.editEvent(postValue).subscribe(
        () => {
          if (this.documentTemplate && templateDetails['template_id']) {

            templateDetails['entity_id'] = this.eventId;

            if (this.event['signature_template_id'] && this.event['signature_document_id'] &&
              parseInt(this.event['signature_template_id'], 10) === parseInt(templateDetails['template_id'], 10)) {

              // this event already had a digital document attached and it WASN'T changed
              templateDetails['document_id'] = this.event['signature_document_id'];
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

            if (this.event['signature_template_id'] && this.event['signature_document_id']) {

              // this event already had a digital document attached and it's BEEN REMOVED
              templateDetails['document_id'] = this.event['signature_document_id'];
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
        error => {
          this.error = <any>error;
          this.loading = false;
        });

    } else {

      this.eventService.createEvent(postValue).subscribe(
        (result) => {
          if (this.documentTemplate && typeof this.documentTemplate['id'] !== 'undefined') {
            templateDetails['entity_id'] = result.event_id;
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
          this.error = <any>error;
          this.loading = false;
        });

    }

  }


}
