import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {Status} from "../../../data/model/status.model";
import {DataService} from "../../../data/data.service";
import {Student} from "../../../data/model/student.model";

@Component({
  selector: 'app-student-delete',
  templateUrl: './student-delete.component.html',
  styleUrls: ['./student-delete.component.scss']
})
export class StudentDeleteComponent implements OnInit {

  requesting = false;
  error = false;

  constructor(private dialogRef: MatDialogRef<StudentDeleteComponent>,
              private data: DataService,
              @Inject(MAT_DIALOG_DATA) public student: Student) {}

  ngOnInit(): void {
  }

  onDeleteClick() {
    this.dialogRef.disableClose = true;
    this.error = false;

    this.requesting = true;

    this.data.studentDelete(this.student.id).subscribe((id: number) => {
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
