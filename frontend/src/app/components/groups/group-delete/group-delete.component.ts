import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {Group} from "../../../data/model/group.model";
import {Status} from "../../../data/model/status.model";
import {DataService} from "../../../data/data.service";

@Component({
  selector: 'app-group-delete',
  templateUrl: './group-delete.component.html',
  styleUrls: ['./group-delete.component.scss']
})
export class GroupDeleteComponent implements OnInit {

  requesting = false;
  error = false;

  constructor(private dialogRef: MatDialogRef<GroupDeleteComponent>,
              private data: DataService,
              @Inject(MAT_DIALOG_DATA) public group: Group) {
  }

  ngOnInit(): void {
  }

  onDeleteClick() {
    this.dialogRef.disableClose = true;
    this.error = false;

    this.requesting = true;

    this.data.groupDelete(this.group.id).subscribe((res: Status) => {
        this.requesting = false;
        this.error = false;
        this.dialogRef.disableClose = false;
        this.dialogRef.close(res.id);
      },
      (error: Status) => {
        this.requesting = false;
        this.error = true;
        this.dialogRef.disableClose = false;
      });
  }
}
