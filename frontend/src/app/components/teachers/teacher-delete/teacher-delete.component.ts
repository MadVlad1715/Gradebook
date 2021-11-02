import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {Status} from "../../../data/model/status.model";
import {DataService} from "../../../data/data.service";
import {Teacher} from "../../../data/model/teacher.model";

@Component({
  selector: 'app-teacher-delete',
  templateUrl: './teacher-delete.component.html',
  styleUrls: ['./teacher-delete.component.scss']
})
export class TeacherDeleteComponent implements OnInit {

  requesting = false;
  error = false;

  constructor(private dialogRef: MatDialogRef<TeacherDeleteComponent>,
              private data: DataService,
              @Inject(MAT_DIALOG_DATA) public teacher: Teacher) {}

  ngOnInit(): void {
  }

  onDeleteClick() {
    this.dialogRef.disableClose = true;
    this.error = false;

    this.requesting = true;

    this.data.teacherDelete(this.teacher.id).subscribe((id: number) => {
        this.requesting = false;
        this.error = false;
        this.dialogRef.disableClose = false;
        this.dialogRef.close(id);
      },
      (error: Status) => {
        this.requesting = false;
        this.error = true;
        this.dialogRef.disableClose = false;
      });
  }
}
