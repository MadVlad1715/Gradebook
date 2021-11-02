import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {DataService} from "../../data/data.service";
import {MatTableDataSource} from "@angular/material/table";
import {MatSort} from "@angular/material/sort";
import {MatDialog} from "@angular/material/dialog";
import {MatPaginator} from "@angular/material/paginator";
import {Student} from "../../data/model/student.model";
import {Teacher} from "../../data/model/teacher.model";
import {TeacherDeleteComponent} from "./teacher-delete/teacher-delete.component";
import {TeacherCreateComponent} from "./teacher-create/teacher-create.component";
import {TeacherEditComponent} from "./teacher-edit/teacher-edit.component";

@Component({
  selector: 'app-teachers',
  templateUrl: './teachers.component.html',
  styleUrls: ['./teachers.component.scss']
})
export class TeachersComponent implements OnInit, AfterViewInit {

  loading = true;
  displayedColumns: string[] =
    ['login', 'name', 'subjectsCount', 'creationTime', 'actions'];
  pageSizeOptions = [5, 10, 20];
  teachers: MatTableDataSource<Teacher> = new MatTableDataSource<Teacher>();
  filterValue: string = '';
  createBtnState = true;

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private data: DataService, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.data.teachers.subscribe(
      (teachers: Teacher[]) => {
        this.teachers.data = teachers;
        this.loading = false;
      }
    );
    if (window.innerHeight >= 800) this.pageSizeOptions = [10, 5, 20];
  }

  ngAfterViewInit(): void {
    this.teachers.paginator = this.paginator;
    this.teachers.sort = this.sort;
  }

  applyFilter() {
    this.teachers.filter = this.filterValue;

    if (this.teachers.paginator) {
      this.teachers.paginator.firstPage();
    }
  }

  onCreateClick(): void {
    const dialogRef = this.dialog.open(TeacherCreateComponent, {
      width: '360px'
    });
    const subscription = dialogRef.componentInstance.onCreated.subscribe((teacher: Teacher) => {
      this.teachers.data.unshift(teacher);
      this.teachers.data = this.teachers.data;
    });
    dialogRef.afterClosed().subscribe(() => subscription.unsubscribe());
  }

  onEditClick(teacher: Teacher): void {
    const dialogRef = this.dialog.open(TeacherEditComponent, {
      width: '360px',
      data: teacher
    });
    dialogRef.afterClosed().subscribe((teacher: Teacher | undefined) => {
      if (!teacher) return;

      const index = this.teachers.data.findIndex((t: Teacher) => t.id === teacher.id)
      if (index !== -1) this.teachers.data.splice(index, 1, teacher);
      this.teachers.data = this.teachers.data;
    });
  }

  onDeleteClick(teacher: Teacher): void {
    const dialogRef = this.dialog.open(TeacherDeleteComponent, {
      maxWidth: '600px',
      data: teacher
    });
    dialogRef.afterClosed().subscribe((res: number | undefined) => {
      if (res !== undefined) {
        const index = this.teachers.data.map<number>(t => t.id).indexOf(res);
        if (index !== -1) {
          this.teachers.data.splice(index, 1);
          this.teachers.data = this.teachers.data;
          if (!this.teachers.data.length) {
            this.filterValue = '';
            this.applyFilter();
          }
        }
      }
    });
  }
}
