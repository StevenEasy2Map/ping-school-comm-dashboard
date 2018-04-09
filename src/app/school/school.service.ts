import {AuthService} from '../../providers/auth-service';
import {Injectable} from '@angular/core';
import {Http} from '@angular/http';
import {APIService} from '../../providers/api-service';
import {Observable} from 'rxjs';
import {Invitation} from "../group/models/invitation";

@Injectable()
export class SchoolService extends APIService {

  constructor(public auth: AuthService, public http: Http) {
    super(auth, http);
  }

  getAllNonPrivateSchools(): Observable<any> {
    return this.get('/api/school/all_non_private_schools');
  }

  ownMySchool(details: any): Observable<any> {
    return this.post(details, '/api/school/own_my_school');
  }

  getSchoolDetails(schoolId: number): Observable<any> {
    return this.get(`/api/school/school_details/${schoolId}`);
  }

  getAllPrivateSchoolsIAdminister(): Observable<any> {
    return this.get(`/api/school/get_all_private_schools_i_own`);
  }

  getAllPrivateSchoolAdministrators(schoolId): Observable<any> {
    return this.get(`/api/school/get_all_private_school_administrators/${schoolId}`);
  }

  updateMySchool(details: any): Observable<any> {
    return this.post(details, '/api/school/update_school');
  }

  inviteSchoolMember(invitation: Invitation): Observable<any> {
    return this.post(invitation, '/api/school/invite_school_member');
  }

  removeSchoolAdministrator(payload: any): Observable<any> {
    return this.post(payload, '/api/school/remove_school_administrator');
  }

  removeSchoolMember(payload: any): Observable<any> {
    return this.post(payload, '/api/school/remove_school_member');
  }

  uninviteSchoolAdministrator(payload: any): Observable<any> {
    return this.post(payload, '/api/school/uninvite_school_administrator');
  }


}
