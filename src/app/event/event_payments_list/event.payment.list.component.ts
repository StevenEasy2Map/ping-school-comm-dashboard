import {Component, EventEmitter} from '@angular/core';

import {Router, ActivatedRoute} from '@angular/router';
import {EventService} from '../services/event.service';
import {Event} from '../models/event';

import {FriendlyDatePipe} from '../../common/pipes/friendly.date.pipe';
import {EllipsisPipe} from '../../common/pipes/ellipsis.pipe';
import {AuthService} from '../../../providers/auth-service';
import {MaterializeAction} from 'angular2-materialize';

@Component({
  selector: 'app-event-payment-list-component',
  templateUrl: 'event.payment.list.template.html',
  providers: [EventService],
  styleUrls: ['event.payment.list.style.scss']
})
export class EventPaymentListComponent {

  eventPayments: any = [];
  eventId = '';
  groupId = '';
  schoolId = '';

  constructor(private auth: AuthService,
              public eventService: EventService,
              public router: Router,
              public route: ActivatedRoute) {

    this.getEventPayments();

  }

  getEventPayments(): void {

    this.auth.getFirebaseTokenAsPromise().then(() => {
      this.route.params.subscribe(params => {
        this.groupId = params['group_id'];
        this.schoolId = params['school_id'];
        this.eventId = params['event_id'];

        this.eventService.getEventPayments(
          parseInt(this.eventId),
          parseInt(this.groupId),
          parseInt(this.schoolId)).subscribe(res => {
          this.eventPayments = res;

          this.eventPayments.sort((a, b) => {
            return b.payment_date - a.payment_date;
          })

        });

      });

    });

  }

  editEventPayment(payment): void {
    this.router.navigate(['/event-payment-edit', {
      event_id: this.eventId, group_id: this.groupId,
      school_id: this.schoolId, event_payment_id: payment.payment_id
    }]);
  }

  setLineStyle(payment: any): any {

    if (payment.processed) {
      return {'background-color': '#6ed67d'};
    }
    return {};

  }

  viewEventPaymentDetails(payment): void {

    this.router.navigate(['/event-payment-details', {
      event_id: this.eventId, group_id: this.groupId,
      school_id: this.schoolId, payment_id: payment.payment_id
    }]);

  }

}
