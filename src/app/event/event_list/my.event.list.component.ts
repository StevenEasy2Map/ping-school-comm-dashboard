import {Component} from '@angular/core';

import {Router, ActivatedRoute} from "@angular/router";
import {EventService} from "../services/event.service";
import {Event} from "../models/event";

import {FriendlyDatePipe} from "../../common/pipes/friendly.date.pipe";
import {EllipsisPipe} from "../../common/pipes/ellipsis.pipe";
import {AuthService} from "../../../providers/auth-service";
import {EventListComponent} from "./event.list.component";

@Component({
  selector: 'my-event-list-component',
  templateUrl: 'my.event.list.template.html',
  providers: [EventService],
  styleUrls: ['event.list.style.scss']
})
export class MyEventListComponent extends EventListComponent {

  events: any[] = [];
  groupId: string = "";

  constructor(public eventService: EventService,
              public router: Router,
              public route: ActivatedRoute) {

    super(router);
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
