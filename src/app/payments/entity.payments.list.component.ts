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
import {NoticeService} from "../notice/services/notice.service";
import {EventService} from "../event/services/event.service";
import {GroupService} from "../group/group.service";

@Component({
  selector: 'app-entity-payments-list-list-component',
  templateUrl: 'entity.payments.list.template.html',
  providers: [PaymentsService, NoticeService, EventService, GroupService,
    {provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE]},
    {provide: MAT_DATE_FORMATS, useValue: DATE_FORMATS}],
  styleUrls: ['payments.style.scss']
})
export class EntityPaymentsListComponent extends PingBaseComponent implements OnInit, AfterViewInit {

  payments: any[] = [];
  paymentTotal = 0;
  paymentCurrency = '';
  entityId = '';
  schoolId = '';
  groupId = '';
  entityType = '';
  entityTitle = '';
  loading = true;
  nonPayments = [];
  paymentAmount = 0;
  paymentUser = 0;
  paymentType = 'Cash';
  paymentReference = '';
  processManualPayment = false;
  paymentDate = moment();
  paymentTypes = ['Cash', 'EFT'];
  memberCount = 0;

  paymentsMade = 0;

  paymentChartLabels: string[] = ['Credit Card', 'EFT', 'Cash'];
  paymentChartData: number[] = [0, 0, 0];
  paymentChartType = 'pie';


  memberChartLabels: string[] = ['Paid', 'Not Paid'];
  memberChartData: number[] = [0, 0];
  memberChartType = 'doughnut';


  constructor(private auth: AuthService,
              public paymentsService: PaymentsService,
              public router: Router,
              public route: ActivatedRoute,
              public snackBar: MatSnackBar,
              public noticeService: NoticeService,
              public groupService: GroupService,
              public eventService: EventService,
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

        const getEntityPayments = this.getEntityPayments.bind(this);
        const getNonPayments = this.getNonPayments.bind(this);
        const getEntityDetails = this.getEntityDetails.bind(this);
        const getGroupSummary = this.getGroupSummary.bind(this);

        getEntityPayments()
          .then(getNonPayments)
          .then(getEntityDetails)
          .then(getGroupSummary)
          .then(() => {
            this.loading = false;
          })
          .catch(err => {
            console.log(err);
            this.loading = false;
          });
      });

    });
  }

  getEntityPayments(): Promise<any> {

    return new Promise((resolve, reject) => {

      this.paymentsService.getPayments(this.entityId,
        this.entityType,
        this.groupId, this.schoolId).subscribe(res => {
        this.payments = res;
        this.paymentTotal = 0;

        const cashPayments = this.payments.filter((payment) => payment.payment_type === 'Cash');
        const cardPayments = this.payments.filter((payment) => payment.payment_type === 'Credit Card');
        const eftPayments = this.payments.filter((payment) => payment.payment_type === 'EFT');

        let cash = 0, card = 0, eft = 0;
        cashPayments.forEach(item => cash += (item.amount - item.amount_refunded));
        cardPayments.forEach(item => card += (item.amount - item.amount_refunded));
        eftPayments.forEach(item => eft += (item.amount - item.amount_refunded));

        this.paymentChartData = [card, eft, cash];

        this.payments.forEach(payment => {
          payment.payment_date = this.addDateTimeZone(payment.payment_date);
          this.paymentTotal += payment.amount || 0;
          this.paymentCurrency = payment.currency;
        });
      }, err => {
        reject(err);
      });

      resolve(true);

    });

  }

  getNonPayments(): Promise<any> {

    return new Promise((resolve, reject) => {

      this.paymentsService.getNonPayments(this.entityId,
        this.entityType, this.groupId,
        this.schoolId).subscribe(res => {
        this.nonPayments = res;

        res.forEach(item => {

          this.payments.push({
            first_name: item.first_name,
            last_name: item.last_name,
            email: item.email,
            payment_reference: '-',
            payment_type: '**not paid**'
          });

        });

        this.payments.sort((a, b) => {
          if (a.last_name.toUpperCase() < b.last_name.toUpperCase()) {
            return -1;
          }
          if (a.last_name.toUpperCase() > b.last_name.toUpperCase()) {
            return 1;
          }
          return 0;
        });

        resolve(true);
      }, err => {
        reject(err);
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

  getEntityDetails(): Promise<any> {

    return new Promise((resolve, reject) => {

      if (this.entityType === 'notice') {

        this.noticeService.getNoticeDetails(parseInt(this.entityId, 10)).subscribe(
          notice => {

            this.paymentAmount = notice.payment_amount;
            this.paymentReference = notice.payment_reference;
            this.paymentsMade = notice.payments_made || 0;
            resolve(true);

          },
          error => {
            reject(error);
          });

      } else {

        this.eventService.getEventDetails(parseInt(this.entityId, 10)).subscribe(
          event => {

            this.paymentAmount = event.payment_amount;
            this.paymentReference = event.payment_reference;
            this.paymentsMade = event.payments_made || 0;
            resolve(true);

          },
          error => {

            reject(error);
          });

      }
    });


  }

  getGroupSummary(): Promise<any> {

    return new Promise((resolve, reject) => {

      this.groupService.getGroupSummary(parseInt(this.groupId, 10)).subscribe(
        response => {

          const groupSummary = response.group_summary;
          console.log(groupSummary);
          this.memberCount = groupSummary.member_count;

          const paid = this.paymentsMade;
          const notPaid = this.memberCount - this.paymentsMade;
          this.memberChartData = [paid, notPaid];
          resolve(true);

        }, error => {
          reject(error);
        });

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
            this.loading = false;
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
      payment_date: paymentDate,
      payment_type: this.paymentType
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
