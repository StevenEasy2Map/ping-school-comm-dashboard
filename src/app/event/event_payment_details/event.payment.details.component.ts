import {AfterViewInit, Component} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {EventService} from '../services/event.service';
import {FriendlyDatePipe} from '../../common/pipes/friendly.date.pipe';
import {FriendlyDateTimePipe} from '../../common/pipes/friendly.date.time.pipe';
import {Event} from '../models/event';
import {AuthService} from '../../../providers/auth-service';
import {AppSettings} from '../../app.settings';
import {HelperService} from '../../../providers/helper-service';

@Component({
  selector: 'app-event-payment-details-component',
  templateUrl: './event.payment.details.template.html',
  providers: [EventService],
  styleUrls: ['./event.payment.details.style.scss']
})
export class EventPaymentDetailsComponent implements AfterViewInit {

  schoolId = 0;
  groupId = 0;
  eventId = 0;
  paymentId = 0;
  payment: any = {};
  eventGroups: any[] = [];
  error = '';

  constructor(private auth: AuthService,
              public eventService: EventService,
              public router: Router,
              public route: ActivatedRoute) {
  }

  ngAfterViewInit(): void {

    this.auth.getFirebaseTokenAsPromise().then(() => {
      this.route.params.subscribe(params => {
        this.schoolId = params['school_id'];
        this.groupId = params['group_id'];
        this.eventId = params['event_id'];
        this.paymentId = params['payment_id'];
        this.getEventPaymentDetails();
      });
    });

  }

  getEventPaymentDetails(): void {

    this.eventService.getEventPaymentDetails(this.paymentId, this.eventId, this.groupId, this.schoolId).subscribe(
      response => {
        this.payment = response;
        this.payment.processed = !!this.payment.processed;
      },
      error => {
        this.error = <any>error;
      });

  }

  editPayment(): void {

    this.eventService.updateEventPaymentDetails({
      payment_id: this.paymentId,
      event_id: this.eventId,
      group_id: this.groupId,
      school_id: this.schoolId,
      processed: this.payment.processed ? 1 : 0,
      notes: this.payment.notes
    }).subscribe(
      response => {
        this.backToList();
      }, error => {
        this.error = <any>error;
      }
    );

  }

  backToList(): void {
    this.router.navigate(['/event-payments-list', {
      event_id: this.eventId,
      group_id: this.groupId,
      school_id: this.schoolId
    }]);
  }

}
