import { Component, OnInit } from '@angular/core';
import {DataService} from "../../data/data.service";
import {User, IUser} from "../../data/model/user.model";
import {Router} from "@angular/router";
import {MatDialog} from "@angular/material/dialog";
import {TeacherCreateComponent} from "../teachers/teacher-create/teacher-create.component";
import {Teacher} from "../../data/model/teacher.model";
import {EditProfileComponent} from "./edit-profile/edit-profile.component";
import {AuthService} from "../../auth/auth.service";

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {

  public loading = true;
  public user!: User;

  constructor(private data: DataService, private dialog: MatDialog) { }

  ngOnInit(): void {
    this.data.userInfo.subscribe((user: User) => {
      this.user = user;
      this.loading = false;
    });
  }

  edit(): void {
    const dialogRef = this.dialog.open(EditProfileComponent, {
      width: '400px',
      data: this.user
    });

    dialogRef.afterClosed().subscribe((user: User | undefined) => {
      if (!user) return;
      this.user = user;
    });
  }
}
