import {Router} from '@angular/router';
import {ListComponent} from '../../event/event_list/list.component';
import {GroupService} from '../../group/group.service';

export abstract class NoticeListComponent extends ListComponent {

  notices: any[] = [];

  constructor(public router: Router, public groupService: GroupService) {

    super(groupService);

  }

  editNotice(notice: any): void {

    this.router.navigate(['/new-notice', {id: notice.id}]);

  }

  noticeActiveStatus(notice) {

    const hideDate = (new Date(notice.hide_date)).getTime();
    const showDate = (new Date(notice.show_date)).getTime();
    const currentTime = (new Date()).getTime();

    console.log(notice.show_date);

    if (showDate <= currentTime && hideDate > currentTime) {
      return 'Active';
    }

    if (showDate > currentTime) {
      return 'Future';
    }

    return 'Past';

  }

  setLineStyle(notice: any): any {

    if (!notice || !notice.show_date) {
      return {};
    }
    const now = new Date();
    if ((new Date(notice.hide_date)).getTime() - now.getTime() > 0) {
      return {};
    }
    return {'background-color': '#d66262'};

  }

  viewNoticeDetails(notice: any): void {
    this.router.navigate(['/notice-details', {id: notice.id}]);
  }

}
