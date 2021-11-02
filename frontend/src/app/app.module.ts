import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LoginComponent } from './components/login/login.component';
import {MatCardModule} from "@angular/material/card";
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatButtonModule} from "@angular/material/button";
import {HttpClientModule} from "@angular/common/http";
import {HeaderComponent} from './components/header/header.component';
import {MatToolbarModule} from "@angular/material/toolbar";
import {MatIconModule} from "@angular/material/icon";
import {MatProgressBarModule} from "@angular/material/progress-bar";
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import {LogoutComponent} from './components/logout/logout.component';
import {MatDialogModule} from "@angular/material/dialog";
import {MatCheckboxModule} from "@angular/material/checkbox";
import { MainComponent } from './components/main/main.component';
import { GroupsComponent } from './components/groups/groups.component';
import {MatTableModule} from "@angular/material/table";
import {DatePipe} from "@angular/common";
import {MatSortModule} from "@angular/material/sort";
import { GroupDeleteComponent } from './components/groups/group-delete/group-delete.component';
import {MatPaginatorIntl, MatPaginatorModule} from "@angular/material/paginator";
import { GroupCreateComponent } from './components/groups/group-create/group-create.component';
import {MatAutocompleteModule} from "@angular/material/autocomplete";
import { StudentsComponent } from './components/students/students.component';
import { StudentDeleteComponent } from './components/students/student-delete/student-delete.component';
import { StudentCreateComponent } from './components/students/student-create/student-create.component';
import { TeachersComponent } from './components/teachers/teachers.component';
import { TeacherDeleteComponent } from './components/teachers/teacher-delete/teacher-delete.component';
import { TeacherCreateComponent } from './components/teachers/teacher-create/teacher-create.component';
import {AnotherDateFormat, MarksComponent} from './components/marks/marks.component';
import { MatDatepickerModule} from "@angular/material/datepicker";
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
  MatNativeDateModule,
} from "@angular/material/core";
import {MomentDateAdapter} from "@angular/material-moment-adapter";
import { ChooseGroupComponent } from './components/marks/choose-group/choose-group.component';
import { HoverDirective } from './directives/hover.directive';
import { ChooseSubjectComponent } from './components/marks/choose-subject/choose-subject.component';
import { CreateSubjectComponent } from './components/marks/choose-subject/create-subject/create-subject.component';
import { DeleteSubjectComponent } from './components/marks/choose-subject/delete-subject/delete-subject.component';
import { EditSubjectComponent } from './components/marks/choose-subject/edit-subject/edit-subject.component';
import { EditProfileComponent } from './components/main/edit-profile/edit-profile.component';
import { TeacherEditComponent } from './components/teachers/teacher-edit/teacher-edit.component';
import { GroupEditComponent } from './components/groups/group-edit/group-edit.component';
import { StudentEditComponent } from './components/students/student-edit/student-edit.component';
import {AuthService} from "./auth/auth.service";
import {DataService} from "./data/data.service";
import {getUkPaginatorIntl} from "./uk-paginator-intl";

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    HeaderComponent,
    LogoutComponent,
    MainComponent,
    GroupsComponent,
    GroupDeleteComponent,
    GroupCreateComponent,
    StudentsComponent,
    StudentDeleteComponent,
    StudentCreateComponent,
    TeachersComponent,
    TeacherDeleteComponent,
    TeacherCreateComponent,
    MarksComponent,
    AnotherDateFormat,
    ChooseGroupComponent,
    HoverDirective,
    ChooseSubjectComponent,
    CreateSubjectComponent,
    DeleteSubjectComponent,
    EditSubjectComponent,
    EditProfileComponent,
    TeacherEditComponent,
    GroupEditComponent,
    StudentEditComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatToolbarModule,
    MatIconModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatCheckboxModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatAutocompleteModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  providers: [
    AuthService,
    DataService,
    DatePipe,
    { provide: MatPaginatorIntl, useValue: getUkPaginatorIntl() },
    {provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE]},
    {provide: MAT_DATE_LOCALE, useValue: 'uk'},
    {
      provide: MAT_DATE_FORMATS, useValue: {
        parse: {
          dateInput: 'LL',
        },
        display: {
          dateInput: 'DD.MM',
          monthYearLabel: 'MMMM YYYY',
          dateA11yLabel: 'DD.MM',
          monthYearA11yLabel: 'MMMM YYYY',
        },
      }
    },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
