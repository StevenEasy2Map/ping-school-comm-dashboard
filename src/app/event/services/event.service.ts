import {AuthService} from "../../../providers/auth-service";
import {Injectable} from '@angular/core';
import {Http} from '@angular/http';
import {APIService} from "../../../providers/api-service";
import {Observable} from "rxjs";
import {Event} from "../models/event";

@Injectable()
export class EventService extends APIService {

  constructor(public auth: AuthService, public http: Http) {
    super(auth, http);
  }

  getMyEvents(): Observable<any> {
    return this.get('/api/event/my_events');
  }

  getEventDetails(eventId: number): Observable<any> {
    return this.get(`/api/event/event_details/${eventId}`);
  }

  getGroupEvents(groupId: number): Promise<any> {
    return this.getAsPromise(`/api/event/group_events/${groupId}`);
  }

  getEventGroups(eventId: number): Observable<any> {
    return this.get(`/api/event/event_groups/${eventId}`);
  }

  createEvent(event: any): Observable<any> {
    return this.post(event, '/api/event/create_event');
  }

  editEvent(event: any): Observable<any> {
    return this.post(event, '/api/event/edit_event');
  }

  deleteEvent(event: any): Observable<any> {
    return this.post(event, '/api/event/delete_event');
  }

  markAsRead(payload: any): Observable<any> {
    return this.post(payload, '/api/event/mark_as_read');
  }

  getEventPayments(eventId: number, groupId: number, schoolId: number): Observable<any> {
    return this.get(`/api/event/event_payments/${eventId}/${groupId}/${schoolId}`);
  }

  getEventPaymentDetails(paymentId: number, eventId: number, groupId: number, schoolId: number): Observable<any> {
    return this.get(`/api/event/event_payment_details/${paymentId}/${eventId}/${groupId}/${schoolId}`);
  }

  makeEventPayment(event: any): Observable<any> {
    return this.post(event, '/api/event/event_payment');
  }

  updateEventPaymentDetails(event: any): Observable<any> {
    return this.post(event, '/api/event/update_event_payment');
  }

  hideEventFromFeed(payload: any): Observable<any> {
    return this.post(payload, '/api/event/hide_from_feed');
  }

  updateHiddenEventCount(): Observable<any> {
    return this.get('/api/event/update_user_hidden_event_count');
  }


}
