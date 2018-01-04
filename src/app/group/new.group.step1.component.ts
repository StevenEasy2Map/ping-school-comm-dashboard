import {AfterViewInit, Component} from '@angular/core';
import {UserService} from '../security/user.service';
import {Router} from '@angular/router';
import {StorageService} from '../../providers/storage-service';
import {GroupService} from './group.service';
import {School} from './models/school';
import * as $ from 'jquery';
import {AuthService} from "../../providers/auth-service";
import {SchoolService} from "../school/school.service";

@Component({
  selector: 'new-group-step1-component',
  templateUrl: 'new.group.step1.component.html',
  styleUrls: ['./group.style.scss'],
  providers: [GroupService, SchoolService],
})
export class NewGroupStep1Component implements AfterViewInit {

  error = '';
  schoolName: any = '';
  schoolImage = '';
  schoolDetails: any = {};
  schoolsList: any = [];
  selectedSchool: any = null;
  arrayOfSchools = [];
  mySchools = [];

  constructor(private auth: AuthService,
              private userService: UserService,
              private router: Router,
              private storageService: StorageService,
              private groupService: GroupService,
              private schoolService: SchoolService) {
  }

  ngAfterViewInit(): void {
    this.auth.getFirebaseTokenAsPromise().then(() => {
      this.setupImageUploadLogic();
      this.getAllSchools();
      this.getAllSchoolsIAdminister();
    });
  }

  schoolSelected(): void {

    if (!this.schoolName['id']) {
      return;
    }

    console.log(this.schoolName);
    const selectedSchool = this.schoolName;

    localStorage.setItem('newGroupSchoolId', selectedSchool['id']);
    this.router.navigate(['/new-group-step-2', {school_id: selectedSchool['id'], school_name: selectedSchool['name']}]);

  }

  selectMySchool(school) {

    localStorage.setItem('newGroupSchoolId', school.id);
    this.router.navigate(['/new-group-step-2', {school_id: school.id, school_name: school.name}]);

  }

  autocompleListFormatter = (data: any) => {
    const html = `<span style='color:red'>${data.name} </span>`;
    return html;
  }

  createSchool(): void {

    const school = new School('', this.schoolName, this.schoolImage, '', 0);
    if (school.name.trim().length === 0) {
      return;
    }

    this.auth.processing = true;

    this.auth.getFirebaseTokenAsPromise().then(() => {

      this.groupService.createSchool(school).subscribe(
        res => {
          this.schoolDetails = res.school;
          this.auth.processing = false;
          localStorage.setItem('newGroupSchoolId', this.schoolDetails.id);
          this.router.navigate(['/new-group-step-2', {school_id: this.schoolDetails.id, school_name: this.schoolDetails.name}]);
        },
        error => this.error = <any>error);

    });

  }

  getAllSchools(): void {

    this.auth.processing = true;
    this.schoolService.getAllNonPrivateSchools().subscribe(
      schools => {
        this.schoolsList = schools;
        this.schoolsList.forEach(school => {

          this.arrayOfSchools.push({
            id: school.id,
            name: school.name
          });

        });
        this.auth.processing = false;

      },
      error => {
        this.error = <any>error;
        this.auth.processing = false;
      });
  }

  getAllSchoolsIAdminister() {

    this.auth.processing = true;
    this.schoolService.getAllPrivateSchoolsIAdminister().subscribe(
      response => {
        this.mySchools = response || [];
        this.auth.processing = false;
        this.auth.processing = false;

      },
      error => {
        this.error = <any>error;
        this.auth.processing = false;
      });


  }

  setupImageUploadLogic(): void {

    const imageUpload = document.getElementById('logoUpload');
    imageUpload.addEventListener('change', (e) => {
      const file = e.target['files'][0];
      this.auth.processing = true;
      this.storageService.uploadFileToCloudStorage('/school_images/', file).then(
        storageInfo => {
          this.auth.processing = false;
          this.schoolImage = storageInfo.downloadURL;

        }, error => this.error = <any>error);

    });


  }


}
