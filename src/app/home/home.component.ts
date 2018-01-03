import {AfterViewInit, Component} from '@angular/core';
import {Router} from '@angular/router';
import {GroupService} from '../group/group.service';
import {AuthService} from '../../providers/auth-service';
import {SchoolService} from '../school/school.service';
import {NoticeService} from '../notice/services/notice.service';
import {EventService} from '../event/services/event.service';

@Component({
  selector: 'app-home-component',
  templateUrl: 'home.component.html',
  styleUrls: ['./home.style.scss'],
  providers: [GroupService, SchoolService, NoticeService, EventService],
})
export class HomeComponent implements AfterViewInit {

  myGroups: any[] = [];
  myNotices: any[] = [];
  myEvents: any[] = [];
  mySchools: any[] = [];
  error = '';
  loading = true;

  constructor(private auth: AuthService, private groupService: GroupService,
              private schoolService: SchoolService,
              private noticeService: NoticeService,
              private eventService: EventService,
              private router: Router) {
  }

  ngAfterViewInit(): void {

    this.auth.getFirebaseTokenAsPromise().then(() => {
      this.getMyGroups();
      this.getMyNotices();
      this.getMyEvents();
      this.getAllSchoolsIAdminister();
    });

  }

  getMyGroups() {

    this.groupService.getMyGroups().subscribe(
      response => {
        this.myGroups = response;

        this.myGroups = this.myGroups.filter(group => {
          return group.role !== 'member';
        });

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

        this.auth.processing = false;
        this.loading = false;

      },
      error => {
        this.error = <any>error;
        this.loading = false;
      });


  }

  getMyEvents() {

    this.eventService.getMyEvents().subscribe(
      response => {
        this.myEvents = response;

        this.auth.processing = false;
        this.loading = false;

      },
      error => {
        this.error = <any>error;
        this.loading = false;
      });


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

  viewGroupNotices(i): void {
    const group = this.myGroups[i];
    this.router.navigate(['/group-notices-list', {group_id: group.id, school_id: group.school_id}]);
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
    this.router.navigate(['/group-events-calendar', {group_id: school.group_id, school_id: school.id, group_name: school.name}]);
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
    this.router.navigate(['/group-events-calendar', {group_id: group.id, school_id: group.school_id, group_name: group.name}]);
  }

  viewNoticeDetails(notice: any): void {
    this.router.navigate(['/notice-details', {
      notice_id: notice.id, group_id: notice.group_id, school_id: notice.school_id
    }])
    ;
  }

  viewEventDetails(event: any): void {
    this.router.navigate(['/event-details', {event_id: event.id, group_id: event.group_id, school_id: event.school_id}]);
  }

  addNewGroup() {
    this.router.navigateByUrl('/new-group-step-1');
  }


}
