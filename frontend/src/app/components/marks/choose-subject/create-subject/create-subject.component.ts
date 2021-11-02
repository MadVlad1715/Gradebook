import {Component, ElementRef, EventEmitter, Inject, OnInit, ViewChild} from "@angular/core";
import {AbstractControl, FormBuilder, FormGroup} from "@angular/forms";
import {Subject} from "../../../../data/model/subject.model";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {DataService} from "../../../../data/data.service";
import {Observable} from "rxjs";
import {map, startWith} from "rxjs/operators";
import {Teacher} from "../../../../data/model/teacher.model";
import {Status} from "../../../../data/model/status.model";

@Component({
  selector: 'app-create-subject',
  templateUrl: './create-subject.component.html',
  styleUrls: ['./create-subject.component.scss']
})
export class CreateSubjectComponent implements OnInit {

  form!: FormGroup;
  onCreated: EventEmitter<Subject> = new EventEmitter<Subject>();

  currentGroupId!: number;

  subjectNames: string[] = [];
  teachers: Teacher[] = [];
  teacherNames: string[] = [];
  filteredOptions!: Observable<string[]>;

  inited = false;
  requesting = false;
  success = false;
  error = false;

  @ViewChild('name') nameField!: ElementRef;

  constructor(private dialogRef: MatDialogRef<CreateSubjectComponent>,
              private data: DataService,
              private fb: FormBuilder,
              @Inject(MAT_DIALOG_DATA) private _data: any) {
    this.subjectNames = (this._data['subjects'] as Subject[]).map<string>(subject => subject.name);
    this.currentGroupId = this._data['currentGroupId'];
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
        ? null : this.subjectNames.find(n => n.toLowerCase() === control.value.toLowerCase()) !== undefined
        ? {subjectAlreadyExists: {value: control.value}} : control.value.match(/\s/)
          ? {forbiddenName: {value: control.value}} : null;
  }

  private teacherNameValidator() {
    return (control: AbstractControl): { [key: string]: any } | null =>
      !control.value
        ? null : this.teacherNames.find(n => n.toLowerCase() === control.value.toLowerCase()) === undefined
        ? {unknownTeacherName: {value: control.value}} : null;
  }

  onSubmit(): void {
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

    this.data.subjectCreate(this.form.value.name, this.currentGroupId, teacherId).subscribe(
      (subject: Subject) => {
        this.requesting = false;
        this.form.enable();
        this.success = true;
        this.error = false;
        this.form.reset();
        this.dialogRef.disableClose = false;
        this.subjectNames.unshift(subject.name);
        this.onCreated.emit(subject);
        this.nameField.nativeElement.focus();
      },
      (error: Status) => {
        this.requesting = false;
        this.form.enable();
        this.success = false;
        this.error = true;
        this.dialogRef.disableClose = false;
      });
  }
}
