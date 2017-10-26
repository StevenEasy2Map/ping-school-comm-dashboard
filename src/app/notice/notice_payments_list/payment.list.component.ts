import {Component} from '@angular/core';

import {Router, ActivatedRoute} from "@angular/router";
import {NoticeService} from "../services/notice.service";
import {Notice} from "../models/notice";

import {FriendlyDatePipe} from "../../common/pipes/friendly.date.pipe";
import {EllipsisPipe} from "../../common/pipes/ellipsis.pipe";
import {AuthService} from "../../../providers/auth-service";

export abstract class PaymentListComponent {

  notices: any[] = [];

  constructor(public router: Router) {
  }

  editNotice(notice: any): void {

    this.router.navigate(['/new-notice', {id: notice.id}]);

  }

  setLineStyle(notice: any): any {

    if (!notice || !notice.show_date) return {};
    let now = new Date();
    if ((new Date(notice.hide_date)).getTime() - now.getTime() > 0) {
      return {};
    }
    return {"background-color": "#d66262"};

  }

  viewNoticeDetails(notice: any): void {
    this.router.navigate(['/notice-details', {id: notice.id}]);
  }

}
