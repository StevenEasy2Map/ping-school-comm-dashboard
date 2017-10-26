import {AfterViewInit, Component} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {AuthService} from '../../../providers/auth-service';
import {EventService} from '../services/event.service';
import {HelperService} from '../../../providers/helper-service';
import {CalendarEvent} from 'angular-calendar';


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
  view = 'month';
  public viewDate: Date = new Date();
  group_events: any[] = [];
  public events: CalendarEvent[];

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

  handleDayClick({event}: { event: CalendarEvent }): void {
    console.log('Event clicked', event);
  }

  getEvents(): void {

    this.auth.processing = true;
    this.route.params.subscribe(params => {
        this.groupId = params['group_id'];
        this.schoolId = params['school_id'];

        this.eventService.getGroupEvents(parseInt(this.groupId, 10)).then(res => {

          this.group_events = res;

          console.log(this.group_events);

          const tempEvents = [];
          this.group_events.forEach(event => {

            event.start_date = HelperService.timeZoneAdjustedDate(event.start_date, event.timezone_offset);
            event.end_date = HelperService.timeZoneAdjustedDate(event.end_date, event.timezone_offset);

            tempEvents.push({

              title: event.title,
              start: event.start_date,
              end: event.end_date,
              color: { // can also be calendarConfig.colorTypes.warning for shortcuts to the deprecated event types
                primary: '#e3bc08', // the primary event color (should be darker than secondary)
                secondary: '#fdf1ba' // the secondary event color (should be lighter than primary)
              }
            });

          });

          this.events = tempEvents;
          this.auth.processing = false;

        });

      }
    );

  }


}
