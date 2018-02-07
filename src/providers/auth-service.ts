import {Injectable} from '@angular/core';
import {Component} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {AngularFireAuth} from 'angularfire2/auth';
import * as firebase from 'firebase/app';
import {Subscription} from "rxjs";
import {Router} from "@angular/router";

@Injectable()
export class AuthService {

  user: Observable<firebase.User>;
  private token: string;
  public processing = false;

  constructor(public afAuth: AngularFireAuth, private router: Router) {
    this.user = this.afAuth.authState;

    if (!!this.afAuth.auth.currentUser) {
      this.getFirebaseTokenAsPromise().then(token => {
        this.token = token;
      });
    }
  }

  getFirebaseTokenAsPromise(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.afAuth.auth.currentUser.getIdToken(true).then(token => {
        this.token = token;
        resolve(token);
      });
    });
  }

  get firebaseUserToken(): string {
    return this.token;
  }

  get authenticated(): boolean {
    return !!this.afAuth.auth.currentUser;
  }

  signInWithPassword(email: string, password: string): Promise<any> {
    return this.afAuth.auth.signInWithEmailAndPassword(email, password);
  }

  signOut(): void {
    this.afAuth.auth.signOut().then(() => {
      this.user = null;
      this.token = null;
      this.router.navigateByUrl('/landing');
    });
  }

  createUserWithEmailAndPassword(email: string, password: string): Promise<any> {

    return this.afAuth.auth.createUserWithEmailAndPassword(email, password);
  }

  getUid(): string {
    return this.afAuth.auth.currentUser.uid;
  }
}
