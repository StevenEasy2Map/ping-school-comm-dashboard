import {AfterViewInit, Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {GroupService} from '../group/group.service';
import {AuthService} from '../../providers/auth-service';
import {SchoolService} from '../school/school.service';
import {NoticeService} from '../notice/services/notice.service';
import {EventService} from '../event/services/event.service';
import * as moment from 'moment';
import {MatDialog, MatSnackBar, MatTabChangeEvent} from '@angular/material';
import {DialogAreYouSureComponent} from '../common/modals/are.you.sure.component';
import {HelperService} from '../../providers/helper-service';
import {DialogShareUrlComponent} from '../common/modals/share.url.component';
import {DialogErrorComponent} from "../common/modals/dialog.error.component";
import {ObservableMedia} from '@angular/flex-layout';
import "rxjs/add/operator/map";
import "rxjs/add/operator/takeWhile";
import "rxjs/add/operator/startWith";
import {CalendarEvent} from 'angular-calendar';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/forkJoin';

@Component({
  selector: 'app-home-component',
  templateUrl: 'home.component.html',
  styleUrls: ['./home.style.scss'],
  providers: [GroupService, SchoolService, NoticeService, EventService],
})
export class HomeComponent implements OnInit, AfterViewInit {

  myGroups: any[] = [];
  myNotices: any[] = [];
  myHomework: any[] = [];
  myEvents: any[] = [];
  mySchools: any[] = [];
  error = '';
  loading = true;
  noticesTitle = 'Noticeboard';
  eventsTitle = 'Upcoming Events';
  groupsTitle = 'My Groups';
  homeworkTitle = 'Homework';
  selectedTabIndex = 0;
  unreadNotices: any[] = [];
  unreadHomework: any[] = [];
  unreadEvents: any[] = [];
  showUnreadEvents = false;
  showUnreadNotices = false;
  showUnreadHomework = false;
  showEventList = true;

  view = 'month';
  public viewDate: Date = new Date();
  public calendarEvents: CalendarEvent[];
  selectedEvents: any[] = [];
  selectedMonth = '';

  colors: any = {
    red: {
      primary: '#ad2121',
      secondary: '#FAE3E3'
    },
    blue: {
      primary: '#1e90ff',
      secondary: '#D1E8FF'
    },
    grey: {
      primary: '#888888',
      secondary: '#818181'
    }
  };

  /**
   * The number of colums in the md-grid-list directive.
   */
  public cols: Observable<number>;

  constructor(public auth: AuthService,
              public groupService: GroupService,
              public schoolService: SchoolService,
              public noticeService: NoticeService,
              public eventService: EventService,
              public dialog: MatDialog,
              public snackBar: MatSnackBar,
              public router: Router,
              public observableMedia: ObservableMedia) {
  }

  ngOnInit() {

    const grid = new Map([
      ["xs", 1],
      ["sm", 1],
      ["md", 1],
      ["lg", 2],
      ["xl", 3]
    ]);
    let start: number;
    grid.forEach((cols, mqAlias) => {
      if (this.observableMedia.isActive(mqAlias)) {
        start = cols;
      }
    });
    this.cols = this.observableMedia.asObservable()
      .map(change => {
        return grid.get(change.mqAlias);
      })
      .startWith(start);


  }

  ngAfterViewInit(): void {

    const self = this;

    self.auth.getFirebaseTokenAsPromise().then(() => {

      this.getAllSchoolsIAdminister()
        .then(() => {
          return this.getMyGroups();
        })
        .then(() => {
          return this.getMyNotices();
        })
        .then(() => {
          return this.getMyHomework();
        })
        .then(() => {
          return this.getMyEvents();
        })
        .then(() => {
          this.auth.processing = false;
          this.loading = false;
          this.selectedTabIndex = this.retrieveSavedTabIndex();
        }).catch(err => {
        this.error = <any>err;
        this.displayErrorDialog(this.error);
        this.auth.processing = false;
        this.loading = false;
      });

    });

  }

  public dayClicked({date, events}: { date: Date, events: CalendarEvent[] }): void {

    console.log(events);
    this.selectedEvents = events;
  }

  clearSelectedEvents(): void {
    console.log(this.viewDate);
    const month = moment(this.viewDate);
    this.selectedMonth = month.format('MMMM');
    this.selectedEvents = [];
  }

  displayErrorDialog(error) {
    if (this.loading) {
      this.loading = false;
    }
    if (this.auth.processing) {
      this.auth.processing = false;
    }

    console.log(error.error_message);

    if (error && !error.hasOwnProperty('error_message')) {
      try {
        error = JSON.parse(error);
      } catch (e) {

      }
    }
    this.dialog.open(DialogErrorComponent, {
      data: {
        message: error.error_message || 'An error occurred, please try again'
      }
    });
  }

  tabChanged = (tabChangeEvent: MatTabChangeEvent): void => {
    if (typeof(Storage) !== 'undefined') {
      window.localStorage.setItem('ping-home-tab-index', tabChangeEvent.index.toString());
      this.selectedTabIndex = tabChangeEvent.index;
    }
  };

  retrieveSavedTabIndex() {
    if (typeof(Storage) !== 'undefined') {
      const index = window.localStorage.getItem('ping-home-tab-index') || '0';
      return this.selectedTabIndex = parseInt(index, 10);
    }
    return 0;
  }

  shareItem(url) {

    this.dialog.open(DialogShareUrlComponent, {
      data: {
        title: 'Share this item',
        url: url
      }
    });

  }

  markNoticeAsRead(i) {
    if (!this.unreadNotices[i]) return;
    this.auth.processing = true;
    this.loading = true;
    this.noticeService.markAsRead({notice_id: this.unreadNotices[i].id}).subscribe(res => {
      this.unreadNotices.splice(i, 1);
      this.auth.processing = false;
      this.loading = false;
    }, error => {
      this.displayErrorDialog(this.error);
      this.error = <any>error;
      this.auth.processing = false;
      this.loading = false;
    });
  }

  markHomeworkAsRead(i) {
    if (!this.unreadHomework[i]) return;
    this.auth.processing = true;
    this.loading = true;
    this.noticeService.markAsRead({notice_id: this.unreadHomework[i].id}).subscribe(res => {
      this.unreadHomework.splice(i, 1);
      this.auth.processing = false;
      this.loading = false;
    }, error => {
      this.displayErrorDialog(this.error);
      this.error = <any>error;
      this.auth.processing = false;
      this.loading = false;
    });
  }

  viewEntityPayments(entityType, entity): void {

    this.router.navigate(['/entity-payments-list', {
      entity_id: entity.id,
      group_id: entity.group_id,
      entity_type: entityType,
      school_id: entity.school_id,
      entity_title: entity.title,
    }]);

  }

  viewEntitySignedDocs(entityType, entity): void {

    this.router.navigate(['/entity-doc-signed-list', {
      entity_id: entity.id,
      group_id: entity.group_id,
      entity_type: entityType,
      school_id: entity.school_id,
      document_id: entity.signature_document_id,
      template_id: entity.signature_document_template_id,
      entity_title: entity.title,
    }]);

  }

  markEventAsRead(i) {
    if (!this.unreadEvents[i]) return;
    this.auth.processing = true;
    this.loading = true;
    this.eventService.markAsRead({event_id: this.unreadEvents[i].id}).subscribe(res => {
      this.unreadEvents.splice(i, 1);
      this.auth.processing = false;
      this.loading = false;
    }, error => {
      this.displayErrorDialog(this.error);
      this.error = <any>error;
      this.auth.processing = false;
      this.loading = false;
    });
  }

  getMyGroups(): Promise<any> {

    return new Promise((resolve, reject) => {

      this.groupService.getMyGroups().subscribe(
        response => {
          this.myGroups = response;
          if (!this.myGroups || this.myGroups.length === 0) {
            this.groupsTitle = 'You aren\'t a member of any groups.';
          }

          resolve();

        },
        error => {
          reject(error);
        });

    });

  }

  getMyNotices(): Promise<any> {

    const self = this;

    return new Promise((resolve, reject) => {

      self.noticeService.getMyNotices().subscribe(
        response => {
          self.myNotices = response;

          if (!self.myNotices || self.myNotices.length === 0) {
            self.noticesTitle = 'You don\'t have any live notices.';
          }

          self.unreadNotices = [];
          self.myNotices.forEach(notice => {

            if (!notice.read_receipt) {
              self.unreadNotices.push(notice);
            }
            notice.description = notice.description.replace("'", "").replace("'", "");
            notice.show_date = moment(new Date(notice.show_date)).fromNow();

          });

          resolve();

        },
        error => {
          reject(error);
        });

    });


  }

  getMyHomework() {

    return new Promise((resolve, reject) => {

      this.noticeService.getMyHomework().subscribe(
        response => {
          this.myHomework = response;

          if (!this.myHomework || this.myHomework.length === 0) {
            this.homeworkTitle = 'You don\'t have any homework.';
          }

          this.unreadHomework = [];
          this.myHomework.forEach(notice => {

            if (!notice.read_receipt) {
              this.unreadHomework.push(notice);
            }

            notice.description = notice.description.replace("'", "").replace("'", "");
            notice.show_date = moment(new Date(notice.show_date)).fromNow();

          });

          resolve();

        },
        error => {
          reject(error);
        });

    });


  }

  editEntity($event, entityType, entityId, groupId, schoolId) {

    if (entityType === 'notice') {

      this.router.navigate(['/new-notice', {
        notice_id: entityId, group_id: groupId,
        school_id: schoolId
      }]);


    } else if (entityType === 'event') {

      this.router.navigate(['/new-event', {
        event_id: entityId, group_id: groupId,
        school_id: schoolId
      }]);


    } else if (entityType === 'homework') {

      this.router.navigate(['/new-homework', {
        notice_id: entityId, group_id: groupId,
        school_id: schoolId
      }]);


    }


  }

  hideEntity($event, entityType, entityId) {

    $event.preventDefault();

    const dialogRef = this.dialog.open(DialogAreYouSureComponent, {
      data: {
        title: 'Hide item from your feed'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loading = true;

        let payload = {};
        const observables = [];
        if (entityType === 'event') {

          payload = {
            event_id: entityId
          };
          observables.push(this.eventService.hideEventFromFeed(payload));
          observables.push(this.eventService.updateHiddenEventCount());

        } else {

          payload = {
            notice_id: entityId
          };
          observables.push(this.noticeService.hideNoticeFromFeed(payload));
          observables.push(this.noticeService.updateHiddenNoticeCount());

        }
        Observable.forkJoin(observables).subscribe(t => {
          this.loading = false;
          this.snackBar.open('Item successfully hidden from your feed');
          setTimeout(() => {
            this.snackBar.dismiss();
            if (entityType === 'event') {
              this.getMyEvents();
            } else {
              this.getMyNotices();
              this.getMyHomework();
            }
          }, 1500);
        });

      }
    });
  }


  getMyEvents() {

    return new Promise((resolve, reject) => {

      this.eventService.getMyEvents().subscribe(
        response => {
          this.myEvents = response;

          if (!this.myEvents || this.myEvents.length === 0) {
            this.eventsTitle = 'You don\'t have any events.';
          }

          this.unreadEvents = [];
          const tempEvents = [];
          this.myEvents.forEach(event => {

            if (!event.read_receipt) {
              this.unreadEvents.push(event);
            }

            event.description = event.description.replace("'", "").replace("'", "");
            event.start_date = HelperService.timeZoneAdjustedDate(event.start_date, event.timezone_offset);
            event.end_date = HelperService.timeZoneAdjustedDate(event.end_date, event.timezone_offset);

            tempEvents.push({

              id: event.id,
              title: event.title,
              start: event.start_date,
              end: event.end_date,
              future_date: event.future_date,
              color: event.future_date ? this.colors.blue : this.colors.grey
            });


          });

          const month = moment(new Date());
          this.selectedMonth = month.format('MMMM');
          this.calendarEvents = tempEvents;

          resolve();

        },
        error => {
          reject(error);
        });

    });


  }

  getUrl(url) {
    return `url('${url}')`;
  }

  getAllSchoolsIAdminister() {

    return new Promise((resolve, reject) => {

      this.schoolService.getAllPrivateSchoolsIAdminister().subscribe(
        response => {
          this.mySchools = response || [];
          resolve();

        },
        error => {
          reject(error);
        });

    });


  }


  leaveGroup($event, groupId) {

    $event.preventDefault();

    const dialogRef = this.dialog.open(DialogAreYouSureComponent, {
      data: {
        title: 'Leave this group?'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loading = true;

        const payload = {
          group_id: groupId
        };
        this.groupService.leaveGroup(payload).subscribe(t => {
          this.loading = false;
          this.snackBar.open('You have successfully left this group');
          setTimeout(() => {
            this.snackBar.dismiss();
            this.getMyGroups();
            this.getMyNotices();
            this.getMyHomework();
            this.getMyEvents();
          }, 1500);
        }, error => {
          this.error = error;
          this.displayErrorDialog(this.error);
        });

      }
    });
  }


  createNotice(i): void {
    const group = this.myGroups[i];
    this.router.navigate(['/new-notice', {group_id: group.id, school_id: group.school_id}]);
  }

  createHomework(i): void {
    const group = this.myGroups[i];
    this.router.navigate(['/new-homework', {group_id: group.id, school_id: group.school_id}]);
  }

  viewGroupNotices(i): void {
    const group = this.myGroups[i];
    this.router.navigate(['/group-notices-list', {group_id: group.id, school_id: group.school_id}]);
  }

  viewGroupHomework(i): void {
    const group = this.myGroups[i];
    this.router.navigate(['/group-homework-list', {group_id: group.id, school_id: group.school_id}]);
  }

  createEvent(i): void {
    const group = this.myGroups[i];
    this.router.navigate(['/new-event', {group_id: group.id, school_id: group.school_id}]);
  }

  editGroup(i): void {
    const group = this.myGroups[i];
    this.router.navigate(['/edit-group', {group_id: group.id, school_id: group.school_id}]);
  }

  editSchool(i): void {
    const school = this.mySchools[i];
    this.router.navigate(['/update-my-school', {school_id: school.id}]);
  }

  inviteUsersToSchool(i): void {
    const school = this.mySchools[i];

    this.router.navigate(['/invite-school-member',
      {
        school_id: school.id,
        school_name: school.name
      }]);
  }

  viewSchoolAdministrators(i): void {
    const school = this.mySchools[i];

    this.router.navigate(['/school-administrators',
      {
        school_id: school.id,
        school_name: school.name
      }]);
  }

  viewSchoolWideNotices(i): void {
    const school = this.mySchools[i];
    this.router.navigate(['/group-notices-list', {group_id: school.group_id, school_id: school.id}]);
  }

  viewSchoolWideEventsCalendar(i): void {
    const school = this.mySchools[i];
    this.router.navigate(['/group-events-calendar', {
      group_id: school.group_id,
      school_id: school.id,
      group_name: school.name
    }]);
  }

  createSchoolWideNotice(i): void {
    const school = this.mySchools[i];
    this.router.navigate(['/new-notice', {group_id: school.group_id, school_id: school.id}]);
  }

  createSchoolWideEvent(i): void {
    const school = this.mySchools[i];
    this.router.navigate(['/new-event', {group_id: school.group_id, school_id: school.id}]);
  }

  viewGroupMembers(i): void {
    const group = this.myGroups[i];
    this.router.navigate(['/group-members', {group_id: group.id, school_id: group.school_id}]);
  }

  inviteUsersToGroup(i): void {
    const group = this.myGroups[i];

    this.router.navigate(['/invite-group-member',
      {
        school_id: group.school_id,
        group_id: group.id,
        token: group.invite_token,
        invite_others: true
      }]);
  }

  viewEventsCalendar(i): void {
    const group = this.myGroups[i];
    this.router.navigate(['/group-events-calendar', {
      group_id: group.id,
      school_id: group.school_id,
      group_name: group.name
    }]);
  }

  viewNoticeDetails(notice: any): void {
    this.router.navigate(['/notice-details', {
      notice_id: notice.id, group_id: notice.group_id, school_id: notice.school_id
    }])
    ;
  }

  viewEventDetails(event: any): void {
    this.router.navigate(['/event-details', {
      event_id: event.id,
      group_id: event.group_id,
      school_id: event.school_id
    }]);
  }

  addNewGroup() {
    this.router.navigateByUrl('/new-group-step-1');
  }

  joinGroup() {
    this.router.navigateByUrl('/join-group');
  }


}
