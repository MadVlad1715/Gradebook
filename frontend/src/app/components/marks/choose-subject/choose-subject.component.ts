import { Component, OnInit } from '@angular/core';
import {DataService} from "../../../data/data.service";
import {ActivatedRoute, Router} from "@angular/router";
import {Subject} from "../../../data/model/subject.model";
import {MatDialog} from "@angular/material/dialog";
import {CreateSubjectComponent} from "./create-subject/create-subject.component";
import {DeleteSubjectComponent} from "./delete-subject/delete-subject.component";
import {EditSubjectComponent} from "./edit-subject/edit-subject.component";
import {AuthService} from "../../../auth/auth.service";

@Component({
  selector: 'app-choose-subject',
  templateUrl: './choose-subject.component.html',
  styleUrls: ['./choose-subject.component.scss']
})
export class ChooseSubjectComponent implements OnInit {

  group!: any;
  subjects!: Array<Subject>;

  constructor(public auth: AuthService, private data: DataService, private dialog: MatDialog, private route: ActivatedRoute, private router: Router) {
  }

  ngOnInit(): void {
    let groupName = this.route.snapshot.params['group'].toUpperCase();
    if (!this.auth.isTeacher && !this.auth.isAdmin && groupName !== this.auth.stGroupName) {
      groupName = this.auth.stGroupName;
      this.router.navigate([`/marks/${this.auth.stGroupName}`]);
    }

    this.data.subjects(groupName).subscribe(
      data => {
        this.group = data.group;
        this.subjects = data.subjects;
        this.sortSubjects();
      },
      err => this.router.navigate(['/marks'])
    )
  }

  sortSubjects() {
    this.subjects.sort((s1: Subject, s2: Subject) => s1.name.toLowerCase().localeCompare(s2.name.toLowerCase()));
  }

  onClick(subject: Subject) {
    this.router.navigate([subject.name], {relativeTo: this.route});
  }

  createSubject() {
    const dialogRef = this.dialog.open(CreateSubjectComponent, {
      width: '360px',
      data: {
        'subjects': this.subjects,
        'currentGroupId': this.group.id
      }
    });
    const subscription = dialogRef.componentInstance.onCreated.subscribe((subject: Subject) => {
      this.subjects.push(subject);
      this.sortSubjects();
    });
    dialogRef.afterClosed().subscribe(() => subscription.unsubscribe());
  }

  edit(subject: Subject, e: any) {
    e.stopPropagation();

    const dialogRef = this.dialog.open(EditSubjectComponent, {
      width: '360px',
      data: {
        'subject': subject,
        'subjects': this.subjects,
      }
    });

    dialogRef.afterClosed().subscribe((subject: Subject | undefined) => {
      if (!subject) return;

      const index = this.subjects.findIndex((s: Subject) => s.id === subject.id)
      if (index !== -1) this.subjects.splice(index, 1);

      this.subjects.push(subject)
      this.sortSubjects();
    });
  }

  delete(subject: Subject, e: any) {
    e.stopPropagation();

    const dialogRef = this.dialog.open(DeleteSubjectComponent, {
      data: subject
    });

    dialogRef.afterClosed().subscribe((res: number | undefined) => {
      if (res !== undefined) {
        const index = this.subjects.findIndex((s: Subject) => s.id === res)
        if (index !== -1) this.subjects.splice(index, 1);
      }
    });
  }
}
