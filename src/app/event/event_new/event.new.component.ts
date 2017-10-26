import {Component, Input, ElementRef, OnInit, ViewEncapsulation, AfterViewInit} from '@angular/core';
import {Router, ActivatedRoute, Params} from '@angular/router';
import 'rxjs/add/operator/switchMap';
import {Observable} from 'rxjs/Observable';
import {Event} from '../models/event';
import {StorageService} from '../../../providers/storage-service';
import {EventService} from '../services/event.service';
import {FriendlyDatePipe} from '../../common/pipes/friendly.date.pipe';
import {HelperService} from '../../../providers/helper-service';
import {AuthService} from '../../../providers/auth-service';
import {DatePickerOptions, DateModel} from 'ng2-datepicker';
import {GroupService} from '../../group/group.service';
import {Group} from '../../group/models/group';
import * as moment from 'moment';


// https://www.npmjs.com/package/ng2-datepicker

@Component({
  selector: 'app-event-new-component',
  templateUrl: 'event.new.template.html',
  styleUrls: ['event.new.style.scss'],
  providers: [EventService, GroupService],
  encapsulation: ViewEncapsulation.None
})
export class NewEventComponent implements OnInit, AfterViewInit {

  event: Event = this.initiateNewEvent();
  groupId = 0;
  schoolId = 0;
  eventId = 0;
  eventGroups: any[] = [];
  groups: any[] = [];
  groupSummary: any = {};

  error = '';
  startDateModel: DateModel;
  startDateOptions: DatePickerOptions;

  endDateModel: DateModel;
  endDateOptions: DatePickerOptions;

  startTimeHours = this.padNumber((new Date()).getHours());
  startTimeMinutes = this.padNumber((new Date()).getMinutes());

  endTimeHours = this.padNumber((new Date()).getHours());
  endTimeMinutes = this.padNumber((new Date()).getMinutes());

  hours = Array.from({length: 24}, (v, i) => i);
  minutes = Array.from({length: 60}, (v, i) => i);

  paymentApplicable = false;
  allowUsersToSetPaymentAmount = false;
  appendPaymentRefUserLastName = false;

  constructor(private auth: AuthService,
              public eventService: EventService,
              public groupService: GroupService,
              public storageService: StorageService,
              public router: Router,
              public route: ActivatedRoute) {

  }

  ngOnInit() {

    const currentDate = new Date();

    this.startDateOptions = new DatePickerOptions({
      initialDate: currentDate,
      format: 'DD MMMM, YYYY'
    });

    this.endDateOptions = new DatePickerOptions({
      initialDate: currentDate,
      format: 'DD MMMM, YYYY'
    });

    this.getEditEventDetails();

  }

  ngAfterViewInit(): void {

    this.setupFileUploadLogic();
  }

  padNumber(i: number): string {

    if (i < 10) {
      return '0' + i;
    }
    return '' + i;

  }

  initiateNewEvent(): Event {

    const currentDate = new Date();

    return new Event(0, currentDate.toString(),
      currentDate.toString(), currentDate.toString(), '', '', '', '', 0, '', '', '', '', '', 0, 0, 0, '', '', '', '', '', '', 1);

  }

  getGroupSummary(): void {

    this.groupService.getGroupSummary(this.groupId).subscribe(
      response => {

        this.groupSummary = response.group_summary;

      }, error => {
        this.error = <any>error;
      });

  }

  getEditEventDetails(): void {

    this.auth.getFirebaseTokenAsPromise().then(() => {
      this.route.params.subscribe(params => {
        this.eventId = params['event_id'];

        if (params['group_id']) {
          this.groupId = params['group_id'];
        }
        if (params['school_id']) {
          this.schoolId = params['school_id'];
        }

        this.getGroupSummary();

        if (this.eventId) {

          this.getEventDetails();
          this.getEventGroups();

        }

      });

    });
  }


