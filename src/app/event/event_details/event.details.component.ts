import {AfterViewInit, Component} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {EventService} from '../services/event.service';
import {FriendlyDatePipe} from '../../common/pipes/friendly.date.pipe';
import {FriendlyDateTimePipe} from '../../common/pipes/friendly.date.time.pipe';
import {Event} from '../models/event';
import {AuthService} from '../../../providers/auth-service';
import {HelperService} from '../../../providers/helper-service';
import {DetailsBaseComponent} from "../../notice/notice_details/details.base.component";
import {DocumentSigningService} from "../../document_signing/services/document.signing.service";
import {MatSnackBar} from "@angular/material";

@Component({
  selector: 'app-event-details-component',
  templateUrl: 'event.details.template.html',
  providers: [EventService, DocumentSigningService],
  styleUrls: ['event.details.style.scss']
})
export class EventDetailsComponent extends DetailsBaseComponent implements AfterViewInit {

  schoolId = 0;
  groupId = 0;
  eventId = 0;
  event: any;
  eventGroups: any[] = [];
  error = '';
  loading = true;

  constructor(private auth: AuthService,
              public eventService: EventService,
              public router: Router,
              public documentSigningService: DocumentSigningService,
              public snackBar: MatSnackBar,
              public route: ActivatedRoute) {

    super(documentSigningService);

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
        this.event.description = this.event.description.replace("'", "").replace("'", "");
        this.event.start_date = HelperService.timeZoneAdjustedDate(this.event.start_date, this.event.timezone_offset);
        this.event.end_date = HelperService.timeZoneAdjustedDate(this.event.end_date, this.event.timezone_offset);

        console.log(this.event);
        this.loading = false;

      },
      error => {
        this.error = <any>error;
        this.auth.processing = false;
      });


  }

  signDocument() {
    this.loading = true;
    this.digitallySignDocument(this.schoolId, this.event.signature_document_id).subscribe(
      response => {
        this.loading = false;
        this.event.signature_user_document_status = 'complete';
        this.snackBar.open('Thank you, please check your email!');
        setTimeout(() => {
          this.snackBar.dismiss();
        }, 1500);
      },
      error => {
        this.error = <any>error;
        this.loading = false;
      });
  }

  goBack() {
    window.history.back();
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
