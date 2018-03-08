import {Component, Inject} from '@angular/core';
import {MatDialog, MAT_DIALOG_DATA, MatSnackBar} from '@angular/material';


@Component({
  selector: 'app-share-url-dialog',
  templateUrl: 'dialog-share-url.html',
})
export class DialogShareUrlComponent {

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, public snackBar: MatSnackBar) {
  }

  selectAllContent($event) {
    $event.target.select();
  }

  copyToClipboard() {

    const url = <HTMLInputElement>document.getElementById('share-url');
    /* Select the text field */
    url.select();

    /* Copy the text inside the text field */
    document.execCommand('Copy');
    this.snackBar.open('Item successfully copied to your clipboard', '', {duration: 2000});
  }
}
