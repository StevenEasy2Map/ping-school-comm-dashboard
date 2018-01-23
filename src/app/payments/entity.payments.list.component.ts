import {AfterViewInit, Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {AuthService} from '../../providers/auth-service';
import {PaymentsService} from './services/payments.service';
import {DateModel, DatePickerOptions} from 'ng2-datepicker';
import {PingBaseComponent} from "../ping.base.component";

@Component({
  selector: 'app-entity-payments-list-list-component',
  templateUrl: 'entity.payments.list.template.html',
  providers: [PaymentsService],
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

  paymentDateModel: DateModel;
  paymentDateOptions: DatePickerOptions;

  constructor(private auth: AuthService,
              public paymentsService: PaymentsService,
              public router: Router,
              public route: ActivatedRoute) {

    super();

  }

  ngOnInit() {

    const paymentDate = new Date();

    this.paymentDateOptions = new DatePickerOptions({
      initialDate: paymentDate,
      format: 'DD MMMM, YYYY'
    });

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

    this.paymentsService.getPayments(this.entityId, this.entityType, this.groupId, this.schoolId).subscribe(res => {
      this.payments = res;
      this.payments.forEach(payment => {
        payment.payment_date = this.addDateTimeZone(payment.payment_date);
        this.paymentTotal += payment.amount || 0;
        this.paymentCurrency = payment.currency;
      });
      this.loading = false;
    });

  }

  getNonPayments(): void {

    this.paymentsService.getNonPayments(this.entityId, this.entityType, this.groupId, this.schoolId).subscribe(res => {
      this.nonPayments = res;
      this.loading = false;
    });

  }

  makeManualPayment() {

    const paymentDate = new Date(this.paymentDateModel.momentObj.toString()).toString();
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
      event_id: this.entityId,
      amount: this.paymentAmount,
      payment_reference: this.paymentReference,
      user_id: this.paymentUser,
      payment_date: paymentDate
    };

    this.paymentsService.makeManualPayment(this.entityType, payload).subscribe(res => {
      this.processManualPayment = false;
      this.getEntityPayments();
    });
  }


  backToList(): void {
    window.history.back();
// this.router.navigate(['/group-notices-list', {group_id: this.groupId, school_id: this.schoolId}]);
  }

// getEntityDocuments(): void {
//
//   this.documentSignService.getEntityUserDocuments(this.entityId, this.entityType).subscribe(res => {
//     this.documents = res.documents;
//
//   });
//
// }

}
