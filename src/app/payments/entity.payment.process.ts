import {AfterViewInit, Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {AuthService} from '../../providers/auth-service';
import {PaymentsService} from './services/payments.service';
import {DateModel, DatePickerOptions} from 'ng2-datepicker';
import {PingBaseComponent} from '../ping.base.component';
import {NoticeService} from '../notice/services/notice.service';
import {MatDialog, MatSnackBar} from "@angular/material";
import {DialogAreYouSureComponent} from "../common/modals/are.you.sure.component";
import {EventService} from "../event/services/event.service";

@Component({
  selector: 'app-entity-payment-process-component',
  templateUrl: 'entity.payment.process.template.html',
  providers: [PaymentsService, NoticeService, EventService],
  styleUrls: ['payments.style.scss']
})
export class EntityPaymentProcessComponent extends PingBaseComponent implements OnInit, AfterViewInit {


  error = {};
  entityId = '';
  schoolId = '';
  groupId = '';
  entityType = '';
  entityTitle = '';
  amount = 0.0;
  reference = '';
  loading = true;
  months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  years = [];
  card = '';
  month = 1;
  year = (new Date()).getFullYear();
  cvc = '';
  entity = {};

  constructor(private auth: AuthService,
              public eventService: EventService,
              public noticeService: NoticeService,
              public paymentsService: PaymentsService,
              public router: Router,
              public route: ActivatedRoute,
              public snackBar: MatSnackBar,
              public dialog: MatDialog) {

    super();

    const currentYear = (new Date()).getFullYear();
    for (let i = currentYear; i <= currentYear + 20; i++) {
      this.years.push(i);
    }

  }

  ngOnInit() {


  }

  ngAfterViewInit(): void {

    this.auth.getFirebaseTokenAsPromise().then(() => {
      this.route.params.subscribe(params => {
        this.groupId = params['group_id'];
        this.schoolId = params['school_id'];
        this.entityId = params['entity_id'];
        this.entityType = params['entity_type'];
        this.entityTitle = params['entity_title'];
        if (this.entityType === 'notice') {
          this.getNoticeDetails();
        } else {
          this.getEventDetails();
        }
      });

    });
  }

  getNoticeDetails(): void {

    this.noticeService.getNoticeDetails(parseInt(this.entityId, 10)).subscribe(
      response => {
        this.entity = response;
        this.amount = parseFloat(this.entity['payment_amount']);
        this.reference = this.entity['payment_reference'];
        this.loading = false;
      },
      error => {
        this.error = <any>error;
        this.loading = true;
      });
  }

  getEventDetails(): void {

    this.eventService.getEventDetails(parseInt(this.entityId, 10)).subscribe(
      response => {
        this.entity = response;
        this.amount = parseFloat(this.entity['payment_amount']);
        this.reference = this.entity['payment_reference'];
        this.loading = false;
      },
      error => {
        this.error = <any>error;
        this.loading = true;
      });


  }


  makePayment() {


    if (this.entity['payment_allow_user_to_set']
      &&
      (
        (!Number.isNaN(this.entity['max_payment_amount']) && this.amount > parseFloat(this.entity['max_payment_amount']))
        ||
        (!Number.isNaN(this.entity['min_payment_amount']) && this.amount < parseFloat(this.entity['min_payment_amount']))

      )
    ) {
      return this.presentToast(`Your payment must be between $${this.entity['min_payment_amount']} and $${this.entity['max_payment_amount']}`, 2000);
    }

    if (isNaN(this.year) || isNaN(this.month)) {
      return this.presentToast('Please specify your card\'s expiry details', 2000);
    }

    if (this.year < ((new Date()).getFullYear())) {
      return this.presentToast('Your card\'s expiry date is in the past', 2000);
    }


  }

  backToList(): void {
    window.history.back();
  }

  presentToast(message, pause) {

    const snackBarRef = this.snackBar.open(message);
    setTimeout(() => {
      snackBarRef.dismiss();
    }, pause);
    return;


  }


}
