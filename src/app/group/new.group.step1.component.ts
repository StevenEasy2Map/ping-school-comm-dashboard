import {AfterViewInit, Component} from '@angular/core';
import {UserService} from '../security/user.service';
import {Router} from '@angular/router';
import {StorageService} from '../../providers/storage-service';
import {GroupService} from './group.service';
import {School} from './models/school';
import * as $ from 'jquery';
import {AuthService} from "../../providers/auth-service";

@Component({
  selector: 'new-group-step1-component',
  templateUrl: 'new.group.step1.component.html',
  styleUrls: ['./group.style.scss'],
  providers: [GroupService],
})
export class NewGroupStep1Component implements AfterViewInit {

  error = '';
  schoolName = '';
  schoolImage = '';
  schoolDetails: any = {};
  schoolsList: any = [];
  autoCompleteSchoolsList: any = [];
  autoCompleteSchoolFind: any = [];
  selectedSchool: any = null;

  constructor(private auth: AuthService,
              private userService: UserService,
              private router: Router, private storageService: StorageService,
              private groupService: GroupService) {
  }

  ngAfterViewInit(): void {
    this.setupImageUploadLogic();
    this.getAllSchools();

  }

  createSchool(): void {

    const school = new School('', this.schoolName, this.schoolImage, '', 0);

    this.auth.processing = true;

    this.auth.getFirebaseTokenAsPromise().then(() => {

      this.groupService.createSchool(school).subscribe(
        res => {
          this.schoolDetails = res.school;
          this.auth.processing = false;
          localStorage.setItem('newGroupSchoolId', this.schoolDetails.id);
          this.router.navigate(['/new-group-step-2', {school_id: this.schoolDetails.id}]);
        },
        error => this.error = <any>error);

    });

  }

  selectSchool(): void {

    localStorage.setItem('newGroupSchoolId', this.selectedSchool.id);
    this.router.navigate(['/new-group-step-2', {school_id: this.selectedSchool.id}]);

  }

  cancelSelectSchool(): void {

    this.selectedSchool = null;
    this.schoolName = '';
    this.schoolImage = '';
    this.instantiateAutoComplete();

  }

  instantiateAutoComplete(): void {

    const _instance = this;

    // $('input.autocomplete').autocomplete({
    //   data: this.autoCompleteSchoolsList,
    //   limit: 50, // The max amount of results that can be shown at once. Default: Infinity.
    //   onAutocomplete: function (val) {
    //     _instance.selectedSchool = _instance.autoCompleteSchoolFind[val];
    //     _instance.schoolImage = _instance.selectedSchool.logo;
    //   },
    //   minLength: 1, // The minimum length of the input for the autocomplete to start. Default: 1.
    // });

  }

  getAllSchools(): void {

    this.auth.processing = true;
    this.groupService.getAllSchools().subscribe(
      schools => {
        this.schoolsList = schools;
        this.schoolsList.forEach(school => {
          this.autoCompleteSchoolsList[school.name] = school.logo;
          this.autoCompleteSchoolFind[school.name] = school;
        });
        this.instantiateAutoComplete();
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
