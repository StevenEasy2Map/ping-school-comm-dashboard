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

    if (entityType === 'notice') {
      return this.get(`/api/notice/notice_payments/${entityId}/${groupId}/${schoolId}`);
    } else {
      return this.get(`/api/event/event_payments/${entityId}/${groupId}/${schoolId}`);
    }

  }

  getPaymentDetails(paymentId: string, entityId: string, entityType: string, groupId: string, schoolId: string): Observable<any> {

    if (entityType === 'notice') {
      return this.get(`/api/notice/notice_payment_details/${paymentId}/${entityId}/${groupId}/${schoolId}`);
    } else {
      return this.get(`/api/event/event_payment_details/${paymentId}/${entityId}/${groupId}/${schoolId}`);
    }

  }

  makeManualPayment(entityType: string, payload: any): Observable<any> {

    if (entityType === 'notice') {
      return this.post(payload, '/api/notice/notice_manual_payment');
    } else {
      return this.post(payload, '/api/event/event_manual_payment');
    }


  }

  getNonPayments(entityId: string, entityType: string, groupId: string, schoolId: string): Observable<any> {

    if (entityType === 'notice') {
      return this.get(`/api/notice/notice_non_payments/${entityId}/${groupId}/${schoolId}`);
    } else {
      return this.get(`/api/event/event_non_payments/${entityId}/${groupId}/${schoolId}`);
    }

  }

}
