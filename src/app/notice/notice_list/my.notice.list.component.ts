import {Component} from '@angular/core';

import {Router, ActivatedRoute} from "@angular/router";
import {NoticeService} from "../services/notice.service";
import {Notice} from "../models/notice";

import {FriendlyDatePipe} from "../../common/pipes/friendly.date.pipe";
import {EllipsisPipe} from "../../common/pipes/ellipsis.pipe";
import {AuthService} from "../../../providers/auth-service";
import {NoticeListComponent} from "./notice.list.component";

@Component({
  selector: 'my-notice-list-component',
  templateUrl: 'my.notice.list.template.html',
  providers: [NoticeService],
  styleUrls: ['notice.list.style.scss']
})
export class MyNoticeListComponent extends NoticeListComponent {

  notices: any[] = [];
  groupId: string = "";

  constructor(public noticeService: NoticeService,
              public router: Router,
              public route: ActivatedRoute) {

    super(router);
    this.getNotices();

  }

  getNotices(): void {

    this.noticeService.getMyNotices().subscribe(res => {
      this.notices = res;

      this.notices.sort((a, b) => {
        return b.show_date - a.show_date;
      });

    });

  }

}
