import { Injectable } from '@angular/core';
import {Router} from "@angular/router";
import {HttpClient, HttpErrorResponse, HttpHeaders} from "@angular/common/http";
import {catchError} from "rxjs/operators";
import {EMPTY, ObservableInput, throwError} from "rxjs";
import {environment} from "../../environments/environment";

const API_URL: string = environment.API_URL;

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  constructor(private http: HttpClient, private router: Router) {}

  public get isAuth(): boolean {
    const token = localStorage.getItem('token');
    return token !== null && token !== '';
  }

  public get (method: string, httpOptions: any = {}) {
    this.setAuthHeader(httpOptions);
    return this.http.get(API_URL + method, httpOptions)
      .pipe(catchError(this.handleError.bind(this)));
  }

  public post (method: string, payload: any, httpOptions: any = {}) {
    this.setAuthHeader(httpOptions);
    return this.http.post(API_URL + method, payload, httpOptions)
      .pipe(catchError(this.handleError.bind(this)));
  }

  public put (method: string, payload: any, httpOptions: any = {}) {
    this.setAuthHeader(httpOptions);
    return this.http.put(API_URL + method, payload, httpOptions)
      .pipe(catchError(this.handleError.bind(this)));
  }

  public patch (method: string, payload: any, httpOptions: any = {}) {
    this.setAuthHeader(httpOptions);
    return this.http.patch(API_URL + method, payload, httpOptions)
      .pipe(catchError(this.handleError.bind(this)));
  }

  public delete (method: string, httpOptions: any = {}) {
    this.setAuthHeader(httpOptions);
    return this.http.delete(API_URL + method, httpOptions)
      .pipe(catchError(this.handleError.bind(this)));
  }

  public get token(): string {
    if (!this.isAuth) return '';
    return localStorage.getItem('token') as string;
  }

  public set token(token: string) {
    localStorage.setItem('token', token);
  }

  public removeToken(): void {
    localStorage.removeItem('token');
  }

  private setAuthHeader(httpOptions: any): void {
    if (!this.isAuth) return;
    if (!('headers' in httpOptions)) {
      httpOptions.headers = new HttpHeaders();
    }
    httpOptions.headers = httpOptions.headers.set('Authorization', this.token);
  }

  private handleError(error: HttpErrorResponse): ObservableInput<any> {
    if (error.status === 401 && this.router.url !== '/login') {
      this.removeToken();
      this.router.navigate(['/login']);
      return EMPTY;
    }
    error.error.httpStatus = error.status;
    return throwError(error.error);
  }
}
