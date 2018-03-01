import {AfterViewInit, Component} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {EventService} from '../services/event.service';
import {AuthService} from '../../../providers/auth-service';
import {HelperService} from '../../../providers/helper-service';
import {DetailsBaseComponent} from '../../notice/notice_details/details.base.component';
import {DocumentSigningService} from '../../document_signing/services/document.signing.service';
import {MatSnackBar} from '@angular/material';
import {PaymentsService} from '../../payments/services/payments.service';
import {GoogleCalendarApiClientService} from '../google_calendar_api/google.calendar.api.client.service';

@Component({
  selector: 'app-event-details-component',
  templateUrl: 'event.details.template.html',
  providers: [EventService, DocumentSigningService, PaymentsService],
  styleUrls: ['event.details.style.scss']
})
export class EventDetailsComponent extends DetailsBaseComponent implements AfterViewInit {

  schoolId = 0;
  groupId = 0;
  eventId = 0;
  event: any;
  eventGroups: any[] = [];
  error = '';
  loading = true;
  feeAmount = 0;
  eventAddedToCalendar = false;

  constructor(private auth: AuthService,
              public eventService: EventService,
              public router: Router,
              public documentSigningService: DocumentSigningService,
              public googleAPIClientService: GoogleCalendarApiClientService,
              public paymentsService: PaymentsService,
              public snackBar: MatSnackBar,
              public route: ActivatedRoute) {

    super(documentSigningService, paymentsService);
    googleAPIClientService.eventAddedToCalendar$.subscribe(item => this.onEventAddedToCalendar());
    googleAPIClientService.errorEncountered$.subscribe(item => this.onCalendarErrorEncountered(item));

  }

  ngAfterViewInit(): void {

    this.auth.processing = true;
    this.auth.getFirebaseTokenAsPromise().then(() => {
      this.route.params.subscribe(params => {
        this.schoolId = params['school_id'];
        this.groupId = params['group_id'];
        this.eventId = params['event_id'];
        this.getEventDetails();
        this.getEventGroups();
      });
    });

  }

  getEventDetails(): void {

    this.eventService.getEventDetails(this.eventId).subscribe(
      event => {
        this.event = event;
        this.event.description = this.event.description.replace("'", "").replace("'", "");
        this.event.start_date = HelperService.timeZoneAdjustedDate(this.event.start_date, this.event.timezone_offset);
        this.event.end_date = HelperService.timeZoneAdjustedDate(this.event.end_date, this.event.timezone_offset);

        if (this.event.payment_amount && this.event.payment_auto_increment) {
          this.event.payment_amount = Math.round(this.event.payment_amount * 1.03);
          this.feeAmount = Math.round(this.event.payment_amount * 0.03);
        } else {
          this.feeAmount = 0;
        }

        console.log(this.event);
        this.loading = false;

      },
      error => {
        this.error = <any>error;
        this.auth.processing = false;
      });


  }

  addEventToCalendar() {
    this.googleAPIClientService.initEventInsert(this.event);
  }

  onEventAddedToCalendar() {
    this.eventAddedToCalendar = true;
    this.snackBar.open('Successfully added to your calendar', '', {duration: 1000});
  }

  onCalendarErrorEncountered(err) {
    console.log(err);
    let errorMessage = 'An error unfortunately occurred';
    if (err && err['error'] && err.error === 'popup_blocked_by_browser') {
      errorMessage = 'Please unblock the popup in the browser\'s address bar';
    }
    this.snackBar.open(errorMessage, '', {duration: 3000});
  }

  signDocument() {
    this.loading = true;
    this.digitallySignDocument(this.schoolId, this.event.signature_document_id).subscribe(
      response => {
        this.loading = false;
        this.event.signature_user_document_status = 'complete';
        this.snackBar.open('Thank you, please check your email!', '', {duration: 3000});
      },
      error => {
        this.error = <any>error;
        this.loading = false;
      });
  }

  goBack() {
    window.history.back();
  }

  pay() {
    this.loading = true;
    this.makePayment(this.event.payment_reference, 'event', this.event.id, this.event.payment_amount).then(res => {
      this.loading = false;
      this.event.amount_paid_by_user = this.event.payment_amount;
      this.snackBar.open('Thank you, your payment has been received!', '', {duration: 3000});
      this.processPayment = false;

    }, err => {
      this.error = <any>err;
      this.loading = false;
    });
  }

  getEventGroups(): void {

    this.eventService.getEventGroups(this.eventId).subscribe(
      response => {
        this.eventGroups = response;
        console.log(this.eventGroups);
        this.auth.processing = false;

      },
      error => {
        this.error = <any>error;
        this.auth.processing = false;
      });


  }


}
