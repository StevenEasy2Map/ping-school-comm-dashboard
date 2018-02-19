import {Component} from '@angular/core';

import {ActivatedRoute, Router} from '@angular/router';
import {EventService} from '../services/event.service';
import {EventListComponent} from './event.list.component';
import {GroupService} from '../../group/group.service';

@Component({
  selector: 'my-event-list-component',
  templateUrl: 'my.event.list.template.html',
  providers: [EventService],
  styleUrls: ['event.list.style.scss']
})
export class MyEventListComponent extends EventListComponent {

  events: any[] = [];
  groupId = '';

  constructor(public eventService: EventService,
              public groupService: GroupService,
              public router: Router,
              public route: ActivatedRoute) {

    super(router, groupService);
    this.getEvents();

  }

  getEvents(): void {

    this.eventService.getMyEvents().subscribe(res => {
      this.events = res;

      this.events.sort((a, b) => {
        return b.start_date - a.start_date;
      });

    });

  }

}
