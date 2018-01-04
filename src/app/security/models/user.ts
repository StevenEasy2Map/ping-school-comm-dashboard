import {IUser} from "./iuser"

export class User implements IUser {

  constructor(public email: string, public firstname: string, public lastname: string,
              public mobile: string, public device_token: string) {
  }

}
