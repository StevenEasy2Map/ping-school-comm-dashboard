import {AfterViewInit, Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {AuthService} from '../../providers/auth-service';
import {PaymentsService} from './services/payments.service';
import {PingBaseComponent} from '../ping.base.component';
import {MatDialog, MatSnackBar} from '@angular/material';
import {DialogAreYouSureComponent} from '../common/modals/are.you.sure.component';

import {MomentDateAdapter} from '@angular/material-moment-adapter';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from '@angular/material/core';
import * as moment from 'moment';
import {DATE_FORMATS} from '../common/moment.date.formats';

@Component({
  selector: 'app-entity-payments-list-list-component',
  templateUrl: 'entity.payments.list.template.html',
  providers: [PaymentsService,
    {provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE]},
    {provide: MAT_DATE_FORMATS, useValue: DATE_FORMATS}],
  styleUrls: ['payments.style.scss']
})
export class EntityPaymentsListComponent extends PingBaseComponent implements OnInit, AfterViewInit {

  payments: any[] = [];
  paymentTotal = 0;
  paymentCurrency = '';
  paymentDetails = {};
  entityId = '';
  schoolId = '';
  groupId = '';
  paymentId = '';
  entityType = '';
  entityTitle = '';
  loading = true;
  nonPayments = [];
  paymentAmount = 0;
  paymentUser = 0;
  paymentReference = '';
  processManualPayment = false;
  paymentDate = moment();

  constructor(private auth: AuthService,
              public paymentsService: PaymentsService,
              public router: Router,
              public route: ActivatedRoute,
              public snackBar: MatSnackBar,
              public dialog: MatDialog) {

    super();

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
        this.getEntityPayments();
        this.getNonPayments();
      });

    });
  }

  getEntityPayments(): void {

    this.paymentsService.getPayments(this.entityId,
      this.entityType,
      this.groupId, this.schoolId).subscribe(res => {
      this.payments = res;
      this.paymentTotal = 0;
      this.payments.forEach(payment => {
        payment.payment_date = this.addDateTimeZone(payment.payment_date);
        this.paymentTotal += payment.amount || 0;
        this.paymentCurrency = payment.currency;
      });
      this.loading = false;
    });

  }

  getNonPayments(): void {

    this.paymentsService.getNonPayments(this.entityId,
      this.entityType, this.groupId,
      this.schoolId).subscribe(res => {
      this.nonPayments = res;
      this.loading = false;
    });

  }

  refundPayment($event, paymentId) {

    $event.preventDefault();

    const dialogRef = this.dialog.open(DialogAreYouSureComponent, {
      data: {
        title: 'Refund Payment'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loading = true;
        const payload = {
          entity_type: this.entityType,
          payment_id: paymentId,
          entity_id: this.entityId
        };
        this.paymentsService.refundPayment(payload).subscribe(res => {
          this.processManualPayment = false;
          this.snackBar.open('Payment successfully refunded');
          setTimeout(() => {
            this.snackBar.dismiss();
          }, 1500);
          this.getEntityPayments();
          this.getNonPayments();
        });
      }
    });


  }

  makeManualPayment() {

    const paymentDate = this.paymentDate.toDate().toString();
    this.paymentAmount = parseFloat(this.paymentAmount.toString());

    if (!Number.isFinite(this.paymentAmount) || this.paymentAmount < 0) {
      return;
    }

    if (this.paymentReference.trim().length === 0) {
      return;
    }
    if (this.paymentUser === 0) {
      return;
    }

    this.loading = true;

    const payload = {
      entity_type: this.entityType,
      entity_id: this.entityId,
      amount: this.paymentAmount,
      payment_reference: this.paymentReference,
      user_id: this.paymentUser,
      payment_date: paymentDate
    };

    this.paymentsService.makeManualPayment(payload).subscribe(res => {
      this.processManualPayment = false;
      this.getEntityPayments();
    });
  }

  backToList(): void {
    window.history.back();
  }


}
