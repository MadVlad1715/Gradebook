import {Component, EventEmitter, Inject, OnInit} from '@angular/core';
import {AbstractControl, FormBuilder, FormGroup} from "@angular/forms";
import {Student} from "../../../data/model/student.model";
import {Group} from "../../../data/model/group.model";
import {Observable} from "rxjs";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {DataService} from "../../../data/data.service";
import {map, startWith} from "rxjs/operators";
import {Status} from "../../../data/model/status.model";

@Component({
  selector: 'app-student-edit',
  templateUrl: './student-edit.component.html',
  styleUrls: ['./student-edit.component.scss']
})
export class StudentEditComponent implements OnInit {

  form!: FormGroup;

  groupNames: string[] = [];
  groups: Group[] = [];
  filteredOptions!: Observable<string[]>;

  requesting = true;
  error = false;
  errorText: string = '';
  lastCreatedStudentName: string = '';

  constructor(private dialogRef: MatDialogRef<StudentEditComponent>,
              private data: DataService,
              private fb: FormBuilder,
              @Inject(MAT_DIALOG_DATA) private student: Student) {
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      login: [this.student.login, this.loginValidator()],
      firstName: [this.student.firstName],
      lastName: [this.student.lastName],
      group: [this.student.groupName, this.groupValidator()],
      password: ['']
    });
    this.form.disable();

    this.data.groups.subscribe (
      (groups: Group[]) => {
        this.groups = groups;
        this.groupNames = this.groups.map<string>(g => g.name);
        this.requesting = false;
        this.form.enable();
      }
    )

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
    this.requesting = true;

    this.data.studentEdit(this.student.id, this.form.value.login, this.form.value.firstName,
      this.form.value.lastName, groupId, this.form.value.password)
      .subscribe(
        (student: Student) => {
          this.requesting = false;
          this.error = false;
          this.form.reset();
          this.dialogRef.disableClose = false;
          this.dialogRef.close(student);
        },
        (error: Status) => {
          this.requesting = false;
          this.error = true;
          this.dialogRef.disableClose = false;

          if (error.message === "Login already in use") this.errorText= "Користувач з таким логіном вже існує";
          else this.errorText= "Виникла помилка";
        });
  }

}
