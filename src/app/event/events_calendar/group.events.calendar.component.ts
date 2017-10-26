import {Component, ChangeDetectionStrategy, ViewChild, TemplateRef, ElementRef, AfterViewInit} from '@angular/core';
import {Subject} from 'rxjs/Subject';
import {Router, ActivatedRoute} from '@angular/router';
import {AuthService} from '../../../providers/auth-service';
import {FriendlyDatePipe} from '../../common/pipes/friendly.date.pipe';
import {CalendarComponent} from 'ap-angular2-fullcalendar';
import {EventService} from '../services/event.service';
import {EventsCalendarComponent} from './events.calendar.component';
import * as $ from 'jquery';
import * as moment from 'moment';
import {HelperService} from "../../../providers/helper-service";


@Component({
  selector: 'app-group-events-calendar-component',
  templateUrl: './group.events.calendar.template.html',
  providers: [EventService],
  styleUrls: ['./events.calendar.style.scss']
})
export class GroupEventsCalendarComponent implements AfterViewInit {

  groupId = '';
  schoolId = '';
  selectedEvent: any = {};
  viewingEvent = false;

  calendarOptions: Object = {
    height: 500,
    fixedWeekCount: false,
    editable: false,
    eventLimit: false, // allow 'more' link when too many events

    eventClick: (event => {

      console.log(event);
      this.selectEvent(event.id);

    }), events: []
  };

  @ViewChild('modalContent') modalContent: TemplateRef<any>;
  @ViewChild(CalendarComponent) myCalendar: CalendarComponent;
  @ViewChild('mycal', {read: ElementRef}) myCal: ElementRef;

  view = 'month';
  viewDate: Date = new Date();
  refresh: Subject<any> = new Subject();
  activeDayIsOpen = false;
  group_events: any[] = [];

  // https://fullcalendar.io/docs
  // https://www.npmjs.com/package/angular2-fullcalendar
  // http://stackoverflow.com/questions/42473743/update-angular2-fullcalendar-after-ngafterviewinit
  // https://fullcalendar.io/docs/display

  changeCalendarView(view) {
    this.myCalendar.fullCalendar('changeView', view);
  }

  constructor(private auth: AuthService,
              public eventService: EventService,
              public router: Router,
              public route: ActivatedRoute) {

  }

  ngAfterViewInit(): void {

    this.auth.getFirebaseTokenAsPromise().then(() => {
      this.getEvents();
    });

  }

  selectEvent(id: number) {

    this.group_events.forEach(event => {

      if (event.id === id) {

        this.selectedEvent = event;
        this.viewingEvent = true;

      }

    });


  }

  showEventDetails(): void {

    this.router.navigate(['/event-details', {
      group_id: this.groupId,
      school_id: this.schoolId,
      event_id: this.selectedEvent.id
    }]);

  }

  editEvent(): void {
    this.router.navigate(['/new-event', {event_id: this.selectedEvent.id, group_id: this.groupId, school_id: this.schoolId}]);
  }

  viewEventPayments(): void {
    this.router.navigate(['/event-payments-list', {event_id: this.selectedEvent.id, group_id: this.groupId, school_id: this.schoolId}]);
  }

  createEvent(): void {
    this.router.navigate(['/new-event', {group_id: this.groupId, school_id: this.schoolId}]);
  }


  getEvents(): void {

    this.auth.processing = true;
    this.route.params.subscribe(params => {
        this.groupId = params['group_id'];
        this.schoolId = params['school_id'];

        this.eventService.getGroupEvents(parseInt(this.groupId, 10)).then(res => {

          this.group_events = res;

          console.log(this.group_events);

          this.group_events.forEach(event => {

            event.start_date = HelperService.timeZoneAdjustedDate(event.start_date, event.timezone_offset);
            event.end_date = HelperService.timeZoneAdjustedDate(event.end_date, event.timezone_offset);

            this.calendarOptions['events'].push({

              id: event.id,
              title: event.title,
              start: event.start_date,
              end: event.end_date
            });

          });

          $(this.myCal.nativeElement).fullCalendar('addEventSource', this.calendarOptions['events']);
          this.auth.processing = false;

        });

      }
    );

  }


}
