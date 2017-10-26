import {IGroupMembershipQuestion} from './iquestion';

export class GroupMembershipQuestion implements IGroupMembershipQuestion {

  id: number;
  school_id: string;
  group_id: string;
  required: boolean;
  question_title: string;
  multiple_responses_permitted: number;
  display_order: number;

  constructor(id: number,
              school_id: string,
              group_id: string,
              required: boolean,
              question_title: string,
              multiple_responses_permitted: number,
              display_order: number) {

    this.id = id;
    this.school_id = school_id;
    this.group_id = group_id;
    this.required = required;
    this.question_title = question_title;
    this.multiple_responses_permitted = multiple_responses_permitted;
    this.display_order = display_order;

  }

}
