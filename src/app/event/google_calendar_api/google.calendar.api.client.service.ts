import {AppSettings} from '../../app.settings';
import {EventEmitter, Injectable} from '@angular/core';

declare var gapi: any;

@Injectable()
export class GoogleCalendarApiClientService {

  // https://developers.google.com/identity/sign-in/web/listeners
  // https://developers.google.com/identity/sign-in/web/reference
  // https://developers.google.com/google-apps/calendar/v3/reference/events/insert

  event: any = {};
  eventAddedToCalendar$: EventEmitter<any>;
  errorEncountered$: EventEmitter<any>;

  constructor() {
    this.eventAddedToCalendar$ = new EventEmitter();
    this.errorEncountered$ = new EventEmitter();
  }

  initEventInsert(event) {
    this.event = event;
    const insertEvent = this.insertEvent.bind(this);
    const signOut = this.signOut.bind(this);
    const raiseError = this.raiseError.bind(this);
    const initClient = this.initClient.bind(this, insertEvent, signOut, raiseError);
    gapi.load('client:auth2', initClient);
  }

  private initClient(insertEvent, signOut, raiseError) {

    gapi.client.init({
      apiKey: AppSettings.GOOGLE_API_KEY,
      clientId: AppSettings.GOOGLE_API_CLIENT_ID,
      discoveryDocs: AppSettings.GOOGLE_CALENDAR_API_DISCOVERY_DOCS,
      scope: AppSettings.GOOGLE_CALENDAR_API_READ_WRITE_SCOPE
    }).then(() => {

      // Handle the initial sign-in state.
      if (!gapi.auth2.getAuthInstance().isSignedIn.get()) {

        gapi.auth2.getAuthInstance().signIn({prompt: 'select_account'})
          .then(insertEvent)
          .then(signOut)
          .catch(raiseError);

      } else {

        insertEvent()
          .then(signOut)
          .catch(raiseError);

      }
    }).catch(err => {
      raiseError(err);
    });
  }

  private raiseError(err) {
    this.errorEncountered$.emit(err);
  }

  private signOut() {
    gapi.auth2.getAuthInstance().signOut();
    console.log('signed out');
    this.eventAddedToCalendar$.emit(true);
  }

  private insertEvent(): Promise<any> {

    return new Promise((resolve, reject) => {

      const event = {
        'summary': `${this.event['group_name']} - ${this.event['title']}`,
        'start': {
          'dateTime': this.event.start_date
        },
        'end': {
          'dateTime': this.event.end_date
        },
        'reminders': {
          'useDefault': true
        }
      };

      const request = gapi.client.calendar.events.insert({
        'calendarId': 'primary',
        'resource': event
      });

      request.execute((e) => {
        console.log(e);
        resolve(true);
      });
    });

  }


}
