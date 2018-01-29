import {AuthService} from "../../../providers/auth-service";
import {Injectable} from '@angular/core';
import {Http} from '@angular/http';
import {APIService} from "../../../providers/api-service";
import {Observable} from "rxjs";

@Injectable()
export class PaymentsService extends APIService {

  constructor(public auth: AuthService, public http: Http) {
    super(auth, http);
  }

  getPayments(entityId: string, entityType: string, groupId: string, schoolId: string): Observable<any> {

    return this.get(`/api/payment/payments/${entityType}/${entityId}/${groupId}/${schoolId}`);

  }

  getPaymentDetails(paymentId: string, entityId: string, entityType: string, groupId: string, schoolId: string): Observable<any> {

    return this.get(`/api/payment/payment_details/${entityType}/${paymentId}/${entityId}/${groupId}/${schoolId}`);

  }

  makeManualPayment(payload: any): Observable<any> {

    return this.post(payload, '/api/payment/manual_payment');

  }

  makePayment(payload: any): Observable<any> {

    return this.post(payload, '/api/payment/payment');

  }

  refundPayment(payload: any): Observable<any> {

    return this.post(payload, '/api/payment/refund');

  }

  getNonPayments(entityId: string, entityType: string, groupId: string, schoolId: string): Observable<any> {

    return this.get(`/api/payment/non_payments/${entityType}/${entityId}/${groupId}/${schoolId}`);

  }

}
