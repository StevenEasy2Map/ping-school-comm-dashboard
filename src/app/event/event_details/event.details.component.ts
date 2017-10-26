import {AfterViewInit, Component} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {EventService} from '../services/event.service';
import {FriendlyDatePipe} from '../../common/pipes/friendly.date.pipe';
import {FriendlyDateTimePipe} from '../../common/pipes/friendly.date.time.pipe';
import {Event} from '../models/event';
import {AuthService} from '../../../providers/auth-service';
import {HelperService} from '../../../providers/helper-service';

@Component({
  selector: 'app-event-details-component',
  templateUrl: 'event.details.template.html',
  providers: [EventService],
  styleUrls: ['event.details.style.scss']
})
export class EventDetailsComponent implements AfterViewInit {

  schoolId = 0;
  groupId = 0;
  eventId = 0;
  event: any;
  eventGroups: any[] = [];
  error = '';

  constructor(private auth: AuthService,
              public eventService: EventService,
              public router: Router,
              public route: ActivatedRoute) {


  }

  ngAfterViewInit(): void {

    this.auth.processing = true;
    this.auth.getFirebaseTokenAsPromise().then(() => {
      this.route.params.subscribe(params => {
        this.schoolId = params['school_id'];
        this.groupId = params['group_id'];
        this.eventId = params['event_id'];
        this.getEventDetails();
        this.getEventGroups();
      });
    });

  }

  getEventDetails(): void {

    this.eventService.getEventDetails(this.eventId).subscribe(
      event => {
        this.event = event;
        this.event.start_date = HelperService.timeZoneAdjustedDate(this.event.start_date, this.event.timezone_offset);
        this.event.end_date = HelperService.timeZoneAdjustedDate(this.event.end_date, this.event.timezone_offset);

        console.log(this.event);

      },
      error => {
        this.error = <any>error;
        this.auth.processing = false;
      });


  }

  getEventGroups(): void {

    this.eventService.getEventGroups(this.eventId).subscribe(
      response => {
        this.eventGroups = response;
        console.log(this.eventGroups);
        this.auth.processing = false;

      },
      error => {
        this.error = <any>error;
        this.auth.processing = false;
      });


  }


}
