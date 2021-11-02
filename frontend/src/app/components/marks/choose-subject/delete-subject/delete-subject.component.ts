import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {DataService} from "../../../../data/data.service";
import {Status} from "../../../../data/model/status.model";
import {Subject} from "../../../../data/model/subject.model";

@Component({
  selector: 'app-delete-subject',
  templateUrl: './delete-subject.component.html',
  styleUrls: ['./delete-subject.component.scss']
})
export class DeleteSubjectComponent implements OnInit {

  requesting = false;
  error = false;

  constructor(private dialogRef: MatDialogRef<DeleteSubjectComponent>,
              private data: DataService,
              @Inject(MAT_DIALOG_DATA) public subject: Subject) {
  }

  ngOnInit(): void {
  }

  onDeleteClick() {
    this.dialogRef.disableClose = true;
    this.error = false;

    this.requesting = true;

    this.data.subjectDelete(this.subject.id).subscribe((res: Status) => {
        this.requesting = false;
        this.error = false;
        this.dialogRef.disableClose = false;
        this.dialogRef.close(res.subjectId);
      },
      (error: Status) => {
        this.requesting = false;
        this.error = true;
        this.dialogRef.disableClose = false;
      });
  }
}
