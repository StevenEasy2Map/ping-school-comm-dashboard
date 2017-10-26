import {AuthService} from '../../providers/auth-service';
import {Injectable} from '@angular/core';
import {Http} from '@angular/http';
import {School} from './models/school';
import {APIService} from '../../providers/api-service';
import {Observable} from 'rxjs';
import {Group} from './models/group';
import {GroupMembershipQuestion} from './models/question';
import {Invitation} from './models/invitation';

@Injectable()
export class GroupService extends APIService {

  constructor(public auth: AuthService, public http: Http) {
    super(auth, http);
  }

  createSchool(school: School): Observable<any> {
    return this.post(school, '/api/school/create_school');
  }

  getAllSchools(): Observable<any> {
    return this.get('/api/school/all_schools');
  }

  createGroup(group: Group): Observable<any> {
    return this.post(group, '/api/group/create_group');
  }

  editGroup(group: Group): Observable<any> {
    return this.post(group, '/api/group/edit_group');
  }

  getGroupAdminDetails(groupId: string, schoolId: string): Observable<any> {
    return this.get(`/api/group/get_admin_group_details/${schoolId}/${groupId}`);
  }

  getGroupSummary(groupId: number): Observable<any> {
    return this.get(`/api/group/get_group_summary/${groupId}`);
  }

  getGroupMemberAdminDetails(schoolId: any, groupId: number, userId: any): Observable<any> {
    return this.get(`/api/group/get_admin_group_member_details/${schoolId}/${groupId}/${userId}`);
  }

  adminValidateGroupMember(payload: any): Observable<any> {
    return this.post(payload, '/api/group/admin_validate_member');
  }

  adminRemoveGroupMember(payload: any): Observable<any> {
    return this.post(payload, '/api/group/admin_remove_member');
  }

  getMyGroups(): Observable<any> {
    return this.get('/api/group/my_groups');
  }

  addQuestion(question: GroupMembershipQuestion): Observable<any> {
    return this.post(question, '/api/group_membership_questions/add_question');
  }

  editQuestion(question: GroupMembershipQuestion): Observable<any> {
    return this.post(question, '/api/group_membership_questions/edit_question');
  }

  deleteQuestion(question: GroupMembershipQuestion): Observable<any> {
    return this.post(question, '/api/group_membership_questions/delete_question');
  }

  inviteGroupMember(invitation: Invitation): Observable<any> {
    return this.post(invitation, '/api/group/invite_member');
  }

}
