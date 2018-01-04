import {Component} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {DocumentSigningService} from "./services/document.signing.service";
import {AuthService} from "../../providers/auth-service";

@Component({
  selector: 'entity-doc-signed-list-component',
  templateUrl: 'entity.doc.signed.list.template.html',
  providers: [DocumentSigningService],
  styleUrls: ['doc.signed.style.scss']
})
export class EntityDocSignedListComponent {

  documents: any[] = [];
  documentDetails = {};
  entityId: string = '';
  schoolId: string = '';
  groupId = '';
  documentId: string = '';
  templateId: string = '';
  entityType = '';
  entityTitle = '';

  constructor(private auth: AuthService,
              public documentSignService: DocumentSigningService,
              public router: Router,
              public route: ActivatedRoute) {


  }

  ngAfterViewInit(): void {

    this.auth.getFirebaseTokenAsPromise().then(() => {
      this.route.params.subscribe(params => {
        this.groupId = params['group_id'];
        this.schoolId = params['school_id'];
        this.entityId = params['entity_id'];
        this.documentId = params['document_id'];
        this.templateId = params['template_id'];
        this.entityType = params['entity_type'];
        this.entityTitle = params['entity_title'];
        this.getEntityDocuments();
        this.getDocumentDetails();
      });

    });
  }

  getDocumentDetails(): void {

    this.documentSignService.getDocumentDetails(this.documentId, this.schoolId, this.templateId, this.entityId, this.entityType).subscribe(res => {
      this.documentDetails = res.document;

    });


  }

  backToList(): void {
    this.router.navigate(['/group-notices-list', {group_id: this.groupId, school_id: this.schoolId}]);
  }

  getEntityDocuments(): void {

    this.documentSignService.getEntityUserDocuments(this.entityId, this.entityType).subscribe(res => {
      this.documents = res.documents;

    });

  }

}
