import {IInvitation} from "./iinvitation";

export class Invitation implements IInvitation {

  school_id: number;
  group_id: number;
  role: string;
  email: string;
  motivation: string;

  constructor(school_id: number,
              group_id: number,
              role: string,
              email: string,
              motivation: string) {

    this.school_id = school_id;
    this.group_id = group_id;
    this.role = role;
    this.email = email;
    this.motivation = motivation;

  }

}
