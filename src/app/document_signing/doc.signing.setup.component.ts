import {Component} from '@angular/core';
import {DocumentSigningService} from "./services/document.signing.service";
import {Observable} from "rxjs/Observable";
import {PingBaseComponent} from "../ping.base.component";

export abstract class DocSigningSetupComponent extends PingBaseComponent{

  signingCategories: any[] = [];
  documentTemplates: any[] = [];
  documentTemplateFields: any[] = [];
  documentCategory = {};
  documentTemplate = {};
  error = '';

  docSigningDetails = {};
  docSigningFields = [];
  docSigningProcessStarted = false;
  docSigningProcessStep1Completed = false;
  docSigningProcessStep2Completed = false;
  docSigningProcessStep3Completed = false;

  ckEditorConfig = {
    'uiColor': '#EBEBEB',
    'toolbarGroups': [
      {'name': 'styles'},
      {'name': 'basicstyles', 'groups': ['basicstyles', 'cleanup']},
      {'name': 'links'},
      {'name': 'editing', 'groups': ['find', 'selection', 'spellchecker', 'editing']},
      {'name': 'paragraph', 'groups': ['list', 'indent', 'blocks', 'align']}
    ],
    'removeButtons': 'Source,Save,Templates,Find,Replace,Scayt,SelectAll'
  };

  constructor(public documentSigningService: DocumentSigningService) {
    super();
  }

  getSigningCategories(): void {

    this.documentSigningService.getCategories().subscribe(
      response => {

        this.signingCategories = response.categories;
        console.log(response);

      }, error => {
        this.error = <any>error;
      });

  }

  getDocumentTemplates(entity: object, categoryId: number, initiate: boolean = false): void {

    this.documentSigningService.getCategoryTemplates(categoryId).subscribe(
      response => {

        this.documentTemplates = response.templates;
        console.log(this.documentTemplates);

        if (initiate && entity && entity['signature_template_id'] && this.docSigningDetails) {

          this.documentTemplates.forEach(template => {

            if (template.id === parseInt(entity['signature_template_id'], 10)) {

              this.documentTemplate = template;

              this.documentTemplate['title'] = this.docSigningDetails['title'];
              this.documentTemplate['call_to_action'] = this.docSigningDetails['call_to_action'];
              this.documentTemplate['user_description'] = this.docSigningDetails['description'];

              this.getDocumentTemplateFields(entity, this.documentTemplate['id'], true);

            }

          })

        }

      }, error => {
        this.error = <any>error;
      });

  }

  getDocumentTemplateFields(entity: object, templateId: number, initiate: boolean = false): void {

    this.documentSigningService.getTemplateFields(templateId).subscribe(
      response => {

        this.documentTemplateFields = response.fields;

        if (initiate && entity && entity['signature_template_id']
          && parseInt(entity['signature_template_id']) === templateId
          && this.docSigningDetails) {

          this.documentTemplateFields.forEach(templateField => {
            this.docSigningFields.forEach(field => {
              if (parseInt(templateField['id']) === parseInt(field['field_id'], 10)) {
                templateField['default_value'] = field['value'];
              }
            });
          });

          this.docSigningProcessStarted = true;
          this.docSigningProcessStep1Completed = true;
          this.docSigningProcessStep2Completed = true;
          this.docSigningProcessStep3Completed = true;

        }

        console.log(this.documentTemplateFields);

      }, error => {
        this.error = <any>error;
      });

  }

  createDocument(document: object): Observable<any> {

    return this.documentSigningService.createDocument(document);

  }

  updateDocument(document: object): Observable<any> {

    return this.documentSigningService.updateDocument(document);

  }

  removeDocument(document: object): Observable<any> {
    return this.documentSigningService.removeDocument(document);
  }

  retrieveDocumentTemplateDetails(schoolId: number, entityType: string): object {

    const fields = [];
    for (let i = 0; i < this.documentTemplateFields.length; i++) {

      const field = this.documentTemplateFields[i];
      if (field.autofill === 1 && field.default_value.trim() === '') {
        return;
      } else if (field.autofill === 1) {

        fields.push({
          field_id: field.id,
          field_value: field.default_value
        });

      }

    }

    return {

      school_id: schoolId,
      template_id: this.documentTemplate['id'],
      fields: fields,
      entity_type: entityType,
      cc_email_address: '',
      call_to_action: this.documentTemplate['call_to_action'] || 'Sign Document',
      title: this.documentTemplate['title'] || 'Indemnity Form',
      description: this.documentTemplate['user_description']
    };

  }

  includeDocForSigning(): void {
    this.docSigningProcessStarted = true;
  }

  onDocumentCategorySelect(entity: object, event: Event): void {

    console.log(this.documentCategory);
    if (!this.documentCategory) {
      return;
    }
    this.documentTemplate = {};
    this.documentTemplateFields = [];
    this.getDocumentTemplates(entity, parseInt(this.documentCategory['id'], 10));
    this.docSigningProcessStep1Completed = true;

  }

  selectDocumentTemplate(entity: object, template: object) {

    this.documentTemplate = template;
    this.documentTemplateFields = [];
    this.getDocumentTemplateFields(entity, this.documentTemplate['id']);
    this.docSigningProcessStep2Completed = true;

  }

  cancelSelectTemplate(): void {

    this.documentTemplate = {};
    this.documentTemplateFields = [];
    this.docSigningProcessStep1Completed = false;
    this.docSigningProcessStep2Completed = false;

  }

  cancelAddDocument(): void {

    this.documentTemplates = [];
    this.documentTemplateFields = [];
    this.documentCategory = {};
    this.documentTemplate = {};

    this.docSigningProcessStarted = false;
    this.docSigningProcessStep1Completed = false;
    this.docSigningProcessStep2Completed = false;
    this.docSigningProcessStep3Completed = false;

  }

  cancelSpecifyDocDetails(): void {

    this.docSigningProcessStep2Completed = false;
    this.docSigningProcessStep3Completed = false;

  }

  onDocumentSelectCompleted(): void {

    this.docSigningProcessStep3Completed = true;

  }

  getEntityDocumentForSigning(entity: object, schoolId: number, entityId: number, entityType: string): void {

    this.documentSigningService.getDocumentDetails(entity['signature_document_id'],
      schoolId + '',
      entity['signature_template_id'], entityId + '', entityType).subscribe(
      response => {
        this.docSigningDetails = response.document;
        this.getEntityDocumentFieldsForSigning(entity, schoolId, entityId, entityType);

      },
      error => this.error = <any>error);
  }

  getEntityDocumentFieldsForSigning(entity: object, schoolId: number, entityId: number, entityType: string): void {

    this.documentSigningService.getDocumentFields(entity['signature_document_id'],
      schoolId + '',
      entity['signature_template_id'], entityId + '', entityType).subscribe(
      response => {
        this.docSigningFields = response.document_fields;

        this.getDocumentTemplates(entity, this.docSigningDetails['category_id'], true);

      },
      error => this.error = <any>error);
  }

}
