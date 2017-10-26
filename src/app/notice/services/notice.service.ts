import {AuthService} from '../../../providers/auth-service';
import {Injectable} from '@angular/core';
import {Http} from '@angular/http';
import {APIService} from '../../../providers/api-service';
import {Observable} from 'rxjs';
import {Notice} from '../models/notice';

@Injectable()
export class NoticeService extends APIService {

  constructor(public auth: AuthService, public http: Http) {
    super(auth, http);
  }

  getMyNotices(): Observable<any> {
    return this.get('/api/notice/my_notices');
  }

  getNoticeDetails(noticeId: number): Observable<any> {
    return this.get(`/api/notice/notice_details/${noticeId}`);
  }

  getNoticePayments(noticeId: number, groupId: number, schoolId: number): Observable<any> {
    return this.get(`/api/notice/notice_payments/${noticeId}/${groupId}/${schoolId}`);
  }

  getNoticePaymentDetails(paymentId: number, noticeId: number, groupId: number, schoolId: number): Observable<any> {
    return this.get(`/api/notice/notice_payment_details/${paymentId}/${noticeId}/${groupId}/${schoolId}`);
  }

  makeNoticePayment(notice: any): Observable<any> {
    return this.post(notice, '/api/notice/notice_payment');
  }

  updateNoticePaymentDetails(notice: any): Observable<any> {
    return this.post(notice, '/api/notice/update_notice_payment');
  }

  getGroupNotices(groupId: number): Observable<any> {
    return this.get(`/api/notice/group_notices/${groupId}`);
  }

  getNoticeGroups(noticeId: number): Observable<any> {
    return this.get(`/api/notice/notice_groups/${noticeId}`);
  }

  createNotice(notice: any): Observable<any> {
    return this.post(notice, '/api/notice/create_notice');
  }

  editNotice(notice: any): Observable<any> {
    return this.post(notice, '/api/notice/edit_notice');
  }

  deleteNotice(notice: any): Observable<any> {
    return this.post(notice, '/api/notice/delete_notice');
  }


}
