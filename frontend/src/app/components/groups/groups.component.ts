import {AfterViewInit, Component, Input, OnInit, ViewChild} from '@angular/core';
import {Group} from "../../data/model/group.model";
import {DataService} from "../../data/data.service";
import {MatTableDataSource} from "@angular/material/table";
import {MatSort} from "@angular/material/sort";
import {MatDialog} from "@angular/material/dialog";
import {GroupDeleteComponent} from "./group-delete/group-delete.component";
import {MatPaginator} from "@angular/material/paginator";
import {GroupCreateComponent} from "./group-create/group-create.component";
import {ActivatedRoute, Router} from "@angular/router";
import {GroupEditComponent} from "./group-edit/group-edit.component";

@Component({
  selector: 'app-groups',
  templateUrl: './groups.component.html',
  styleUrls: ['./groups.component.scss']
})
export class GroupsComponent implements OnInit, AfterViewInit {

  loading = true;
  displayedColumns: string[] =
    ['name', 'classroomTeacher', 'studentsCount', 'subjectsCount', 'creationTime', 'actions'];
  pageSizeOptions = [5, 10, 20];
  groups: MatTableDataSource<Group> = new MatTableDataSource<Group>();
  filterValue: string = '';

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private data: DataService, private dialog: MatDialog, private route: ActivatedRoute, private router: Router) {
  }

  ngOnInit(): void {
    this.data.groups.subscribe (
      (groups: Group[]) => {
        this.groups.data = groups;
        this.loading = false;
      }
    );
    if (window.innerHeight >= 800) this.pageSizeOptions = [10, 5, 20];
  }

  ngAfterViewInit(): void {
    this.groups.paginator = this.paginator;
    this.groups.sort = this.sort;
  }

  applyFilter() {
    this.groups.filter = this.filterValue;

    if (this.groups.paginator) {
      this.groups.paginator.firstPage();
    }
  }

  createGroup(): void {
    const dialogRef = this.dialog.open(GroupCreateComponent, {
      width: '360px',
    });
    const subscription = dialogRef.componentInstance.onCreated.subscribe((group: Group) => {
      this.groups.data.unshift(group);
      this.groups.data = this.groups.data;
    });
    dialogRef.afterClosed().subscribe(() => subscription.unsubscribe());
  }

  editGroup(group: Group): void {
    const dialogRef = this.dialog.open(GroupEditComponent, {
      width: '360px',
      data: group
    });
    dialogRef.afterClosed().subscribe((group: Group | undefined) => {
      if (!group) return;

      const index = this.groups.data.findIndex((g: Group) => g.id === group.id)
      if (index !== -1) this.groups.data.splice(index, 1, group);
      this.groups.data = this.groups.data;
    });
  }

  deleteGroup(group: Group): void {
    const dialogRef = this.dialog.open(GroupDeleteComponent, {
      maxWidth: '600px',
      data: group
    });
    dialogRef.afterClosed().subscribe((res: number | undefined) => {
      if (res !== undefined) {
        const index = this.groups.data.map<number>(g => g.id).indexOf(res);
        if (index !== -1) {
          this.groups.data.splice(index, 1);
          this.groups.data = this.groups.data;
          if (!this.groups.data.length) {
            this.filterValue = '';
            this.applyFilter();
          }
        }
      }
    });
  }
}
