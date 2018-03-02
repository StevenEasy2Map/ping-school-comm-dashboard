import {PingBaseComponent} from '../../ping.base.component';
import {DocumentSigningService} from '../../document_signing/services/document.signing.service';
import {PaymentsService} from '../../payments/services/payments.service';

export abstract class DetailsBaseComponent extends PingBaseComponent {

  expiryMonths = Array.from([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], i => this.padNumber(i));
  expiryYears = this.constructYearArray();
  cardNumber = '';
  cardExpiryMonth = '01';
  cardExpiryYear = (new Date()).getFullYear();
  cvcNumber = '';
  processPayment = false;


  constructor(public documentSigningService: DocumentSigningService, public paymentsService: PaymentsService) {
    super();
  }

  constructYearArray() {

    const cardExpiryYear = [];
    const year = (new Date()).getFullYear();

    for (let i = year; i < year + 21; i++) {
      cardExpiryYear.push(i);
    }
    return cardExpiryYear;
  }

  digitallySignDocument(school_id, document_id) {
    return this.documentSigningService.createUserDocument({
      school_id: school_id,
      document_id: document_id
    });
  }

  manuallySignDocument(url) {
    window.open(url, '_newtab');
  }

  makePayment(reference, entityType, entityId, amount) {

    return new Promise((resolve, reject) => {

      (<any>window).Stripe.card.createToken({
          number: this.cardNumber,
          exp_month: this.cardExpiryMonth,
          exp_year: this.cardExpiryYear,
          cvc: this.cvcNumber
        }, (status: number, resp: any) => {
          if (status === 200) {

            console.log(resp);

            console.log(`Success! Card token ${resp.id}.`);

            const payload = {
              payment_reference: reference,
              entity_id: entityId,
              entity_type: entityType,
              amount: amount,
              stripe_token: resp.id,
              payment_type: 'Credit Card'
            };

            this.paymentsService.makePayment(payload).subscribe(
              response => {
                console.log(response);
                resolve(response);
              },
              error => {
                console.log(error);
                reject(error);
              });

          } else {
            reject(resp.error.message);
          }
        }, err => {
          reject(err);
        }
      );
    });

  }


}
