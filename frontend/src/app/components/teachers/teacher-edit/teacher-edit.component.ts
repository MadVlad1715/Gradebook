import {Component, Inject, OnInit} from '@angular/core';
import {AbstractControl, FormBuilder, FormGroup} from "@angular/forms";
import {Teacher} from "../../../data/model/teacher.model";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {DataService} from "../../../data/data.service";
import {Status} from "../../../data/model/status.model";

@Component({
  selector: 'app-teacher-edit',
  templateUrl: './teacher-edit.component.html',
  styleUrls: ['./teacher-edit.component.scss']
})
export class TeacherEditComponent implements OnInit {

  form!: FormGroup;

  requesting = false;
  error = false;
  errorText: string = '';

  constructor(private dialogRef: MatDialogRef<TeacherEditComponent>,
              private data: DataService,
              private fb: FormBuilder,
              @Inject(MAT_DIALOG_DATA) private teacher: Teacher) {
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      login: [this.teacher.login, this.loginValidator()],
      firstName: [this.teacher.firstName],
      lastName: [this.teacher.lastName],
      patronymic: [this.teacher.patronymic],
      password: ['']
    });
  }

  private loginValidator() {
    return (control: AbstractControl): { [key: string]: any } | null =>
      !control.value
        ? null : control.value.match(/\s/)
          ? {forbiddenLogin: {value: control.value}} : null;
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    this.dialogRef.disableClose = true;
    this.error = false;
    this.requesting = true;

    this.data.teacherEdit(this.teacher.id, this.form.value.login, this.form.value.firstName,
      this.form.value.lastName, this.form.value.patronymic, this.form.value.password)
      .subscribe(
        (teacher: Teacher) => {
          this.requesting = false;
          this.error = false;
          this.form.reset();
          this.dialogRef.disableClose = false;
          this.dialogRef.close(teacher);
        },
        (error: Status) => {
          this.requesting = false;
          this.error = true;
          this.dialogRef.disableClose = false;

          if (error.message === "Login already in use") this.errorText= "Користувач з таким логіном вже існує";
          else this.errorText = "Виникла помилка";
        });
  }
}
