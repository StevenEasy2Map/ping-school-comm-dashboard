import {AfterViewInit, Component} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {MatSnackBar} from '@angular/material';
import {DocumentSigningService} from './services/document.signing.service';
import {DetailsBaseComponent} from '../notice/notice_details/details.base.component';

@Component({
  selector: 'app-sign-from-email-component',
  templateUrl: './sign.from.email.template.html',
  providers: [DocumentSigningService],
  styleUrls: ['../notice/notice_details/notice.details.style.scss']
})
export class SignFromEmailComponent extends DetailsBaseComponent implements AfterViewInit {

  schoolId = 0;
  documentId = 0;
  firebaseUserUid = '';
  error = '';
  processingMessage = 'Processing';

  constructor(public router: Router,
              public documentSigningService: DocumentSigningService,
              public snackBar: MatSnackBar,
              public route: ActivatedRoute) {

    super(documentSigningService);
  }

  ngAfterViewInit(): void {

    this.route.params.subscribe(params => {
      this.schoolId = params['school_id'];
      this.documentId = params['document_id'];
      this.firebaseUserUid = params['firebase_user_uid'];
      this.documentSigningService.createFirebaseUserDocument({
        school_id: this.schoolId,
        document_id: this.documentId,
        firebase_user_uid: this.firebaseUserUid
      }).subscribe(
        response => {
          this.loading = false;
          this.processingMessage = 'Thank you, please check your email!';
          this.snackBar.open('Thank you, please check your email!');
          setTimeout(() => {
            this.snackBar.dismiss();
          }, 1500);
        },
        error => {
          this.error = <any>error;
          this.processingMessage = this.error.toString();
          this.loading = false;
        });
    });

  }


}
