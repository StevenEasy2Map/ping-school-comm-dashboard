import {ISchool} from "./ischool";

export class School implements ISchool {

  id: string;
  name: string;
  logo: string;
  description: string;
  is_private: number;

  constructor(id: string, name: string, logo: string, description: string, is_private: number) {

    this.id = id;
    this.name = name;
    this.logo = logo;
    this.description = description;
    this.is_private = is_private;
  }

}
