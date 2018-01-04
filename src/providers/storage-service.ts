import {Injectable} from '@angular/core';
import * as firebase from 'firebase';

@Injectable()
export class StorageService {


  constructor() {


  }

  uploadFileToCloudStorage(location, file, listener = null): Promise<any> {

    /**RECEIVES A FILE FROM FILE INPUT AND SAVES TO FIREBASE STORAGE. RETURNS PROMISE CONTAINING FILE IMAGE URL**/
    // http://www.muhammetbakan.com/angular2-ionic2-how-to-upload-and-get-image-from-firebase-storage/
    console.log(file);
    const storage = firebase.storage();
    const promise = new Promise((res, rej) => {

      const uploadTask = storage.ref().child(location + file.name).put(file);

      // Listen for state changes, errors, and completion of the upload.
      uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED, // or 'state_changed'
        function (snapshot) {
          // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
          const progress = (snapshot['bytesTransferred'] / snapshot['totalBytes']) * 100;
          console.log('Upload is ' + progress + '% done');
          if (!!listener) {
            listener(progress);
          }
          switch (snapshot['state']) {
            case firebase.storage.TaskState.PAUSED: // or 'paused'
              console.log('Upload is paused');
              break;
            case firebase.storage.TaskState.RUNNING: // or 'running'
              console.log('Upload is running');
              break;
          }
        }, function (error) {
          switch (error['code']) {
            case 'storage/unauthorized':
              console.log('User doesn\'t have permission to access the object');
              rej('User doesn\'t have permission to access the object');
              break;
            case 'storage/canceled':
              console.log('User canceled the upload');
              rej('User canceled the upload');
              break;
            case
            'storage/unknown':
              console.log('Unknown error occurred, inspect error.serverResponse');
              rej('Unknown error occurred, inspect error.serverResponse');
          }
        }, () => {
          res(uploadTask.snapshot);
          return undefined;
        });

    });
    return promise;


  }
}
