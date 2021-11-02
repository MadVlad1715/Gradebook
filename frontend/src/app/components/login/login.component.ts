import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {AuthService} from "../../auth/auth.service";
import {Status} from "../../data/model/status.model";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  form!: FormGroup;
  inProcess: boolean = false;

  authError: boolean = false;
  authErrorMsg: string = 'Виникла помилка';

  constructor(private auth: AuthService, private fb: FormBuilder) {
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      login: '',
      password: ''
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.inProcess = true;
    this.authError = false;

    this.auth.login(this.form.value.login, this.form.value.password)
      .subscribe(undefined, (error: Status) => {
        this.inProcess = false;
        this.authError = true;

        if (error.httpStatus === 401) this.authErrorMsg = 'Не вірний логін або пароль';
        else this.authErrorMsg = 'Виникла помилка';
      });
  }
}
