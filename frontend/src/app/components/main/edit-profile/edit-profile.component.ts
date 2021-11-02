import {Component, EventEmitter, Inject, OnInit} from '@angular/core';
import {AbstractControl, FormBuilder, FormGroup} from "@angular/forms";
import {Teacher} from "../../../data/model/teacher.model";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {DataService} from "../../../data/data.service";
import {Status} from "../../../data/model/status.model";
import {User} from "../../../data/model/user.model";
import {map, startWith} from "rxjs/operators";
import {AuthService} from "../../../auth/auth.service";

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.scss']
})
export class EditProfileComponent implements OnInit {

  form!: FormGroup;

  requesting = false;
  error = false;
  errorText: string = '';

  constructor(private dialogRef: MatDialogRef<EditProfileComponent>,
              private data: DataService,
              private fb: FormBuilder,
              public auth: AuthService,
              @Inject(MAT_DIALOG_DATA) private user: User) {
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      login: [this.user.login, this.loginValidator()],
      firstName: [this.user.first_name],
      lastName: [this.user.last_name],
      patronymic: [this.user.patronymic],
      password: [''],
      passwordRepeat: ['', this.repeatPasswordValidator()]
    });

    this.form.controls['password'].valueChanges
      .pipe(startWith(''))
      .subscribe(val => {
        const repeatPass = this.form.controls['passwordRepeat'];
        if (val) {
          repeatPass.enable()
        } else {
          repeatPass.setValue('');
          repeatPass.disable();
        }
      })
  }

  private loginValidator() {
    return (control: AbstractControl): { [key: string]: any } | null =>
      !control.value
        ? null : control.value.match(/\s/)
        ? {forbiddenLogin: {value: control.value}} : null;
  }

  private repeatPasswordValidator() {
    return (control: AbstractControl): { [key: string]: any } | null => {
      if (!this.form) return null;

      const pass = this.form.controls['password'];
      if (pass.value != control.value && control.value) return {passwordMismatch: {value: control.value}}

      return !control.value
        ? null : control.value.match(/\s/)
        ? {forbiddenLogin: {value: control.value}} : null;
    }
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    this.dialogRef.disableClose = true;
    this.error = false;
    this.requesting = true;

    const value = this.form.value;
    this.form.disable();

    this.data.updateProfile(value.login, value.firstName, value.lastName,
      value.patronymic, value.password)
      .subscribe(
        (user: User) => {
          this.requesting = false;
          this.error = false;
          this.form.enable();
          this.form.controls['password'].updateValueAndValidity();
          this.dialogRef.disableClose = false;
          this.dialogRef.close(user);
        },
        (error: Status) => {
          this.requesting = false;
          this.error = true;
          this.form.enable();
          this.form.controls['password'].updateValueAndValidity();
          this.dialogRef.disableClose = false;

          if (error.message === "Login already in use") this.errorText= "Користувач з таким логіном вже існує";
          else this.errorText = "Виникла помилка";
        });
  }
}
