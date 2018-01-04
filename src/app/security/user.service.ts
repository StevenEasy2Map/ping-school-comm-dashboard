import {User} from './models/user';
import {Injectable} from '@angular/core';
import {AuthService} from '../../providers/auth-service';
import {APIService} from '../../providers/api-service';
import {Http} from '@angular/http';
import {Observable} from 'rxjs';

@Injectable()
export class UserService extends APIService {

  constructor(public auth: AuthService, public http: Http) {
    super(auth, http);
  }

  createUserWithPassword(user: User, password: string): Promise<any> {
    return this.auth.createUserWithEmailAndPassword(user.email, password);
  }

  registerUser(user: User): Observable<any> {
    return this.post(user, '/api/security/register_user');
  }

}
