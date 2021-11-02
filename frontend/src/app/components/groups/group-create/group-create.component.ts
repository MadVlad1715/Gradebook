import {Component, ElementRef, EventEmitter, Inject, OnInit, ViewChild} from '@angular/core';
import {MatDialogRef} from "@angular/material/dialog";
import {DataService} from "../../../data/data.service";
import {AbstractControl, FormBuilder, FormGroup} from "@angular/forms";
import {Status} from "../../../data/model/status.model";
import {Teacher} from "../../../data/model/teacher.model";
import {map, startWith} from "rxjs/operators";
import {Observable} from "rxjs";
import {Group} from "../../../data/model/group.model";

@Component({
  selector: 'app-group-create',
  templateUrl: './group-create.component.html',
  styleUrls: ['./group-create.component.scss']
})
export class GroupCreateComponent implements OnInit {
  form!: FormGroup;
  onCreated: EventEmitter<Group> = new EventEmitter<Group>();

  teachers: Teacher[] = [];
  teacherNames: string[] = [];
  filteredOptions!: Observable<string[]>;

  requesting = true;
  success = false;
  error = false;
  errorText = '';

  lastCreatedGroupName = '';

  @ViewChild('name') nameField!: ElementRef;

  constructor(private dialogRef: MatDialogRef<GroupCreateComponent>,
              private data: DataService,
              private fb: FormBuilder) {
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      name: ['', this.groupNameValidator()],
      classroomTeacher: ['', this.teacherNameValidator()]
    });
    this.form.disable();

    this.data.teachers.subscribe(
      teachers => {
        this.teachers = teachers;
        this.teacherNames = this.teachers.map(t => t.name);
        this.requesting = false;
        this.form.enable();
      });

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

    this.data.groupCreate(this.form.value.name, teacher_id).subscribe(
      (group: Group) => {
        this.lastCreatedGroupName = group.name;
        this.requesting = false;
        this.success = true;
        this.error = false;
        this.form.reset();
        this.dialogRef.disableClose = false;
        this.onCreated.emit(group);
      },
      (error: Status) => {
        this.requesting = false;
        this.success = false;
        this.error = true;
        this.dialogRef.disableClose = false;

        if (error.message === "Login already in use") this.errorText = "Користувач з таким логіном вже існує";
        else this.errorText = "Виникла помилка";
      });
  }
}
