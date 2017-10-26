import {ChangeDetectionStrategy, Component} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {EventService} from '../services/event.service';
import {EventsCalendarComponent} from './events.calendar.component';
import {HelperService} from '../../../providers/helper-service';


@Component({
  selector: 'app-my-events-calendar-component',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './group.events.calendar.template.html',
  providers: [EventService],
  styleUrls: ['./events.calendar.style.scss']
})
export class MyEventsCalendarComponent extends EventsCalendarComponent {

  groupId = '';
  public viewDate: Date = new Date();
  public events = [];

  constructor(public eventService: EventService,
              public router: Router,
              public route: ActivatedRoute) {

    super(router);
    this.getEvents();

  }

  getEvents(): void {

    this.eventService.getMyEvents().subscribe(res => {

      this.group_events = res;
      this.group_events.forEach(event => {

        event.start_date = HelperService.timeZoneAdjustedDate(event.start_date, event.timezone_offset);
        event.end_date = HelperService.timeZoneAdjustedDate(event.end_date, event.timezone_offset);

        this.events.push({

          id: event.id,
          title: event.title,
          start: event.start_date,
          end: event.end_date
        });

      });


    });


  }


}
