import {
  AfterContentInit,
  AfterViewChecked, AfterViewInit,
  Component,
  Directive, ElementRef,
  OnInit
} from '@angular/core';
import {DataService} from "../../data/data.service";
import {ActivatedRoute, Router} from "@angular/router";
import {Status} from "../../data/model/status.model";
import * as moment from 'moment';
import {Moment} from "moment";
import {MAT_DATE_FORMATS} from "@angular/material/core";
import {AuthService} from "../../auth/auth.service";

@Directive({
  selector: '[anotherDateFormat]',
  providers: [
    {
      provide: MAT_DATE_FORMATS, useValue: {
        parse: {
          dateInput: 'DD.MM.YYYY',
        },
        display: {
          dateInput: 'DD.MM.YYYY',
          monthYearLabel: 'MMMM YYYY',
          dateA11yLabel: 'DD.MM.YYYY',
          monthYearA11yLabel: 'MMMM YYYY',
        },
      }
    }
  ],
})
export class AnotherDateFormat {
}

@Component({
  selector: 'app-marks',
  templateUrl: './marks.component.html',
  styleUrls: ['./marks.component.scss'],
})
export class MarksComponent implements OnInit, AfterViewChecked {

  loading = true;
  error = false;

  subject!: any;

  columns!: any[];
  students!: any[];
  marks!: any[];

  constructor(public auth: AuthService,
              private router: Router,
              private data: DataService,
              private route: ActivatedRoute,
              private elem: ElementRef) {
  }

  ngOnInit(): void {
    let groupName = this.route.snapshot.params['group'].toUpperCase();
    if (!this.auth.isAdmin && !this.auth.isTeacher && groupName !== this.auth.stGroupName)
      this.router.navigate([`/marks/${this.auth.stGroupName}`]);

    this.data.marks(groupName, this.route.snapshot.params['subject'])
      .subscribe(
        (data: any) => {
          this.subject = data['subject'];
          this.columns = data['cols'];
          this.marks = data['marks'];
          this.students = data['students'];
          this.loading = false;

          this.students.sort((st1: any, st2: any) => st1.name.localeCompare(st2.name, "uk"));

          this.sortColumns();
        },
        (error: Status) => {
          this.router.navigate(['../'], {relativeTo: this.route});
        }
      );

    window.addEventListener("resize", this.onResize.bind(this));
  }


  ngAfterViewChecked() {
    const tableContainer: HTMLElement = this.elem.nativeElement.querySelector(".table-container");
    if (tableContainer && !tableContainer.style.maxHeight) this.onResize();
  }

  onResize(e: any = undefined) {
    const tableContainer: HTMLElement = this.elem.nativeElement.querySelector(".table-container");
    if (!tableContainer) return;

    let newHeight = window.innerHeight - tableContainer.getBoundingClientRect().y - 25;
    if (newHeight < 200) newHeight = 200;

    tableContainer.style.maxHeight = `${newHeight}px`;
    this.fixBorders();
  }

  fixBorders() { // to fix border disappears bug =(
    let nodes = document.querySelectorAll("table tr>:first-child");
    nodes.forEach((node: any) => node.style.borderRight = 'none')

    setTimeout(() => nodes.forEach((node: any) => {
      node.style.borderRight = null;
    }));
  }

  filterValue: string = '';

  get filteredStudents(): Array<any> {
    return this.filterValue ? this.students.filter(st => st.name.toLowerCase().includes(this.filterValue.toLowerCase())) : this.students;
  }

  startDate: Moment | undefined;
  endDate: Moment | undefined;

  get filteredColumns(): Array<any> {
    return this.columns.filter(col => (!this.startDate || col.date >= this.startDate.unix()) && (!this.endDate || col.date <= this.endDate.unix()))
  }

  columnMoment(column: any): Moment {
    return moment(column.date * 1000);
  }

  sortColumns() {
    this.columns.sort((col1: any, col2: any) => col1.date - col2.date);
  }

  onDateChange(column: any, e: any) {
    const date = e.value.unix();
    if (this.columns.find(col => col.date === date)) return;

    this.data.updateColumn(column.id, date).subscribe(res => {
      let column = this.columns.find(col => col.id === res.columnId);
      if (column) {
        column.date = res.date;
        this.sortColumns();
      }
    });
  }

  getMark(columnId: number, stId: number): string {
    let mark = this.marks.find(mark => mark.colId === columnId && mark.stId === stId)
    return mark ? mark.mark : '';
  }

  onMouseDown(e: any) {
    if (!this.auth.isTeacher) return;
    e.detail > 1 && e.target.readOnly && e.preventDefault();
  }

  onDblClick(e: any) {
    if (!this.auth.isTeacher) return;
    e.target.readOnly = false;
    e.target.focus();
  }

  onInput(columnId: number, stId: number, e: any) {
    this.data.updateMark(columnId, stId, e.target.value).subscribe();
  }

  today(): Moment {
    return moment().startOf("date");
  }

  addColumn(e: any) {
    const date = e.value.unix();
    if (this.columns.find(col => col.date === date)) return;
    this.data.createColumn(this.subject.id, date).subscribe(res => {
        this.columns.push({id: res.columnId, date});
        this.sortColumns();
        this.fixBorders();
      }
    );

  }

  deleteColumn(column: any) {
    this.data.deleteColumn(column.id).subscribe(res => {
      let index = this.columns.findIndex(col => col.id === res.columnId);
      if (index !== -1) {
        this.columns.splice(index, 1);
        this.fixBorders();
      }
    });
  }

  onDatepickerClosed() {
    // @ts-ignore
    if (document.activeElement && document.activeElement.classList.contains("mat-icon-button")) document.activeElement.blur();
  }
}
