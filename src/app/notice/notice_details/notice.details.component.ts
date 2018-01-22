import {AfterViewInit, Component} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {NoticeService} from '../services/notice.service';
import {AuthService} from '../../../providers/auth-service';

@Component({
  selector: 'app-notice-details-component',
  templateUrl: './notice.details.template.html',
  providers: [NoticeService],
  styleUrls: ['./notice.details.style.scss']
})
export class NoticeDetailsComponent implements AfterViewInit {

  schoolId = 0;
  groupId = 0;
  noticeId = 0;
  notice: any = {};
  noticeGroups: any[] = [];
  error = '';
  loading = true;

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
        this.getNoticeDetails();
        this.getNoticeGroups();
      });
    });


  }

  goBack() {
    window.history.back();
  }

  getNoticeDetails(): void {

    this.noticeService.getNoticeDetails(this.noticeId).subscribe(
      response => {
        this.notice = response;
        this.notice.description = this.notice.description.replace("'", "").replace("'", "");
        console.log(this.notice);
        this.loading = false;

      },
      error => {
        this.error = <any>error;
        this.loading = true;
      });


  }

  backToList(): void {
    this.router.navigate(['/group-notices-list', {group_id: this.groupId, school_id: this.schoolId}]);
  }

  getNoticeGroups(): void {

    this.noticeService.getNoticeGroups(this.noticeId).subscribe(
      response => {
        this.noticeGroups = response;
        console.log(this.noticeGroups);

      },
      error => this.error = <any>error);


  }


}
