import {AfterViewInit, Component} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {AuthService} from '../../../providers/auth-service';
import {EventService} from '../services/event.service';
import {HelperService} from '../../../providers/helper-service';
import {CalendarEvent} from 'angular-calendar';
import {EventListComponent} from '../event_list/event.list.component';
import * as moment from 'moment';
import {GroupService} from '../../group/group.service';


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

  colors: any = {
    red: {
      primary: '#ad2121',
      secondary: '#FAE3E3'
    },
    blue: {
      primary: '#1e90ff',
      secondary: '#D1E8FF'
    },
    grey: {
      primary: '#888888',
      secondary: '#818181'
    }
  };


  constructor(private auth: AuthService,
              public eventService: EventService,
              public groupService: GroupService,
              public router: Router,
              public route: ActivatedRoute) {

    super(router, groupService);

  }

  ngAfterViewInit(): void {

    this.auth.getFirebaseTokenAsPromise().then(() => {
      this.getEvents()
      .then(() => {
        return this.isGroupAdmin(parseInt(this.schoolId, 10), parseInt(this.groupId, 10));
      })
      .then(() => {
        this.loading = false;
        this.auth.processing = false;
      })
      .catch(err => {
        console.log(err);
        this.loading = false;
        this.auth.processing = false;
      });
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

  getEvents(): Promise<any> {

    return new Promise((resolve, reject) => {

      this.auth.processing = true;
      this.route.params.subscribe(params => {
        this.groupId = params['group_id'];
        this.schoolId = params['school_id'];
        this.groupName = params['group_name'];

        this.eventService.getGroupEvents(parseInt(this.groupId, 10))
          .then(res => {

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
                future_date: event.future_date,
                signature_document_id: event.signature_document_id,
                signature_document_template_id: event.signature_document_template_id,
                payment_applicable: event.payment_applicable,
                color: event.future_date ? this.colors.blue : this.colors.grey
              });

            });

            const month = moment(new Date());
            this.selectedMonth = month.format('MMMM');

            this.events = tempEvents;
            resolve(this.events);

          });

      }, err => {

        reject(err);


      });


    });

  }


}
