import {Component, EventEmitter} from '@angular/core';

import {Router, ActivatedRoute} from '@angular/router';
import {NoticeService} from '../services/notice.service';
import {Notice} from '../models/notice';

import {FriendlyDatePipe} from '../../common/pipes/friendly.date.pipe';
import {EllipsisPipe} from '../../common/pipes/ellipsis.pipe';
import {AuthService} from '../../../providers/auth-service';
import {NoticeListComponent} from './notice.list.component';
import {MaterializeAction} from 'angular2-materialize';

@Component({
  selector: 'app-group-notice-list-component',
  templateUrl: 'group.notice.list.template.html',
  providers: [NoticeService],
  styleUrls: ['notice.list.style.scss']
})
export class GroupNoticeListComponent extends NoticeListComponent {

  notices: any[] = [];
  groupId: string = '';
  schoolId: string = '';
  loading = true;

  constructor(private auth: AuthService,
              public noticeService: NoticeService,
              public router: Router,
              public route: ActivatedRoute) {

    super(router);
    this.getNotices();

  }

  getNotices(): void {

    this.auth.getFirebaseTokenAsPromise().then(() => {
      this.route.params.subscribe(params => {
        this.groupId = params['group_id'];
        this.schoolId = params['school_id'];

        this.noticeService.getGroupNotices(parseInt(this.groupId, 10)).subscribe(res => {
          this.notices = res;

          this.notices.sort((a, b) => {
            return b.show_date - a.show_date;
          });

          this.loading = false;

        });

      });

    }).catch(error => {

      this.loading = false;

    });

  }

  viewNoticeSignedDocs(notice): void {

    this.router.navigate(['/entity-doc-signed-list', {
      entity_id: notice.id,
      group_id: this.groupId,
      entity_type: 'notice',
      school_id: this.schoolId,
      document_id: notice.signature_document_id,
      template_id: notice.signature_document_template_id,
      entity_title: notice.title,
    }]);

  }

  viewNoticePayments(notice): void {

    this.router.navigate(['/entity-payments-list', {
      entity_id: notice.id,
      group_id: this.groupId,
      entity_type: 'notice',
      school_id: this.schoolId,
      entity_title: notice.title,
    }]);

  }

  editNotice(notice): void {
    this.router.navigate(['/new-notice', {
      notice_id: notice.id, group_id: this.groupId,
      school_id: this.schoolId
    }]);
  }

  viewNoticeDetails(notice): void {

    this.router.navigate(['/notice-details', {
      notice_id: notice.id, group_id: this.groupId,
      school_id: this.schoolId
    }]);

  }

  noticeActiveStatus(notice) {

    return (new Date(notice.hide_date)).getTime() > (new Date()).getTime();

  }

  noticeStatusClass(notice) {

    if (this.noticeActiveStatus(notice)) {
      return '';
    }

    return 'inactive';

  }

  deleteNotice(notice, i): void {

    this.auth.getFirebaseTokenAsPromise().then(() => {

      this.noticeService.deleteNotice(notice).subscribe(res => {

        this.notices.splice(i, 1);

      }, error => {

        console.log(error);

      });


    });


  }

  addNewNotice(): void {
    this.router.navigate(['/new-notice', {group_id: this.groupId, school_id: this.schoolId}]);
  }

}
