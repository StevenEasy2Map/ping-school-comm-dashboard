import {Component} from '@angular/core';

import {ActivatedRoute, Router} from '@angular/router';
import {EventService} from '../services/event.service';
import {EventListComponent} from './event.list.component';
import {HelperService} from '../../../providers/helper-service';
import {GroupService} from '../../group/group.service';

@Component({
  selector: 'app-group-event-list-component',
  templateUrl: 'group.event.list.template.html',
  providers: [EventService, GroupService],
  styleUrls: ['event.list.style.scss']
})
export class GroupEventListComponent extends EventListComponent {

  events: any[] = [];
  groupId = '';
  schoolId = '';
  loading = true;

  constructor(public eventService: EventService,
              public groupService: GroupService,
              public router: Router,
              public route: ActivatedRoute) {

    super(router, groupService);
    this.getEvents()
      .then(() => {
        return this.isGroupAdmin(parseInt(this.schoolId, 10), parseInt(this.groupId, 10));
      })
      .then(() => {
        this.loading = false;
      })
      .catch(err => {
        console.log(err);
        this.loading = false;
      });

  }

  getEvents(): Promise<any> {

    return new Promise((resolve, reject) => {

      this.route.params.subscribe(params => {
        this.groupId = params['group_id'];
        this.schoolId = params['school_id'];

        this.eventService.getGroupEvents(parseInt(this.groupId, 10)).then(res => {
          this.events = res;

          this.events.forEach(event => {
            event.start_date = HelperService.timeZoneAdjustedDate(event.start_date, event.timezone_offset);
            event.end_date = HelperService.timeZoneAdjustedDate(event.end_date, event.timezone_offset);
          });

          this.events.sort((a, b) => {
            return b.start_date - a.start_date;
          });

          resolve(this.events);

        }).catch(error => {

          reject(error);

        });

      });


    });

  }

  addNewEvent(): void {
    this.router.navigate(['/new-event', {group_id: this.groupId}]);
  }

}
