import {Component, ChangeDetectionStrategy, ViewChild, TemplateRef} from '@angular/core';
import {Subject} from 'rxjs/Subject';
import {Router, ActivatedRoute} from '@angular/router';
import {AuthService} from '../../../providers/auth-service';
import {FriendlyDatePipe} from '../../common/pipes/friendly.date.pipe';
import {CalendarComponent} from 'ap-angular2-fullcalendar';
import {EventService} from '../services/event.service';
import {EventsCalendarComponent} from './events.calendar.component';
import {HelperService} from "../../../providers/helper-service";


@Component({
  selector: 'app-my-events-calendar-component',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './group.events.calendar.template.html',
  providers: [EventService],
  styleUrls: ['./events.calendar.style.scss']
})
export class MyEventsCalendarComponent extends EventsCalendarComponent {

  groupId = '';

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

        this.calendarOptions['events'].push({

          title: event.title,
          start: new Date(event.start_date),
          end: new Date(event.end_date),
        });

      });


    });


  }


}
