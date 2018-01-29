import {Component} from '@angular/core';

import {Router, ActivatedRoute} from "@angular/router";
import {EventService} from "../services/event.service";
import {Event} from "../models/event";

import {FriendlyDatePipe} from "../../common/pipes/friendly.date.pipe";
import {EllipsisPipe} from "../../common/pipes/ellipsis.pipe";
import {AuthService} from "../../../providers/auth-service";
import {EventListComponent} from "./event.list.component";
import {HelperService} from "../../../providers/helper-service";

@Component({
  selector: 'app-group-event-list-component',
  templateUrl: 'group.event.list.template.html',
  providers: [EventService],
  styleUrls: ['event.list.style.scss']
})
export class GroupEventListComponent extends EventListComponent {

  events: any[] = [];
  groupId = '';
  schoolId = '';

  constructor(public eventService: EventService,
              public router: Router,
              public route: ActivatedRoute) {

    super(router);
    this.getEvents();

  }

  getEvents(): void {

    this.route.params.subscribe(params => {
      this.groupId = params['group_id'];
      this.schoolId = params['school_id'];

      this.eventService.getGroupEvents(parseInt(this.groupId, 10)).then(res => {
        this.events = res;

        this.events.forEach(event => {
          //event.start_date = HelperService.timeZoneAdjustedDate(event.start_date, event.timezone_offset);
          //event.end_date = HelperService.timeZoneAdjustedDate(event.end_date, event.timezone_offset);
        });

        this.events.sort((a, b) => {
          return b.start_date - a.start_date;
        });

      });

    });

  }

  addNewEvent(): void {
    this.router.navigate(['/new-event', {group_id: this.groupId}]);
  }

}
