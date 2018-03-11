import {Component, Inject} from '@angular/core';
import {MatDialog, MAT_DIALOG_DATA} from '@angular/material';


@Component({
  selector: 'app-error-dialog',
  templateUrl: 'dialog-error.html',
})
export class DialogErrorComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
  }
}
