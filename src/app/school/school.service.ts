import {AuthService} from '../../providers/auth-service';
import {Injectable} from '@angular/core';
import {Http} from '@angular/http';
import {APIService} from '../../providers/api-service';
import {Observable} from 'rxjs';

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

  updateMySchool(details: any): Observable<any> {
    return this.post(details, '/api/school/update_school');
  }


}
