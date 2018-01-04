import {AfterViewInit, Component} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {AuthService} from '../../providers/auth-service';
import {SchoolService} from './school.service';
import {StorageService} from '../../providers/storage-service';

@Component({
  selector: 'app-update-my-school-component',
  templateUrl: 'update.my.school.component.html',
  styleUrls: ['./school.style.scss'],
  providers: [SchoolService],
})
export class UpdateMySchoolComponent implements AfterViewInit {

  error = '';
  schoolDetails: any = {};
  schoolId = 0;

  constructor(private auth: AuthService,
              private router: Router,
              public route: ActivatedRoute,
              private storageService: StorageService,
              private schoolService: SchoolService) {
  }

  ngAfterViewInit(): void {

    this.auth.processing = true;
    this.auth.getFirebaseTokenAsPromise().then(() => {
      this.route.params.subscribe(params => {
        this.schoolId = parseInt(params['school_id'], 10);
        this.getSchoolDetails();
        this.setupFileUploadLogic();
      });
    });

  }

  editMySchool(): void {

    if (!this.schoolDetails) {
      return;
    }

    const details = {
      school_details: this.schoolDetails
    };

    this.auth.processing = true;

    this.auth.getFirebaseTokenAsPromise().then(() => {

      this.schoolService.updateMySchool(details).subscribe(
        res => {
          this.router.navigateByUrl('/home');
        },
        error => this.error = <any>error);
    });

  }

  setupFileUploadLogic(): void {

    const imageUpload = document.getElementById('imageUpload');
    imageUpload.addEventListener('change', (e) => {
      const imageFile = e.target['files'][0];
      this.auth.processing = true;
      this.storageService.uploadFileToCloudStorage('/school_images/', imageFile).then(
        storageInfo => {
          console.log(storageInfo.downloadURL);
          this.schoolDetails.logo = storageInfo.downloadURL;
          this.auth.processing = false;
        }, errMessage => {
          alert(errMessage);
          this.auth.processing = false;
        });
    });


  }

  getSchoolDetails(): void {

    this.auth.processing = true;
    this.schoolService.getSchoolDetails(this.schoolId).subscribe(
      school => {
        this.schoolDetails = school;
        this.auth.processing = false;

      },
      error => {
        this.error = <any>error;
        this.auth.processing = false;
      });
  }


}
