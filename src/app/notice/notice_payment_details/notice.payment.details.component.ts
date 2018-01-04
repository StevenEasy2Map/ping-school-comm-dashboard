import {AfterViewInit, Component} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {NoticeService} from '../services/notice.service';
import {FriendlyDatePipe} from '../../common/pipes/friendly.date.pipe';
import {FriendlyDateTimePipe} from '../../common/pipes/friendly.date.time.pipe';
import {Notice} from '../models/notice';
import {AuthService} from '../../../providers/auth-service';
import {AppSettings} from '../../app.settings';
import {HelperService} from '../../../providers/helper-service';

@Component({
  selector: 'app-notice-payment-details-component',
  templateUrl: './notice.payment.details.template.html',
  providers: [NoticeService],
  styleUrls: ['./notice.payment.details.style.scss']
})
export class NoticePaymentDetailsComponent implements AfterViewInit {

  schoolId = 0;
  groupId = 0;
  noticeId = 0;
  paymentId = 0;
  payment: any = {};
  noticeGroups: any[] = [];
  error = '';

  constructor(private auth: AuthService,
              public noticeService: NoticeService,
              public router: Router,
              public route: ActivatedRoute) {
  }

  ngAfterViewInit(): void {

    this.auth.getFirebaseTokenAsPromise().then(() => {
      this.route.params.subscribe(params => {
        this.schoolId = params['school_id'];
        this.groupId = params['group_id'];
        this.noticeId = params['notice_id'];
        this.paymentId = params['payment_id'];
        this.getNoticePaymentDetails();
      });
    });

  }

  getNoticePaymentDetails(): void {

    this.noticeService.getNoticePaymentDetails(this.paymentId, this.noticeId, this.groupId, this.schoolId).subscribe(
      response => {
        this.payment = response;
        this.payment.processed = !!this.payment.processed;
      },
      error => {
        this.error = <any>error;
      });

  }

  editPayment(): void {

    this.noticeService.updateNoticePaymentDetails({
      payment_id: this.paymentId,
      notice_id: this.noticeId,
      group_id: this.groupId,
      school_id: this.schoolId,
      processed: this.payment.processed ? 1 : 0,
      notes: this.payment.notes
    }).subscribe(
      response => {
        this.backToList();
      }, error => {
        this.error = <any>error;
      }
    )

  }

  backToList(): void {
    this.router.navigate(['/notice-payments-list', {
      notice_id: this.noticeId,
      group_id: this.groupId,
      school_id: this.schoolId
    }]);
  }

}
