import {Component, EventEmitter, OnInit} from '@angular/core';
import {MatDialogRef} from "@angular/material/dialog";
import {AbstractControl, FormBuilder, FormGroup} from "@angular/forms";
import {Status} from "../../../data/model/status.model";
import {Teacher} from "../../../data/model/teacher.model";
import {DataService} from "../../../data/data.service";

@Component({
  selector: 'app-teacher-create',
  templateUrl: './teacher-create.component.html',
  styleUrls: ['./teacher-create.component.scss']
})
export class TeacherCreateComponent implements OnInit {

  form!: FormGroup;
  onCreated: EventEmitter<Teacher> = new EventEmitter<Teacher>();

  requesting = false;
  success = false;
  error = false;
  errorText: string = '';
  lastCreatedTeacherName: string = '';

  constructor(private dialogRef: MatDialogRef<TeacherCreateComponent>,
              private data: DataService,
              private fb: FormBuilder) {
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      login: ['', this.loginValidator()],
      firstName: [''],
      lastName: [''],
      patronymic: [''],
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
    this.success = false;
    this.requesting = true;

    this.data.teacherCreate(this.form.value.login, this.form.value.firstName,
      this.form.value.lastName, this.form.value.patronymic, this.form.value.password)
      .subscribe(
        (teacher: Teacher) => {
          this.requesting = false;
          this.success = true;
          this.error = false;
          this.form.reset();
          this.dialogRef.disableClose = false;
          this.lastCreatedTeacherName = teacher.name;
          this.onCreated.emit(teacher);
        },
        (error: Status) => {
          this.requesting = false;
          this.success = false;
          this.error = true;
          this.dialogRef.disableClose = false;

          if (error.message === "Login already in use") this.errorText= "Користувач з таким логіном вже існує";
          else this.errorText = "Виникла помилка";
        });
  }
}
