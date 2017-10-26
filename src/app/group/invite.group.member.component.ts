import {AfterViewInit, Component} from '@angular/core';
import {UserService} from '../security/user.service';
import {Router, ActivatedRoute} from '@angular/router';
import {StorageService} from '../../providers/storage-service';
import {GroupService} from './group.service';
import {School} from './models/school';
import {HelperService} from '../../providers/helper-service';
import {Observable} from 'rxjs';
import {Invitation} from './models/invitation';
import {AuthService} from "../../providers/auth-service";

@Component({
  selector: 'app-invite-group-member-component',
  templateUrl: 'invite.group.member.component.html',
  styleUrls: ['group.style.scss'],
  providers: [GroupService],
})
export class InviteGroupMemberComponent implements AfterViewInit {

  emailAddresses: string[] = [];
  schoolId = '';
  groupId = '';
  token = '';
  role = '';
  motivation = '';
  inviteUsers = false;

  autocompleteInit = {
    placeholder: 'Add another address',
    secondaryPlaceholder: 'Start typing...'
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

    if (!this.role || !this.emailAddresses) {
      return;
    }

    const observables = [];
    this.auth.processing = true;
    this.emailAddresses.forEach(email => {

      observables.push(this.groupService.inviteGroupMember(new Invitation(parseInt(this.schoolId),
        parseInt(this.groupId),
        this.role, email, this.motivation)));
    });

    Observable.forkJoin(observables).subscribe(t => {

      console.log(t);
      this.router.navigateByUrl('/home');

    });

  }

  goHome() {
    this.router.navigate(['/']);
  }

  inviteUsersViaEmail() {
    this.inviteUsers = true;
  }

  add(chip) {
    console.log('Chip added: ' + chip.tag);
    if (HelperService.isValidMailFormat(chip.tag)) {

      let emailAddressAlreadyAdded = false;
      for (let i = 0; i < this.emailAddresses.length; i++) {

        if (this.emailAddresses[i] === chip.tag) {
          emailAddressAlreadyAdded = true;
          break;
        }

      }
      if (!emailAddressAlreadyAdded) {
        this.emailAddresses.push(chip.tag);
      }

    }
  }

  delete(chip) {
    console.log('Chip deleted: ' + chip.tag);

    for (let i = 0; i < this.emailAddresses.length; i++) {

      if (this.emailAddresses[i] === chip.tag) {
        this.emailAddresses.splice(i, 1);
        break;
      }

    }

  }

  select(chip) {
    console.log('Chip selected: ' + chip.tag);
  }

}
