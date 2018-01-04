import {Component} from '@angular/core';


@Component({
    selector: 'footer-component',
    templateUrl: './footer.component.html',
    styleUrls: ['./footer.style.scss']
})
export class FooterComponent {

    public year: number = (new Date()).getFullYear();

}
