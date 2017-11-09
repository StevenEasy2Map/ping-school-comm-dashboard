import {AfterViewInit, Component} from '@angular/core';
import {UserService} from '../security/user.service';
import {Router, ActivatedRoute} from '@angular/router';
import {StorageService} from '../../providers/storage-service';
import {GroupService} from './group.service';
import {School} from './models/school';
import {HelperService} from '../../providers/helper-service';
import {Observable} from 'rxjs';
import {Invitation} from './models/invitation';
import {AuthService} from '../../providers/auth-service';

@Component({
  selector: 'app-invite-group-member-component',
  templateUrl: 'invite.group.member.component.html',
  styleUrls: ['group.style.scss'],
  providers: [GroupService],
})
export class InviteGroupMemberComponent implements AfterViewInit {

  emailAddresses: string[] = [];
  emailAddressesToSend = [];
  schoolId = '';
  groupId = '';
  token = '';
  role = '';
  motivation = '';
  inviteUsers = false;

  autocompleteInit = {
    placeholder: 'Add another address',
    secondaryPlaceholder: 'Start typing addresses...'
  };

  constructor(private auth: AuthService,
              private router: Router,
              private route: ActivatedRoute,
              private groupService: GroupService) {
  }

  ngAfterViewInit(): void {

    this.auth.getFirebaseTokenAsPromise().then(() => {
      this.route.params.subscribe(params => {
        this.schoolId = params['school_id'];
        this.groupId = params['group_id'];
        this.token = params['token'];
        this.inviteUsers = !!params['invite_others'];
      });

    });

  }

  inviteGroupMembers(): void {

    if (!this.role || !this.emailAddressesToSend) {
      this.router.navigateByUrl('/home');
      return;
    }

    const observables = [];
    this.auth.processing = true;
    this.emailAddressesToSend.forEach(email => {

      observables.push(this.groupService.inviteGroupMember(new Invitation(parseInt(this.schoolId, 10),
        parseInt(this.groupId, 10),
        this.role, email, this.motivation)));
    });

    Observable.forkJoin(observables).subscribe(t => {

      console.log(t);
      this.router.navigateByUrl('/home');

    });

  }

  public onAdd(tag): void {

    console.log('Chip added: ' + tag);
    if (HelperService.isValidMailFormat(tag.display)) {

      let emailAddressAlreadyAdded = false;
      for (let i = 0; i < this.emailAddressesToSend.length; i++) {

        if (this.emailAddressesToSend[i] === tag.display) {
          emailAddressAlreadyAdded = true;
          break;
        }

      }
      if (!emailAddressAlreadyAdded) {
        this.emailAddressesToSend.push(tag.display);
      }

    }

  }

  public onRemove(tag): void {
    console.log('Chip deleted: ' + tag.display);

    for (let i = 0; i < this.emailAddresses.length; i++) {

      if (this.emailAddressesToSend[i] === tag.display) {
        this.emailAddressesToSend.splice(i, 1);
        break;
      }

    }
  }

  goHome() {
    this.router.navigate(['/']);
  }

  inviteUsersViaEmail() {
    this.inviteUsers = true;
  }

}
