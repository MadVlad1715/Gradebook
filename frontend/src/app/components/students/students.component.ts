import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {DataService} from "../../data/data.service";
import {MatTableDataSource} from "@angular/material/table";
import {MatSort} from "@angular/material/sort";
import {MatDialog} from "@angular/material/dialog";
import {MatPaginator} from "@angular/material/paginator";
import {Student} from "../../data/model/student.model";
import {StudentDeleteComponent} from "./student-delete/student-delete.component";
import {Status} from "../../data/model/status.model";
import {Group} from "../../data/model/group.model";
import {StudentCreateComponent} from "./student-create/student-create.component";
import {TeacherEditComponent} from "../teachers/teacher-edit/teacher-edit.component";
import {Teacher} from "../../data/model/teacher.model";
import {StudentEditComponent} from "./student-edit/student-edit.component";

@Component({
  selector: 'app-students',
  templateUrl: './students.component.html',
  styleUrls: ['./students.component.scss']
})
export class StudentsComponent implements OnInit, AfterViewInit {

  loading = true;
  displayedColumns: string[] =
    ['login', 'name', 'group', 'creationTime', 'actions'];
  pageSizeOptions = [5, 10, 20];
  students: MatTableDataSource<Student> = new MatTableDataSource<Student>();
  filterValue: string = '';

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private data: DataService, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.data.students.subscribe(
      (students: Student[]) => {
        this.students.data = students;
        this.loading = false;
      }
    );
    if (window.innerHeight >= 800) this.pageSizeOptions = [10, 5, 20];
  }

  ngAfterViewInit(): void {
    this.students.paginator = this.paginator;
    this.students.sort = this.sort;
  }

  applyFilter() {
    this.students.filter = this.filterValue;

    if (this.students.paginator) {
      this.students.paginator.firstPage();
    }
  }

  createStudent(): void {
    const dialogRef = this.dialog.open(StudentCreateComponent, {
      width: '360px'
    });
    const subscription = dialogRef.componentInstance.onCreated.subscribe((student: Student) => {
      this.students.data.unshift(student);
      this.students.data = this.students.data;
    });
    dialogRef.afterClosed().subscribe(() => subscription.unsubscribe());
  }

  editStudent(student: Student): void {
    const dialogRef = this.dialog.open(StudentEditComponent, {
      width: '360px',
      data: student
    });

    dialogRef.afterClosed().subscribe((student: Student | undefined) => {
      if (!student) return;

      const index = this.students.data.findIndex((s: Student) => s.id === student.id)
      if (index !== -1) this.students.data.splice(index, 1, student);
      this.students.data = this.students.data;
    });
  }

  deleteStudent(student: Student): void {
    const dialogRef = this.dialog.open(StudentDeleteComponent, {
      maxWidth: '600px',
      data: student
    });
    dialogRef.afterClosed().subscribe((res: number | undefined) => {
      if (res !== undefined) {
        const index = this.students.data.map<number>(s => s.id).indexOf(res);
        if (index !== -1) {
          this.students.data.splice(index, 1);
          this.students.data = this.students.data;
          if (!this.students.data.length) {
            this.filterValue = '';
            this.applyFilter();
          }
        }
      }
    });
  }
}
