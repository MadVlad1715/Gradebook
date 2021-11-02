import {Component, ElementRef, EventEmitter, Inject, OnInit, ViewChild} from '@angular/core';
import {AbstractControl, FormBuilder, FormGroup} from "@angular/forms";
import {Group} from "../../../data/model/group.model";
import {Teacher} from "../../../data/model/teacher.model";
import {Observable} from "rxjs";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {DataService} from "../../../data/data.service";
import {map, startWith} from "rxjs/operators";
import {Status} from "../../../data/model/status.model";

@Component({
  selector: 'app-group-edit',
  templateUrl: './group-edit.component.html',
  styleUrls: ['./group-edit.component.scss']
})
export class GroupEditComponent implements OnInit {
  form!: FormGroup;

  teachers: Teacher[] = [];
  teacherNames: string[] = [];
  filteredOptions!: Observable<string[]>;

  requesting = true;
  error = false;
  errorText: string = '';

  @ViewChild('name') nameField!: ElementRef;

  constructor(private dialogRef: MatDialogRef<GroupEditComponent>,
              private data: DataService,
              private fb: FormBuilder,
              @Inject(MAT_DIALOG_DATA) private group: Group) {
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      name: [this.group.name, this.groupNameValidator()],
      classroomTeacher: [this.group.classroomTeacher, this.teacherNameValidator()]
    });

    this.form.disable();

    this.data.teachers.subscribe (
      (teachers: Teacher[]) => {
        this.teachers = teachers;
        this.teacherNames = this.teachers.map<string>(t => t.name);
        this.requesting = false;
        this.form.enable();
      }
    )

    this.filteredOptions = this.form.controls['classroomTeacher'].valueChanges
      .pipe(
        startWith(''),
        map(value => this.filter(value))
      );
  }

  private filter(name: string): string[] {
    if (!name || name === '') return this.teacherNames.slice();
    const filterValue = name.toLowerCase();
    return this.teacherNames.filter(name => name.toLowerCase().indexOf(filterValue) !== -1);
  }

  private groupNameValidator() {
    return (control: AbstractControl): { [key: string]: any } | null =>
      !control.value
        ? null : control.value.match(/\s/)
          ? {forbiddenName: {value: control.value}} : null;
  }

  private teacherNameValidator() {
    return (control: AbstractControl): { [key: string]: any } | null =>
      !control.value
        ? null : this.teacherNames.find(n => n.toLowerCase() === control.value.toLowerCase()) === undefined
        ? {unknownTeacherName: {value: control.value}} : null;
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.form.value.name = this.form.value.name.toUpperCase();

    let teacher_id: number | undefined | null = null;
    if (this.form.value.classroomTeacher) {
      teacher_id = this.teachers.find(t => t.name.toLowerCase() === this.form.value.classroomTeacher.toLowerCase())?.id;
      if (teacher_id === undefined) return;
    }

    this.dialogRef.disableClose = true;
    this.error = false;

    this.requesting = true;

    this.data.groupEdit(this.group.id, this.form.value.name, teacher_id).subscribe(
      (group: Group) => {
        this.requesting = false;
        this.error = false;
        this.form.reset();
        this.dialogRef.disableClose = false;
        this.dialogRef.close(group);
      },
      (error: Status) => {
        this.requesting = false;
        this.error = true;
        this.dialogRef.disableClose = false;

        if (error.message === "Group name already in use") this.errorText = "Група з такою назвою вже існує";
        else this.errorText = "Виникла помилка";
      });
  }
}
