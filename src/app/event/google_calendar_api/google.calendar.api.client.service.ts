import {AppSettings} from '../../app.settings';
import {EventEmitter, Injectable} from "@angular/core";

declare var gapi: any;

@Injectable()
export class GoogleCalendarApiClientService {

  event: any = {};
  eventAdded$: EventEmitter<any>;

  constructor() {
    this.eventAdded$ = new EventEmitter();
  }

  initEventInsert(event) {
    this.event = event;
    const updateSigninStatus = this.updateSigninStatus.bind(this);
    const initClient = this.initClient.bind(this, updateSigninStatus);
    gapi.load('client:auth2', initClient);
  }

  private initClient(updateSigninStatus) {

    gapi.client.init({
      apiKey: AppSettings.GOOGLE_API_KEY,
      clientId: AppSettings.GOOGLE_API_CLIENT_ID,
      discoveryDocs: AppSettings.GOOGLE_CALENDAR_API_DISCOVERY_DOCS,
      scope: AppSettings.GOOGLE_CALENDAR_API_READ_WRITE_SCOPE
    }).then(() => {

      // Handle the initial sign-in state.
      if (!gapi.auth2.getAuthInstance().isSignedIn.get()) {
        gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);
        gapi.auth2.getAuthInstance().signIn();
      } else {
        this.insertEvent();
      }
    });
  }

  private insertEvent() {

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
      gapi.auth2.getAuthInstance().signOut();
      this.eventAdded$.emit(true);
    });

  }

  updateSigninStatus(isSignedIn) {
    if (isSignedIn) {
      console.log('signed in');
      this.insertEvent();

    } else {
      console.log('signed out');
    }
  }

}
