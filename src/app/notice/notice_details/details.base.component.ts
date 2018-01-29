import {PingBaseComponent} from '../../ping.base.component';
import {DocumentSigningService} from '../../document_signing/services/document.signing.service';

export abstract class DetailsBaseComponent extends PingBaseComponent {


  constructor(public documentSigningService: DocumentSigningService) {
    super();
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


}
