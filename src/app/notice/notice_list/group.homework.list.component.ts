import {Component, EventEmitter} from '@angular/core';

import {Router, ActivatedRoute} from '@angular/router';
import {NoticeService} from '../services/notice.service';
import {Notice} from '../models/notice';

import {FriendlyDatePipe} from '../../common/pipes/friendly.date.pipe';
import {EllipsisPipe} from '../../common/pipes/ellipsis.pipe';
import {AuthService} from '../../../providers/auth-service';
import {NoticeListComponent} from './notice.list.component';
import {MaterializeAction} from 'angular2-materialize';
import {GroupService} from "../../group/group.service";
import {MatDialog} from "@angular/material";
import {DialogAreYouSureComponent} from "../../common/modals/are.you.sure.component";

@Component({
  selector: 'app-group-homework-list-component',
  templateUrl: 'group.homework.list.template.html',
  providers: [NoticeService, GroupService],
  styleUrls: ['notice.list.style.scss']
})
export class GroupHomeworkListComponent extends NoticeListComponent {

  notices: any[] = [];
  groupId = '';
  schoolId = '';
  loading = true;
  groupAdmin = false;

  constructor(private auth: AuthService,
              public groupService: GroupService,
              public noticeService: NoticeService,
              public router: Router,
              public dialog: MatDialog,
              public route: ActivatedRoute) {

    super(router, groupService);

    this.getHomework()
      .then(() => {
        return this.isGroupAdmin(parseInt(this.schoolId, 10), parseInt(this.groupId, 10));
      })
      .then(() => {
        this.loading = false;
      })
      .catch(err => {
        console.log(err);
        this.loading = false;
      });
  }

  getHomework(): Promise<any> {

    return new Promise((resolve, reject) => {

      this.auth.getFirebaseTokenAsPromise().then(() => {
        this.route.params.subscribe(params => {
          this.groupId = params['group_id'];
          this.schoolId = params['school_id'];

          this.noticeService.getGroupHomework(parseInt(this.groupId, 10)).subscribe(res => {
            this.notices = res;

            this.notices.sort((a, b) => {
              return b.show_date - a.show_date;
            });

            resolve(this.notices);

          });

        });

      }).catch(error => {

        reject(error);

      });
    });

  }


  editNotice(notice): void {
    this.router.navigate(['/new-homework', {
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

  deleteNotice(notice, i): void {

    const dialogRef = this.dialog.open(DialogAreYouSureComponent, {
      data: {
        title: 'Delete this homework item?'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loading = true;

        this.auth.getFirebaseTokenAsPromise().then(() => {

          this.noticeService.deleteNotice(notice).subscribe(res => {

            this.notices.splice(i, 1);
            this.loading = false;

          }, error => {

            console.log(error);
            this.loading = false;

          });

        });

      }
    });

  }

  addNewHomework(): void {
    this.router.navigate(['/new-homework', {group_id: this.groupId, school_id: this.schoolId}]);
  }

}
