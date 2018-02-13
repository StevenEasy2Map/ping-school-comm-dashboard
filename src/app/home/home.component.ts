import {AfterViewInit, Component} from '@angular/core';
import {Router} from '@angular/router';
import {GroupService} from '../group/group.service';
import {AuthService} from '../../providers/auth-service';
import {SchoolService} from '../school/school.service';
import {NoticeService} from '../notice/services/notice.service';
import {EventService} from '../event/services/event.service';
import * as moment from "moment";
import {MatDialog, MatSnackBar, MatTabChangeEvent} from "@angular/material";
import {DialogAreYouSureComponent} from "../common/modals/are.you.sure.component";
import {Observable} from 'rxjs';
import {HelperService} from "../../providers/helper-service";

@Component({
  selector: 'app-home-component',
  templateUrl: 'home.component.html',
  styleUrls: ['./home.style.scss'],
  providers: [GroupService, SchoolService, NoticeService, EventService],
})
export class HomeComponent implements AfterViewInit {

  myGroups: any[] = [];
  myNotices: any[] = [];
  myHomework: any[] = [];
  myEvents: any[] = [];
  mySchools: any[] = [];
  error = '';
  loading = true;
  noticesTitle = 'My Notices';
  eventsTitle = 'My Events';
  groupsTitle = 'My Groups';
  homeworkTitle = 'My Homework';
  selectedTabIndex = this.retrieveSavedTabIndex();


  constructor(private auth: AuthService, private groupService: GroupService,
              private schoolService: SchoolService,
              private noticeService: NoticeService,
              private eventService: EventService,
              public dialog: MatDialog,
              public snackBar: MatSnackBar,
              private router: Router) {
  }

  ngAfterViewInit(): void {

    this.auth.getFirebaseTokenAsPromise().then(() => {
      this.getMyGroups();
      this.getMyNotices();
      this.getMyHomework();
      this.getMyEvents();
      this.getAllSchoolsIAdminister();
    });

  }

  tabChanged = (tabChangeEvent: MatTabChangeEvent): void => {
    console.log('tabChangeEvent => ', tabChangeEvent);
    console.log('index => ', tabChangeEvent.index);
    if (typeof(Storage) !== 'undefined') {
      window.localStorage.setItem('ping-home-tab-index', tabChangeEvent.index.toString());
    }
  };

  retrieveSavedTabIndex() {
    if (typeof(Storage) !== 'undefined') {
      const index = window.localStorage.getItem('ping-home-tab-index') || '0';
      return parseInt(index, 10);
    }
    return 0;
  }

  getMyGroups() {

    this.groupService.getMyGroups().subscribe(
      response => {
        console.log(response);
        this.myGroups = response;
        if (!this.myGroups || this.myGroups.length === 0) {
          this.groupsTitle = 'You aren\'t a member of any groups.';
        }

        // this.myGroups = this.myGroups.filter(group => {
        //   return group.role !== 'member';
        // });

        console.log(this.myGroups);
        this.auth.processing = false;
        this.loading = false;

      },
      error => {
        this.error = <any>error;
        this.loading = false;
      });


  }

  getMyNotices() {

    this.noticeService.getMyNotices().subscribe(
      response => {
        this.myNotices = response;

        if (!this.myNotices || this.myNotices.length === 0) {
          this.noticesTitle = 'You don\'t have any live notices.';
        }

        this.myNotices.forEach(notice => {

          notice.description = notice.description.replace("'", "").replace("'", "");
          console.log(notice);

          console.log(notice.show_date);
          notice.show_date = moment(new Date(notice.show_date)).fromNow();

        });

        this.auth.processing = false;
        this.loading = false;

      },
      error => {
        this.error = <any>error;
        this.loading = false;
      });


  }

  getMyHomework() {

    this.noticeService.getMyHomework().subscribe(
      response => {
        this.myHomework = response;

        if (!this.myHomework || this.myHomework.length === 0) {
          this.homeworkTitle = 'You don\'t have any homework.';
        }

        this.myHomework.forEach(notice => {

          notice.description = notice.description.replace("'", "").replace("'", "");
          console.log(notice.description);
          notice.show_date = moment(new Date(notice.show_date)).fromNow();

        });

        this.auth.processing = false;
        this.loading = false;

      },
      error => {
        this.error = <any>error;
        this.loading = false;
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

    this.eventService.getMyEvents().subscribe(
      response => {
        this.myEvents = response;

        if (!this.myEvents || this.myEvents.length === 0) {
          this.eventsTitle = 'You don\'t have any events.';
        }

        this.myEvents.forEach(event => {
          event.description = event.description.replace("'", "").replace("'", "");
          event.start_date = HelperService.timeZoneAdjustedDate(event.start_date, event.timezone_offset);
        });

        this.auth.processing = false;
        this.loading = false;

      },
      error => {
        this.error = <any>error;
        this.loading = false;
      });


  }

  getUrl(url) {
    return `url('${url}')`;
  }

  getAllSchoolsIAdminister() {

    this.schoolService.getAllPrivateSchoolsIAdminister().subscribe(
      response => {
        this.mySchools = response || [];
        this.auth.processing = false;
        this.loading = false;

      },
      error => {
        this.error = <any>error;
        this.loading = false;
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