  getEventDetails(): void {

    this.auth.processing = true;
    this.eventService.getEventDetails(this.eventId).subscribe(
      response => {
        this.auth.processing = false;
        this.event = response;
        console.log(this.event);

        const startDate: Date = HelperService.timeZoneAdjustedDate(this.event.start_date, this.event.timezone_offset);
        const endDate: Date = HelperService.timeZoneAdjustedDate(this.event.end_date, this.event.timezone_offset);

        const startDateModel: DateModel = new DateModel();
        const startMomentObj = moment(startDate, 'DD MMMM, YYYY');
        startDateModel.momentObj = startMomentObj;
        startDateModel.formatted = moment(startDate).format('DD MMMM, YYYY');
        this.startDateModel = startDateModel;

        this.startDateOptions = new DatePickerOptions({
          initialDate: startDate,
          format: 'DD MMMM, YYYY'
        });

        const endDateModel: DateModel = new DateModel();
        const endMomentObj = moment(endDate, 'DD MMMM, YYYY');
        endDateModel.momentObj = endMomentObj;
        endDateModel.formatted = moment(endDate).format('DD MMMM, YYYY');
        this.endDateModel = endDateModel;

        this.endDateOptions = new DatePickerOptions({
          initialDate: endDate,
          format: 'DD MMMM, YYYY'
        });

        this.allowUsersToSetPaymentAmount = !!this.event.payment_allow_user_to_set;
        this.appendPaymentRefUserLastName = !!this.event.payment_ref_append_lastname;
        this.paymentApplicable = !!this.event.payment_applicable;

        if (this.event.start_date) {
          this.startTimeHours = this.padNumber(startDate.getHours());
          this.startTimeMinutes = this.padNumber(startDate.getMinutes());
        }

        if (this.event.end_date) {
          this.endTimeHours = this.padNumber(endDate.getHours());
          this.endTimeMinutes = this.padNumber(endDate.getMinutes());
        }

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

      },
      error => {
        this.error = <any>error;
      });


  }

  getMyGroups(): void {

    this.groupService.getMyGroups().subscribe(
      results => {
        this.groups = results;

      },
      error => this.error = <any>error);


  }

  setupFileUploadLogic(): void {

    const fileUpload = document.getElementById('fileUpload');
    fileUpload.addEventListener('change', (e) => {
      const file = e.target['files'][0];
      this.auth.processing = true;
      this.storageService.uploadFileToCloudStorage('/event_documents/', file).then(
        storageInfo => {
          this.event.attachment_link = storageInfo.downloadURL;
          this.auth.processing = false;
        }, errMessage => {
          alert(errMessage);
          this.auth.processing = false;
        });
    });
    const imageUpload = document.getElementById('imageUpload');
    imageUpload.addEventListener('change', (e) => {
      const imageFile = e.target['files'][0];
      this.auth.processing = true;
      this.storageService.uploadFileToCloudStorage('/event_images/', imageFile).then(
        storageInfo => {
          console.log(this.event);
          console.log(storageInfo.downloadURL);
          this.event.image = storageInfo.downloadURL;
          console.log(this.event.image);
          this.auth.processing = false;
        }, errMessage => {
          alert(errMessage);
          this.auth.processing = false;
        });
    });


  }

  backToList(): void {
    this.router.navigate(['/group-events-calendar', {group_id: this.groupId, school_id: this.schoolId}]);
  }

  createEvent(): void {

    this.event.start_date = new Date(this.startDateModel.momentObj.toString()).toString();
    this.event.end_date = new Date(this.endDateModel.momentObj.toString()).toString();

    this.event.payment_allow_user_to_set = this.allowUsersToSetPaymentAmount ? 1 : 0;
    this.event.payment_ref_append_lastname = this.appendPaymentRefUserLastName ? 1 : 0;
    this.event.payment_applicable = this.paymentApplicable ? 1 : 1;

    const s = new Date(this.event.start_date);
    s.setHours(parseInt(this.startTimeHours, 10));
    s.setMinutes(parseInt(this.startTimeMinutes, 10));
    this.event.start_date = s.toString();

    this.event.timezone_offset = (new Date(this.event.start_date)).getTimezoneOffset();

    const e = new Date(this.event.end_date);
    e.setHours(parseInt(this.endTimeHours, 10));
    e.setMinutes(parseInt(this.endTimeMinutes, 10));
    this.event.end_date = e.toString();

    const postValue = {};
    for (const item in this.event) {
      if (this.event.hasOwnProperty(item)) {
        postValue[item] = this.event[item];
      }
    }

    postValue['group_ids'] = [this.groupId];
    postValue['school_id'] = this.schoolId;

    if (!!this.eventId) {

      this.eventService.editEvent(postValue).subscribe(
        () => {
          this.backToList();
        },
        error => this.error = <any>error);

    } else {

      this.eventService.createEvent(postValue).subscribe(
        () => {
          this.backToList();
        },
        error => this.error = <any>error);

    }

  }


}
