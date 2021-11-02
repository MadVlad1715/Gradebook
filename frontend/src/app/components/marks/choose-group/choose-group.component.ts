import { Component, OnInit } from '@angular/core';
import {DataService} from "../../../data/data.service";
import {Group} from "../../../data/model/group.model";
import {ActivatedRoute, Router} from "@angular/router";
import {AuthService} from "../../../auth/auth.service";

@Component({
  selector: 'app-choose-group',
  templateUrl: './choose-group.component.html',
  styleUrls: ['./choose-group.component.scss']
})
export class ChooseGroupComponent implements OnInit {

  groups!: Group[];

  constructor(public auth: AuthService, private data: DataService, private route: ActivatedRoute, private router: Router) {
    if (this.auth.isAdmin || this.auth.isTeacher) {
      this.data.groups.subscribe (
        (groups: Group[]) => {
          this.groups = groups;
        }
      )
    } else {
      this.router.navigate([this.auth.stGroupName], {relativeTo: this.route});
    }
  }

  ngOnInit(): void {
  }

  onClick(group: Group) {
    this.router.navigate([group.name], {relativeTo: this.route});
  }
}
