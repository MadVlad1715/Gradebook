import { Injectable } from '@angular/core';
import {ApiService} from "../api/api.service";
import {EMPTY, NEVER, Observable, throwError} from "rxjs";
import {IUser, User} from "./model/user.model";
import {catchError, delay, map, tap} from "rxjs/operators";
import {Group} from "./model/group.model";
import {DatePipe} from "@angular/common";
import {Teacher} from "./model/teacher.model";
import {Student} from "./model/student.model";
import { of } from 'rxjs';
import {Subject} from "./model/subject.model";

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor(private api: ApiService, private date: DatePipe) {
  }

  public get userInfo(): Observable<any> {
    return this.api.get('user')
      .pipe(
        map((data: IUser) => new User(data))
      );
  }

  public updateProfile(login: string, firstName: string, lastName: string, patronymic?: string | null, password?:string | null): Observable<any> {
    if (!password) password = null;
    if (!patronymic) patronymic = null;

    return this.api.put('user', {login, firstName, lastName, patronymic, password})
      .pipe(
        map((data: IUser) => new User(data))
      );
  }

  private arrToGroup(arr: Array<any>): Group {
    return {
      'id': +arr[0],
      'name': arr[1],
      'classroomTeacher': arr[2],
      'studentsCount': +arr[3],
      'subjectsCount': +arr[4],
      'creationTime': this.date.transform(+arr[5] * 1000, 'dd.MM.YYYY HH:mm') as string
    }
  }

  private arrToTeacher(arr: Array<any>): Teacher {
    return {
      'id': +arr[0],
      'login': arr[1],
      'name': arr[3] + ' ' + arr[2] + ' ' + arr[4],
      'firstName': arr[2],
      'lastName': arr[3],
      'patronymic': arr[4],
      'subjectsCount': +arr[5],
      'creationTime': this.date.transform(+arr[6] * 1000, 'dd.MM.YYYY HH:mm') as string
    }
  }

  private arrToStudent(arr: Array<any>): Student {
    return {
      'id': +arr[0],
      'login': arr[1],
      'name': arr[3] + ' ' + arr[2],
      'firstName': arr[2],
      'lastName': arr[3],
      'groupId': +arr[4],
      'groupName': arr[5],
      'creationTime': this.date.transform(+arr[6] * 1000, 'dd.MM.YYYY HH:mm') as string
    }
  }

  private arrToSubject(arr: Array<any>): Subject {
    return {
      'id': +arr[0],
      'name': arr[1],
      'teacherId': +arr[2],
      'teacherName': arr[3],
      'lastEditTime': +arr[4],
      'creationTime': arr[5]
    }
  }

  public get groups(): Observable<Group[]> {
    return this.api.get('groups')
      .pipe(
        map((data: any) => {
          return (data['groups'] as Array<any>)
            .map<Group>(g => this.arrToGroup(g));
        }));
  }

  public groupDelete(id: number): Observable<any> {
    return this.api.delete(`groups/${id}`);
  }

  public groupCreate(name: string, classroomTeacherId: number | null) {
    return this.api.post('groups', {name, classroomTeacherId})
      .pipe(
        map((data: any) => this.arrToGroup(data['group']))
      )
  }

  public groupEdit(id:number, name: string, classroomTeacherId: number | null): Observable<Group> {
    return this.api.put(`groups/${id}`, {name, classroomTeacherId})
      .pipe(
        map((data: any) => this.arrToGroup(data['group']))
      );
  }

  public get teachers(): Observable<Teacher[]> {
    return this.api.get('teachers')
      .pipe(
        map((data: any) => {
          return (data['teachers'] as Array<any>)
            .map<Teacher>(t => this.arrToTeacher(t));
        }));
  }

  public teacherDelete(id: number): Observable<number> {
    return this.api.delete(`teachers/${id}`)
      .pipe(
        map((data: any) => data.id)
      );
  }

  public teacherCreate(login: string, firstName: string, lastName: string, patronymic: string, password: string): Observable<Teacher> {
    return this.api.post('teachers', {login, firstName, lastName, patronymic, password})
      .pipe(
        map((data: any) => this.arrToTeacher(data['teacher']))
      );
  }

  public teacherEdit(id: number, login: string, firstName: string, lastName: string, patronymic: string, password?: string | null): Observable<Teacher> {
    if (!password) password = null;
    return this.api.put(`teachers/${id}`, {login, firstName, lastName, patronymic, password})
      .pipe(
        map((data: any) => this.arrToTeacher(data['teacher']))
      );
  }

  public get students(): Observable<Student[]> {
    return this.api.get('students')
      .pipe(
        map((data: any) => {
          return (data['students'] as Array<any>)
            .map<Student>(s => this.arrToStudent(s));
        }));
  }

  public studentDelete(id: number): Observable<number> {
    return this.api.delete(`students/${id}`)
      .pipe(
        map((data: any) => data.id)
      );
  }

  public studentCreate(login: string, firstName: string, lastName: string, groupId: number, password: string): Observable<Student> {
    return this.api.post('students', {login, firstName, lastName, groupId, password})
      .pipe(
        map((data: any) => {
          return this.arrToStudent(data['student']);
        })
      );
  }

  public studentEdit(id:number, login: string, firstName: string, lastName: string, groupId: number, password?: string | null): Observable<Student> {
    if (!password) password = null;
    return this.api.put(`students/${id}`, {login, firstName, lastName, groupId, password})
      .pipe(
        map((data: any) => this.arrToStudent(data['student']))
      );
  }

  public marks(group: string, subject: string): Observable<any> {
    return this.api.get(`marks/${group}/${subject}`)
      .pipe(
        map(data => {
          let res: any = [];

          res.subject = [];
          res.subject.id = +data['subject'][0];
          res.subject.name = data['subject'][1];
          res.subject.teacher = data['subject'][2];
          res.subject.group = [];
          res.subject.group.id = +data['subject'][3];
          res.subject.group.name = data['subject'][4];
          res.subject.group.classroomTeacher = data['subject'][5];

          res.cols = data['cols'].map((col: Array<any>) => {
            return {
              'id': +col[0],
              'date': +col[1]
            }
          });

          res.students = data['students'].map((st: Array<any>) => {
            return {
              'id': +st[0],
              'name': st[1]
            }
          });

          res.marks = data['marks'].map((mark: Array<any>) => {
            return {
              'id': +mark[0],
              'colId': +mark[1],
              'stId': +mark[2],
              'mark': mark[3]
            }
          });

          return res;
        })
      );
  }

  public updateMark(colId: number, stId: number, mark: string): Observable<any> {
    return this.api.put("marks", {colId, stId, mark});
  }

  public createColumn(subjectId: number, date: number) {
    return this.api.post("columns", {subjectId, date});
  }

  public updateColumn(colId: number, date: number) {
    return this.api.patch(`columns/${colId}`, {date});
  }

  public deleteColumn(colId: number) {
    return this.api.delete(`columns/${colId}`);
  }

  public subjects(group: string) {
    return this.api.get(`subjects/${group}`).pipe(
      map(data => {
        let res: any = {
          'group': {
            'id': +data['group'][0],
            'name': data['group'][1],
            'classroomTeacherId': +data['group'][2],
            'classroomTeacherName': data['group'][3]
          },
          'subjects': (data['subjects'] as Array<any>).map<Subject>(s => this.arrToSubject(s))
        }
        return res;
      })
    )
  }

  public subjectCreate(name: string, groupId: number, teacherId: number | null) {
    return this.api.post("subjects", {
      name,
      groupId,
      teacherId
    }).pipe(map((data: any) => this.arrToSubject(data['subject'])));
  }

  public subjectEdit(subjectId: number, name: string, teacherId: number | null) {
    return this.api.put(`subjects/${subjectId}`, {name, teacherId})
      .pipe(
        map(data => this.arrToSubject(data['subject']))
      );
  }

  public subjectDelete(subjectId: number) {
    return this.api.delete(`subjects/${subjectId}`);
  }
}
