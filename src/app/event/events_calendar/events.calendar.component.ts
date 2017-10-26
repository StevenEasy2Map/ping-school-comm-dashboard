import {Component, ChangeDetectionStrategy, ViewChild, TemplateRef} from '@angular/core';
import {Subject} from 'rxjs/Subject';
import {Router} from "@angular/router";
import {AuthService} from "../../../providers/auth-service";
import {FriendlyDatePipe} from "../../common/pipes/friendly.date.pipe";
import {CalendarComponent} from "ap-angular2-fullcalendar";
import {EventService} from "../services/event.service";


@Component({
  selector: 'app-events-calendar-component',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'group.events.calendar.template.html',
  providers: [EventService],
  styleUrls: ['./events.calendar.style.scss']
})
export class EventsCalendarComponent {

  @ViewChild('modalContent') modalContent: TemplateRef<any>;
  @ViewChild(CalendarComponent) myCalendar: CalendarComponent;

  view = 'month';
  viewDate: Date = new Date();
  refresh: Subject<any> = new Subject();
  activeDayIsOpen = false;
  group_events: any[] = [];
  selectedEvent: any = null;

  // https://fullcalendar.io/docs
  // https://www.npmjs.com/package/angular2-fullcalendar

  // https://fullcalendar.io/docs/display
  calendarOptions: Object = {
    height: 500,
    fixedWeekCount: false,
    editable: false,
    eventLimit: false, // allow "more" link when too many events

    eventClick: (event => {

      console.log(event);

    }),

    events: [


      {
        title: 'All Day Event',
        start: '2016-09-01'
      },
      {
        title: 'Long Event',
        start: '2016-09-07',
        end: '2016-09-10'
      },
      {
        id: 999,
        title: 'Repeating Event',
        start: '2016-09-09T16:00:00'
      },
      {
        id: 999,
        title: 'Repeating Event',
        start: '2016-09-16T16:00:00'
      },
      {
        title: 'Conference',
        start: '2016-09-11',
        end: '2016-09-13'
      },
      {
        title: 'Meeting',
        start: '2016-09-12T10:30:00',
        end: '2016-09-12T12:30:00'
      },
      {
        title: 'Lunch',
        start: '2016-09-12T12:00:00'
      },
      {
        title: 'Meeting',
        start: '2016-09-12T14:30:00'
      },
      {
        title: 'Happy Hour',
        start: '2016-09-12T17:30:00'
      },
      {
        title: 'Dinner',
        start: '2016-09-12T20:00:00'
      },
      {
        title: 'Birthday Party',
        start: '2016-09-13T07:00:00'
      },
      {
        title: 'Click for Google',
        url: 'http://google.com/',
        start: '2016-09-28'
      }

    ]
  };


  changeCalendarView(view) {
    this.myCalendar.fullCalendar('changeView', view);
  }

  constructor(public router: Router) {

  }

  createEvent(): void {
    this.router.navigate(['/new-event']);
  }

  addEvent(): void {
    /*this.events.push({
     title: 'New event',
     start: startOfDay(new Date()),
     end: endOfDay(new Date()),
     color: colors.red,
     draggable: true,
     resizable: {
     beforeStart: true,
     afterEnd: true
     }
     });
     this.refresh.next();
     */
    this.router.navigate(['/new-event']);
  }


}
