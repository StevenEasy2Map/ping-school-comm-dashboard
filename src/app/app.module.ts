import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {HttpModule} from '@angular/http';
import {AppComponent} from './app.component';
import {AngularFireModule} from 'angularfire2';
import {environment} from '../environments/environment';
import {RouterModule, Routes} from '@angular/router';
import {HomeComponent} from './home/home.component';
import {AuthGuard} from '../providers/auth-guard';
import {SignInComponent} from './security/signin.component';
import {SignUpComponent} from './security/signup.component';
import {InviteGroupMemberComponent} from './group/invite.group.member.component';
import {NoticeDetailsComponent} from './notice/notice_details/notice.details.component';
import {NewNoticeComponent} from './notice/notice_new/notice.new.component';
import {MyNoticeListComponent} from './notice/notice_list/my.notice.list.component';
import {GroupNoticeListComponent} from './notice/notice_list/group.notice.list.component';
import {GroupEventListComponent} from './event/event_list/group.event.list.component';
import {GroupEventsCalendarComponent} from './event/events_calendar/group.events.calendar.component';
import {NewGroupStep1Component} from './group/new.group.step1.component';
import {NewGroupStep2Component} from './group/new.group.step2.component';
import {EditGroupComponent} from './group/edit_group/edit.group.component';
import {EventDetailsComponent} from './event/event_details/event.details.component';
import {MyEventListComponent} from './event/event_list/my.event.list.component';
import {HeaderComponent} from './common/header.component';
import {FooterComponent} from './common/footer.component';
import {MaterializeModule} from 'angular2-materialize';
import {FriendlyDatePipe} from './common/pipes/friendly.date.pipe';
import {FriendlyDateTimePipe} from './common/pipes/friendly.date.time.pipe';
import {EllipsisPipe} from './common/pipes/ellipsis.pipe';
import {AuthService} from '../providers/auth-service';
import {StorageService} from '../providers/storage-service';
import {APIService} from '../providers/api-service';
import {HelperService} from '../providers/helper-service';
import {AngularFireAuth} from 'angularfire2/auth';
import {LandingComponent} from './landing/landing.component';
import {NoticePaymentListComponent} from './notice/notice_payments_list/notice.payment.list.component';
import {NoticePaymentDetailsComponent} from './notice/notice_payment_details/notice.payment.details.component';
import {CKEditorModule} from 'ng2-ckeditor';
import {EventPaymentListComponent} from './event/event_payments_list/event.payment.list.component';
import {EventPaymentDetailsComponent} from './event/event_payment_details/event.payment.details.component';
import {GroupMemberDetailsComponent} from './group/group_member_details/group.member.details.component';
import {NewEventComponent} from './event/event_new/event.new.component';
import {EntityDocSignedListComponent} from './document_signing/entity.doc.signed.list.component';
import {EntityPaymentsListComponent} from './payments/entity.payments.list.component';
import {NumberPadPipe} from './common/pipes/number.pad.pipe';
import {CalendarModule} from 'angular-calendar';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {NguiAutoCompleteModule} from '@ngui/auto-complete';
import {TagInputModule} from 'ngx-chips';
import {GroupMembersComponent} from './group/group_members/group.members.component';
import {UploadSignedDocComponent} from './document_signing/upload.signed.doc.component';
import {ModalModule} from 'ngx-modialog';
import {BootstrapModalModule} from '../../node_modules/ngx-modialog/plugins/bootstrap';
import {OwnMySchoolComponent} from './school/own.my.school.component';
import {UpdateMySchoolComponent} from './school/update.my.school.component';
import {InviteSchoolMemberComponent} from './school/invite.school.member.component';
import {SchoolAdministratorsComponent} from './school/school_administrators/school.administrators.component';
import {MatButtonModule, MatCardModule, MatDatepickerModule, MatDialogModule, MatExpansionModule, MatIconModule, MatRadioModule, MatSelectModule, MatSnackBarModule, MatTabsModule, MatNativeDateModule, DateAdapter} from '@angular/material';
import {DialogAreYouSureComponent} from './common/modals/are.you.sure.component';
import {SignFromEmailComponent} from './document_signing/sign.from.email.component';
import {NewHomeworkComponent} from './notice/homework_new/homework.new.component';
import {GroupHomeworkListComponent} from './notice/notice_list/group.homework.list.component';
import {JoinGroupComponent} from './group/join_group/join.group.component';
import {EventDateTimePipe} from './common/pipes/event.date.time.pipe';
import {EventDateTimeFromToPipe} from './common/pipes/event.date.time.from.to.pipe';
import {GoogleCalendarApiClientService} from "./event/google_calendar_api/google.calendar.api.client.service";
import {DialogShareUrlComponent} from "./common/modals/share.url.component";

