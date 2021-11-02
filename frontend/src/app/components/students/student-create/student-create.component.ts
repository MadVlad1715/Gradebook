import {Component, ElementRef, EventEmitter, Inject, OnInit, ViewChild} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {DataService} from "../../../data/data.service";
import {AbstractControl, FormBuilder, FormGroup, Validators} from "@angular/forms";
import {map, startWith} from "rxjs/operators";
import {Observable} from "rxjs";
import {Student} from "../../../data/model/student.model";
import {Group} from "../../../data/model/group.model";
import {Status} from "../../../data/model/status.model";
import {HttpErrorResponse} from "@angular/common/http";

@Component({
  selector: 'app-student-create',
  templateUrl: './student-create.component.html',
  styleUrls: ['./student-create.component.scss']
})
export class StudentCreateComponent implements OnInit {

  form!: FormGroup;
  onCreated: EventEmitter<Student> = new EventEmitter<Student>();

  groups!: Group[];
  groupNames: string[] = [];
  filteredOptions!: Observable<string[]>;

  requesting = true;
  success = false;
  error = false;
  errorText: string = '';
  lastCreatedStudentName: string = '';

  constructor(private dialogRef: MatDialogRef<StudentCreateComponent>,
              private data: DataService,
              private fb: FormBuilder) {
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      login: ['', this.loginValidator()],
      firstName: [''],
      lastName: [''],
      group: ['', this.groupValidator()],
      password: ['']
    });
    this.form.disable();

    this.data.groups.subscribe(
      (groups: Group[]) => {
        this.groups = groups;
        this.groupNames = this.groups.map<string>(g => g.name);
        this.requesting = false;
        this.form.enable();
      }
    );

    this.filteredOptions = this.form.controls['group'].valueChanges
      .pipe(
        startWith(''),
        map(value => this.filter(value))
      );
  }

  private filter(groupName: string): string[] {
    if (!groupName || groupName === '') return this.groupNames.slice();
    const filterValue = groupName.toLowerCase();
    return this.groupNames.filter(n => n.toLowerCase().indexOf(filterValue) !== -1 && n.toLowerCase() !== filterValue);
  }

  private loginValidator() {
    return (control: AbstractControl): { [key: string]: any } | null =>
      !control.value
        ? null : control.value.match(/\s/)
          ? {forbiddenLogin: {value: control.value}} : null;
  }

  private groupValidator() {
    return (control: AbstractControl): { [key: string]: any } | null =>
      !control.value
        ? null : this.groupNames.find(n => n.toLowerCase() === control.value.toLowerCase()) === undefined
        ? {unknownGroup: {value: control.value}} : null;
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    let groupId: number | undefined = this.groups.find(g => g.name.toLowerCase() === this.form.value.group.toLowerCase())?.id;
    if (groupId === undefined) return;

    this.dialogRef.disableClose = true;
    this.error = false;
    this.success = false;
    this.requesting = true;

    this.data.studentCreate(this.form.value.login, this.form.value.firstName,
      this.form.value.lastName, groupId, this.form.value.password)
      .subscribe(
      (student: Student) => {
        this.requesting = false;
        this.success = true;
        this.error = false;
        this.form.reset();
        this.dialogRef.disableClose = false;
        this.lastCreatedStudentName = student.name;
        this.onCreated.emit(student);
      },
      (error: Status) => {
        this.requesting = false;
        this.success = false;
        this.error = true;
        this.dialogRef.disableClose = false;

        if (error.message === "Login already in use") this.errorText= "Користувач з таким логіном вже існує";
        else this.errorText= "Виникла помилка";
      });
  }
}
