import {AuthService} from "../../../providers/auth-service";
import {Injectable} from '@angular/core';
import {Http} from '@angular/http';
import {APIService} from "../../../providers/api-service";
import {Observable} from "rxjs";

@Injectable()
export class DocumentSigningService extends APIService {

  constructor(public auth: AuthService, public http: Http) {
    super(auth, http);
  }

  getCategories(): Observable<any> {
    return this.get('/api/sign/categories');
  }

  getCategoryTemplates(categoryId: number): Observable<any> {
    return this.get(`/api/sign/category_templates/${categoryId}`);
  }

  getTemplateFields(templateId: number): Observable<any> {
    return this.get(`/api/sign/template_fields/${templateId}`);
  }

  getEntityUserDocuments(entityId: string, entityType: string): Observable<any> {

    if (entityType === 'notice') {
      return this.get(`/api/sign/notice_user_documents/${entityId}`);
    } else {
      return this.get(`/api/sign/event_user_documents/${entityId}`);
    }

  }

  getDocumentDetails(documentId: string, schoolId: string, templateId: string, entityId: string, entityType: string): Observable<any> {
    return this.get(`/api/sign/document_details/${documentId}/${schoolId}/${templateId}/${entityId}/${entityType}`);
  }

  getDocumentFields(documentId: string, schoolId: string, templateId: string, entityId: string, entityType: string): Observable<any> {
    return this.get(`/api/sign/document_fields/${documentId}/${schoolId}/${templateId}/${entityId}/${entityType}`);
  }

  createDocument(document: any): Observable<any> {
    return this.post(document, '/api/sign/create_document');
  }

  updateDocument(document: any): Observable<any> {
    return this.post(document, '/api/sign/update_document');
  }

  removeDocument(document: any): Observable<any> {
    return this.post(document, '/api/sign/remove_document');
  }

}
