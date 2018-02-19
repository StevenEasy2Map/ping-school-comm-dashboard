

import {GroupService} from '../../group/group.service';

export abstract class ListComponent {

  groupAdmin = false;

  constructor(public groupService: GroupService) {
  }

  public isGroupAdmin(schoolId: number, groupId: number) {

    return new Promise((resolve, reject) => {

      this.groupService.isGroupAdmin(schoolId, groupId).subscribe(res => {

        this.groupAdmin = !!res;
        resolve(this.groupAdmin);

      }, err => {

        reject(err);

      });

    });


  }

}
