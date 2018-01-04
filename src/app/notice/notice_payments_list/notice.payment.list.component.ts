import {Component, EventEmitter} from '@angular/core';

import {Router, ActivatedRoute} from '@angular/router';
import {NoticeService} from '../services/notice.service';
import {Notice} from '../models/notice';

import {FriendlyDatePipe} from '../../common/pipes/friendly.date.pipe';
import {EllipsisPipe} from '../../common/pipes/ellipsis.pipe';
import {AuthService} from '../../../providers/auth-service';
import {MaterializeAction} from 'angular2-materialize';

@Component({
  selector: 'app-notice-payment-list-component',
  templateUrl: 'notice.payment.list.template.html',
  providers: [NoticeService],
  styleUrls: ['notice.payment.list.style.scss']
})
export class NoticePaymentListComponent {

  noticePayments: any = [];
  noticeId = '';
  groupId = '';
  schoolId = '';

  constructor(private auth: AuthService,
              public noticeService: NoticeService,
              public router: Router,
              public route: ActivatedRoute) {

    this.getNoticePayments();

  }

  getNoticePayments(): void {

    this.auth.getFirebaseTokenAsPromise().then(() => {
      this.route.params.subscribe(params => {
        this.groupId = params['group_id'];
        this.schoolId = params['school_id'];
        this.noticeId = params['notice_id'];

        this.noticeService.getNoticePayments(parseInt(this.noticeId), parseInt(this.groupId), parseInt(this.schoolId)).subscribe(res => {
          this.noticePayments = res;

          this.noticePayments.sort((a, b) => {
            return b.payment_date - a.payment_date;
          })

        });

      });

    });

  }

  editNoticePayment(payment): void {
    this.router.navigate(['/notice-payment-edit', {
      notice_id: this.noticeId, group_id: this.groupId,
      school_id: this.schoolId, notice_payment_id: payment.payment_id
    }]);
  }

  setLineStyle(payment: any): any {

    if (payment.processed) {
      return {'background-color': '#6ed67d'};
    }
    return {};

  }

  viewNoticePaymentDetails(payment): void {

    this.router.navigate(['/notice-payment-details', {
      notice_id: this.noticeId, group_id: this.groupId,
      school_id: this.schoolId, payment_id: payment.payment_id
    }]);

  }

}
