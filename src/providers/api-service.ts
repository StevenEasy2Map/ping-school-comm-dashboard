import {Injectable} from '@angular/core';
import {Http, Response, Headers, RequestOptions} from '@angular/http';
import {Observable} from 'rxjs';
import {AppSettings} from '../app/app.settings';
import {AuthService} from './auth-service';

@Injectable()
export class APIService {

  private apiUrl = `${AppSettings.IN_DEV_MODE ? AppSettings.NODE_SERVER_URL_TEST : AppSettings.NODE_SERVER_URL_LIVE}`;

  constructor(public auth: AuthService, public http: Http) {

  }

  get(url: string): Observable<any> {

    console.log(this.auth.firebaseUserToken);
    console.log(this.auth.authenticated);

    url += `/${this.auth.firebaseUserToken}`;
    return this.http.get(`${this.apiUrl}${url}`)
      .map(this.extractData)
      .catch(this.handleError);

  }

  getAsPromise(url: string): Promise<any> {

    console.log(this.auth.firebaseUserToken);
    console.log(this.auth.authenticated);

    url += `/${this.auth.firebaseUserToken}`;
    return this.http.get(`${this.apiUrl}${url}`)
      .toPromise()
      .then(this.extractData)
      .catch(this.handleError);

  }

  post(data: any, url: string): Observable<any> {

    const headers = new Headers({'Content-Type': 'application/json'});
    const options = new RequestOptions({headers: headers});

    const body = {};
    for (const item in data) {
      body[item] = data[item];
    }

    body['user_token_id'] = this.auth.firebaseUserToken;

    return this.http.post(`${this.apiUrl}${url}`, body, options)
      .map(this.extractData)
      .catch(this.handleError);

  }

  private extractData(res: Response) {
    console.log(res.json());
    const body = res.json();
    return body || {};
  }

  private handleError(error: Response | any) {
    // In a real world app, you might use a remote logging infrastructure
    let errMsg: string;
    if (error instanceof Response) {
      const body = error.json() || '';
      const err = body.error || JSON.stringify(body);
      errMsg = `${error.status} - ${error.statusText || ''} ${err}`;
    } else {
      errMsg = error.message ? error.message : error.toString();
    }
    console.error(errMsg);
    return Observable.throw(errMsg);
  }

}
