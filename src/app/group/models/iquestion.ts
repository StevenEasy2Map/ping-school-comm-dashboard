export interface IGroupMembershipQuestion {
  id: number;
  school_id: string;
  group_id: string;
  required: boolean;
  question_title: string;
  multiple_responses_permitted: number;
  display_order: number;
}
