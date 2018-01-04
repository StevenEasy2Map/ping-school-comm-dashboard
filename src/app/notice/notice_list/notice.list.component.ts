import {Router} from "@angular/router";

export abstract class NoticeListComponent {

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
