import {Component} from '@angular/core';

import {Router, ActivatedRoute} from '@angular/router';
import {NoticeService} from '../services/notice.service';
import {NoticeListComponent} from './notice.list.component';
import {GroupService} from "../../group/group.service";

@Component({
  selector: 'my-notice-list-component',
  templateUrl: 'my.notice.list.template.html',
  providers: [NoticeService],
  styleUrls: ['notice.list.style.scss']
})
export class MyNoticeListComponent extends NoticeListComponent {

  notices: any[] = [];
  groupId: string = '';

  constructor(public noticeService: NoticeService,
              public groupService: GroupService,
              public router: Router,
              public route: ActivatedRoute) {

    super(router, groupService);
    this.getNotices();

  }

  getNotices(): Promise<any> {

    return new Promise((resolve, reject) => {

      this.noticeService.getMyNotices().subscribe(res => {
        this.notices = res;

        this.notices.sort((a, b) => {
          return b.show_date - a.show_date;
        });

        resolve(this.notices);

      });

    });

  }

}
