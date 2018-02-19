import {GroupService} from '../../group/group.service';

export abstract class ListComponent {

  groupAdmin = false;

  constructor(public groupService: GroupService) {
  }

  public isGroupAdmin(schoolId: number, groupId: number) {

    return new Promise((resolve, reject) => {

      this.groupService.isGroupAdmin(schoolId, groupId).subscribe(res => {

        console.log(res);

        this.groupAdmin = res.admin;
        resolve(this.groupAdmin);

      }, err => {

        reject(err);

      });

    });


  }

}
