import {Component, Inject} from '@angular/core';
import {MatDialog, MAT_DIALOG_DATA} from '@angular/material';


@Component({
  selector: 'app-dialog-are-you-sure-dialog',
  templateUrl: 'dialog-are-you-sure.html',
})
export class DialogAreYouSureComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
  }
}
