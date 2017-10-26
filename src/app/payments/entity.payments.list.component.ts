import {Component} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {AuthService} from "../../providers/auth-service";
import {PaymentsService} from "./services/payments.service";

@Component({
  selector: 'entity-payments-list-list-component',
  templateUrl: 'entity.payments.list.template.html',
  providers: [PaymentsService],
  styleUrls: ['payments.style.scss']
})
export class EntityPaymentsListComponent {

  payments: any[] = [];
  paymentTotal = 0;
  paymentCurrency = '';
  paymentDetails = {};
  entityId: string = '';
  schoolId: string = '';
  groupId = '';
  paymentId: string = '';
  entityType = '';
  entityTitle = '';

  constructor(private auth: AuthService,
              public paymentsService: PaymentsService,
              public router: Router,
              public route: ActivatedRoute) {


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
      });

    });
  }

  getEntityPayments(): void {

    this.paymentsService.getPayments(this.entityId, this.entityType, this.groupId, this.schoolId,).subscribe(res => {
      this.payments = res;
      this.payments.forEach(payment => {
        this.paymentTotal += payment.amount || 0;
        this.paymentCurrency = payment.currency;
      })
    });

  }

  backToList(): void {
    this.router.navigate(['/group-notices-list', {group_id: this.groupId, school_id: this.schoolId}]);
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
