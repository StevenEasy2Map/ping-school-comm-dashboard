import {IGroup} from "./igroup";

export class Group implements IGroup {

  id: number;
  school_id: string;
  name: string;
  description: string;
  image: string;
  is_private: number;
  verified: number;
  invite_token: string;
  active: number;
  created_on: string;
  created_by_user_id: number;
  question_count: number;
  member_count: number;
  event_count: number;
  notice_count: number;
  whatsapp_group_link: string;

  constructor(id: number,
              school_id: string,
              name: string,
              description: string,
              image: string,
              is_private: number,
              verified: number,
              invite_token: string,
              active: number,
              created_on: string,
              created_by_user_id: number,
              question_count: number,
              member_count: number,
              event_count: number,
              notice_count: number,
              whatsapp_group_link: string) {

    this.id = id;
    this.school_id = school_id;
    this.name = name;
    this.description = description;
    this.image = image;
    this.is_private = is_private;
    this.verified = verified;
    this.invite_token = invite_token;
    this.active = active;
    this.created_on = created_on;
    this.created_by_user_id = created_by_user_id;
    this.question_count = question_count;
    this.member_count = member_count;
    this.event_count = event_count;
    this.notice_count = notice_count;
    this.whatsapp_group_link = whatsapp_group_link;
  }

}
