import {IGroupMembershipQuestionResponse} from './iresponse';
import {GroupMembershipQuestion} from './question';

export class GroupMembershipQuestionResponse implements IGroupMembershipQuestionResponse {

  question: GroupMembershipQuestion;
  response: string;
  date_responded: string;

  constructor(question: GroupMembershipQuestion,
              response: string,
              date_responded: string) {

    this.question = question;
    this.response = response;
    this.date_responded = date_responded;

  }

}
