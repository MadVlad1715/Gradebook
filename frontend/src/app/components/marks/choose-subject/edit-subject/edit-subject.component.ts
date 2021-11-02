import {Component, ElementRef, EventEmitter, Inject, OnInit, ViewChild} from '@angular/core';
import {AbstractControl, FormBuilder, FormGroup} from "@angular/forms";
import {Subject} from "../../../../data/model/subject.model";
import {Teacher} from "../../../../data/model/teacher.model";
import {Observable} from "rxjs";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {DataService} from "../../../../data/data.service";
import {map, startWith} from "rxjs/operators";
import {Status} from "../../../../data/model/status.model";

@Component({
  selector: 'app-edit-subject',
  templateUrl: './edit-subject.component.html',
  styleUrls: ['./edit-subject.component.scss']
})
export class EditSubjectComponent implements OnInit {

  form!: FormGroup;

  subject!: Subject;

  subjects: Subject[];
  teachers: Teacher[] = [];
  teacherNames: string[] = [];
  filteredOptions!: Observable<string[]>;

  inited = false;
  requesting = false;
  error = false;

  @ViewChild('name') nameField!: ElementRef;

  constructor(private dialogRef: MatDialogRef<EditSubjectComponent>,
              private data: DataService,
              private fb: FormBuilder,
              @Inject(MAT_DIALOG_DATA) private _data: any) {
    this.subject = this._data['subject'];
    this.subjects = this._data['subjects'];
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      name: [{value: '', disabled: true}, this.subjectNameValidator()],
      teacher: [{value: '', disabled: true}, this.teacherNameValidator()]
    });

    this.data.teachers.subscribe (
      (teachers: Array<Teacher>) => {
        this.teachers = teachers;
        this.teacherNames = this.teachers.map<string>(teacher => teacher.name);
        this.form.enable();
        const currentTeacher = teachers.find(t => t.id === this.subject.teacherId)
        this.form.controls['name'].setValue(this.subject.name);
        currentTeacher && this.form.controls['teacher'].setValue(currentTeacher.name);
        this.inited = true;
        this.nameField.nativeElement.focus();
      }
    );

    this.filteredOptions = this.form.controls['teacher'].valueChanges
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

  private subjectNameValidator() {
    return (control: AbstractControl): { [key: string]: any } | null =>
      !control.value
        ? null : this.subjects.find(s => s.id !== this.subject.id && s.name.toLowerCase() === control.value.toLowerCase()) !== undefined
        ? {subjectAlreadyExists: {value: control.value}} : control.value.match(/^\s+$|^[.]|[.]$|[/\\#%]/)
          ? {forbiddenName: {value: control.value}} : null;
  }

  private teacherNameValidator() {
    return (control: AbstractControl): { [key: string]: any } | null =>
      !control.value
        ? null : this.teacherNames.find(n => n.toLowerCase() === control.value.toLowerCase()) === undefined
        ? {unknownTeacherName: {value: control.value}} : null;
  }

  onSubmit(): void {
    let name = this.form.value.name;
    name = name.trim();
    name = name.replace(/\s{2,}/g, ' ');
    this.form.controls['name'].setValue(name);

    if (this.form.invalid) return;

    let teacherId: number | undefined | null = null;
    if (this.form.value.teacher) {
      teacherId = this.teachers.find(t => t.name.toLowerCase() === this.form.value.teacher.toLowerCase())?.id;
      if (teacherId === undefined) return;
    }

    this.dialogRef.disableClose = true;
    this.error = false;

    this.requesting = true;
    this.form.disable();

    this.data.subjectEdit(this.subject.id, name, teacherId).subscribe(
      (subject: Subject) => {
        this.requesting = false;
        this.form.enable();
        this.error = false;
        this.dialogRef.disableClose = false;
        this.dialogRef.close(subject);
      },
      (error: Status) => {
        this.requesting = false;
        this.form.enable();
        this.error = true;
        this.dialogRef.disableClose = false;
      });
  }

}