const appRoutes: Routes = [
  {path: 'landing', component: LandingComponent},
  {path: 'signup', component: SignUpComponent},
  {path: 'signin', component: SignInComponent},
  {path: 'sign-from-email', component: SignFromEmailComponent},
  {path: 'home', component: HomeComponent, canActivate: [AuthGuard]},

  {path: 'invite-group-member', component: InviteGroupMemberComponent, canActivate: [AuthGuard]},

  {path: 'notice-details', component: NoticeDetailsComponent, canActivate: [AuthGuard]},
  {path: 'new-notice', component: NewNoticeComponent, canActivate: [AuthGuard]},
  {path: 'new-homework', component: NewHomeworkComponent, canActivate: [AuthGuard]},
  {path: 'my-notices-list', component: MyNoticeListComponent, canActivate: [AuthGuard]},
  {path: 'group-notices-list', component: GroupNoticeListComponent, canActivate: [AuthGuard]},
  {path: 'group-homework-list', component: GroupHomeworkListComponent, canActivate: [AuthGuard]},
  {path: 'notice-payments-list', component: NoticePaymentListComponent, canActivate: [AuthGuard]},
  {path: 'notice-payment-details', component: NoticePaymentDetailsComponent, canActivate: [AuthGuard]},

  {path: 'group-events-list', component: GroupEventListComponent, canActivate: [AuthGuard]},
  {path: 'join-group', component: JoinGroupComponent, canActivate: [AuthGuard]},
  {path: 'group-events-calendar', component: GroupEventsCalendarComponent, canActivate: [AuthGuard]},
  {path: 'new-group-step-1', component: NewGroupStep1Component, canActivate: [AuthGuard]},
  {path: 'new-group-step-2', component: NewGroupStep2Component, canActivate: [AuthGuard]},
  {path: 'edit-group', component: EditGroupComponent, canActivate: [AuthGuard]},
  {path: 'group-member-details', component: GroupMemberDetailsComponent, canActivate: [AuthGuard]},
  {path: 'group-members', component: GroupMembersComponent, canActivate: [AuthGuard]},

  {path: 'event-details', component: EventDetailsComponent, canActivate: [AuthGuard]},
  {path: 'new-event', component: NewEventComponent, canActivate: [AuthGuard]},
  {path: 'my-events-list', component: MyEventListComponent, canActivate: [AuthGuard]},
  {path: 'event-payments-list', component: EventPaymentListComponent, canActivate: [AuthGuard]},
  {path: 'event-payment-details', component: EventPaymentDetailsComponent, canActivate: [AuthGuard]},

  {path: 'entity-doc-signed-list', component: EntityDocSignedListComponent, canActivate: [AuthGuard]},
  {path: 'entity-payments-list', component: EntityPaymentsListComponent, canActivate: [AuthGuard]},
  {path: 'upload-signed-doc', component: UploadSignedDocComponent, canActivate: [AuthGuard]},
  {path: 'own-my-own-school', component: OwnMySchoolComponent, canActivate: [AuthGuard]},
  {path: 'update-my-school', component: UpdateMySchoolComponent, canActivate: [AuthGuard]},
  {path: 'invite-school-member', component: InviteSchoolMemberComponent, canActivate: [AuthGuard]},
  {path: 'school-administrators', component: SchoolAdministratorsComponent, canActivate: [AuthGuard]},

  {path: '', component: HomeComponent, canActivate: [AuthGuard]}

];

@NgModule({
  declarations: [
    AppComponent,


    HeaderComponent,
    FooterComponent,
    LandingComponent,
    SignInComponent,
    SignUpComponent,
    HomeComponent,
    SignFromEmailComponent,
    NewGroupStep1Component,
    NewGroupStep2Component,
    InviteGroupMemberComponent,

    NoticeDetailsComponent,
    NewNoticeComponent,
    NewHomeworkComponent,
    MyNoticeListComponent,
    NoticePaymentListComponent,
    NoticePaymentDetailsComponent,
    GroupNoticeListComponent,
    GroupHomeworkListComponent,
    GroupMemberDetailsComponent,
    GroupMembersComponent,

    EventDetailsComponent,
    NewEventComponent,
    MyEventListComponent,
    GroupEventListComponent,
    GroupEventsCalendarComponent,
    EditGroupComponent,
    EventPaymentListComponent,
    EventPaymentDetailsComponent,
    JoinGroupComponent,

    EntityDocSignedListComponent,
    EntityPaymentsListComponent,

    UploadSignedDocComponent,

    OwnMySchoolComponent,
    UpdateMySchoolComponent,
    InviteSchoolMemberComponent,
    SchoolAdministratorsComponent,

    FriendlyDatePipe,
    FriendlyDateTimePipe,
    EllipsisPipe,
    NumberPadPipe,
    EventDateTimePipe,
    EventDateTimeFromToPipe,

    DialogAreYouSureComponent,
    DialogShareUrlComponent


  ],
  entryComponents: [DialogAreYouSureComponent, DialogShareUrlComponent],
  imports: [
    BrowserModule,
    MaterializeModule,
    FormsModule,
    CKEditorModule,
    HttpModule,
    NguiAutoCompleteModule,
    TagInputModule,
    BrowserAnimationsModule,
    RouterModule.forRoot(appRoutes),
    BrowserAnimationsModule,
    CalendarModule.forRoot(),

    ModalModule.forRoot(),
    BootstrapModalModule,

    AngularFireModule.initializeApp(environment.firebase),
    MatTabsModule, MatCardModule, MatButtonModule, MatIconModule, MatSnackBarModule, MatExpansionModule,
    MatRadioModule, MatSelectModule, MatDialogModule, MatDatepickerModule, MatNativeDateModule
  ],
  providers: [AppComponent, AuthService, AuthGuard, StorageService, APIService, HelperService, AngularFireAuth, GoogleCalendarApiClientService],
  bootstrap: [AppComponent]
})
export class AppModule {
}
