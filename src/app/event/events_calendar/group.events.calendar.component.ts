import {AfterViewInit, Component} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {AuthService} from '../../../providers/auth-service';
import {EventService} from '../services/event.service';
import {HelperService} from '../../../providers/helper-service';
import {CalendarEvent} from 'angular-calendar';
import {EventListComponent} from '../event_list/event.list.component';
import * as moment from 'moment';


//  https://mattlewis92.github.io/angular-calendar/docs
// https://github.com/mattlewis92/angular-calendar/issues/68

@Component({
  selector: 'app-group-events-calendar-component',
  templateUrl: './group.events.calendar.template.html',
  providers: [EventService],
  styleUrls: ['./events.calendar.style.scss']
})
export class GroupEventsCalendarComponent extends EventListComponent implements AfterViewInit {

  groupId = '';
  schoolId = '';
  groupName = '';
  view = 'month';
  public viewDate: Date = new Date();
  group_events: any[] = [];
  public events: CalendarEvent[];
  selectedEvents: any[] = [];
  selectedMonth = '';
  loading = true;

  constructor(private auth: AuthService,
              public eventService: EventService,
              public router: Router,
              public route: ActivatedRoute) {

    super(router);

  }

  ngAfterViewInit(): void {

    this.auth.getFirebaseTokenAsPromise().then(() => {
      this.getEvents();
    });

  }

  createEvent(): void {
    this.router.navigate(['/new-event', {group_id: this.groupId, school_id: this.schoolId}]);
  }

  viewEventSignedDocs(event): void {

    this.router.navigate(['/entity-doc-signed-list', {
      entity_id: event.id,
      group_id: this.groupId,
      entity_type: 'event',
      school_id: this.schoolId,
      document_id: event.signature_document_id,
      template_id: event.signature_document_template_id,
      entity_title: event.title,
    }]);

  }

  viewEventPayments(event): void {

    this.router.navigate(['/entity-payments-list', {
      entity_id: event.id,
      group_id: this.groupId,
      entity_type: 'event',
      school_id: this.schoolId,
      entity_title: event.title,
    }]);

  }

  deleteEvent(event, i): void {

    this.auth.getFirebaseTokenAsPromise().then(() => {

      this.eventService.deleteEvent(event).subscribe(res => {

        this.getEvents();

      }, error => {

        console.log(error);

      });


    });


  }

  public dayClicked({date, events}: { date: Date, events: CalendarEvent[] }): void {

    console.log(events);
    this.selectedEvents = events;
  }

  clearSelectedEvents(): void {
    console.log(this.viewDate);
    const month = moment(this.viewDate);
    this.selectedMonth = month.format('MMMM');
    this.selectedEvents = [];
  }

  getEvents(): void {

    this.auth.processing = true;
    this.route.params.subscribe(params => {
        this.groupId = params['group_id'];
        this.schoolId = params['school_id'];
        this.groupName = params['group_name'];

        this.eventService.getGroupEvents(parseInt(this.groupId, 10)).then(res => {

          this.group_events = res;

          console.log(this.group_events);

          const tempEvents = [];

          this.group_events.forEach(event => {

            event.start_date = HelperService.timeZoneAdjustedDate(event.start_date, event.timezone_offset);
            event.end_date = HelperService.timeZoneAdjustedDate(event.end_date, event.timezone_offset);

            tempEvents.push({

              id: event.id,
              title: event.title,
              start: event.start_date,
              end: event.end_date,
              signature_document_id: event.signature_document_id,
              signature_document_template_id: event.signature_document_template_id,
              payment_applicable: event.payment_applicable,
              color: { // can also be calendarConfig.colorTypes.warning for shortcuts to the deprecated event types
                primary: '#e3bc08', // the primary event color (should be darker than secondary)
                secondary: '#fdf1ba' // the secondary event color (should be lighter than primary)
              }
            });

          });

          const month = moment(new Date());
          this.selectedMonth = month.format('MMMM');

          this.events = tempEvents;
          this.auth.processing = false;
          this.loading = false;

        });

      }
    );

  }


}
