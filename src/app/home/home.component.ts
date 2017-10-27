import {AfterViewInit, Component} from '@angular/core';
import {Router} from '@angular/router';
import {GroupService} from '../group/group.service';
import {AuthService} from '../../providers/auth-service';

@Component({
  selector: 'home-component',
  templateUrl: 'home.component.html',
  styleUrls: ['./home.style.scss'],
  providers: [GroupService],
})
export class HomeComponent implements AfterViewInit {

  myGroups: any[] = [];
  error = '';

  constructor(private auth: AuthService, private groupService: GroupService, private router: Router) {
  }

  ngAfterViewInit(): void {

    this.auth.getFirebaseTokenAsPromise().then(() => {
      this.getMyGroups();
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

      },
      error => this.error = <any>error);


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

  addNewGroup() {
    this.router.navigateByUrl('/new-group-step-1');
  }


}
