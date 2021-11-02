import { Injectable } from '@angular/core';
import {Router} from "@angular/router";
import {ApiService} from "../api/api.service";
import {tap} from "rxjs/operators";
import {BehaviorSubject, EMPTY, Observable} from "rxjs";
import {IUser, User} from "../data/model/user.model";

@Injectable({
  providedIn: 'root'
})

export class AuthService {

  private _inited = false;
  private user!: { status: number, groupName?: string };

  constructor(private api: ApiService, private router: Router) {
    if (api.isAuth) {
      api.get('token/verify').subscribe(
        (res) => {
          this.updateUserInfo(res);
          this._inited = true;
        }
      );
    } else this._inited = true;
  }

  public get inited(): boolean {
    return this._inited;
  }

  public get userStatus() {
    return this.user.status;
  }

  public get isAdmin(): boolean {
    return Boolean(this.userStatus & 1)
  }

  public get isTeacher(): boolean {
    return Boolean(this.userStatus & 2)
  }

  public get isStudent(): boolean {
    return Boolean(this.userStatus & 4)
  }

  public get isAuth(): boolean {
    return this.api.isAuth;
  }

  public get stGroupName(): string | undefined {
    return this.user.groupName;
  }

  private updateUserInfo(data: any) {
    this.user = {
      status: data['userStatus']
    }
    if (this.isStudent) this.user.groupName = data['groupName'];
  }

  public login(login: string, password: string): Observable<any> {
    if (this.isAuth) return EMPTY;

    return this.api.post('login', {login, password})
      .pipe(
        tap((res: any) => {
          this.api.token = res.token;
          this.updateUserInfo(res);
          this.router.navigate(['/main']);
        })
      );
  }

  public logout(all: boolean = false): void {
    if (!this.api.isAuth) return;

    this.api.get(`logout?all=${all}`).subscribe();
    this.api.removeToken();

    this.router.navigate(['/login']);
  }
}
