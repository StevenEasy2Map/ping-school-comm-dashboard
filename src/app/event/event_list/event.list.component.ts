import {Router} from '@angular/router';
import {Event} from '../models/event';
import {ListComponent} from './list.component';
import {GroupService} from '../../group/group.service';

export abstract class EventListComponent extends ListComponent {

  events: any[] = [];

  constructor(public router: Router, public groupService: GroupService) {

    super(groupService);

  }

  editEvent(event: any, groupId: any, schoolId: any): void {

    this.router.navigate(['/new-event', {event_id: event.id, group_id: groupId, school_id: schoolId}]);

  }

  setLineStyle(event: Event): any {

    if (!event || !event.end_date) {
      return {};
    }
    const now = new Date();
    if ((new Date(event.end_date)).getTime() - now.getTime() > 0) {
      return {};
    }
    return {'background-color': '#d66262'};

  }

  viewEventDetails(event: any): void {
    this.router.navigate(['/event-details', {event_id: event.id}]);
  }

}
