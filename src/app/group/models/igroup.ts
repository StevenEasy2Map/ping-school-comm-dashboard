export interface IGroup {
  id: number;
  school_id: string;
  name: string;
  description: string;
  image: string;
  is_private: number;
  verified: number
  invite_token: string;
  active: number;
  created_on: string;
  created_by_user_id: number;
  question_count: number;
  member_count: number;
  event_count: number;
  notice_count: number;
  whatsapp_group_link: string;
  new_members_must_be_vetted: number;
}
