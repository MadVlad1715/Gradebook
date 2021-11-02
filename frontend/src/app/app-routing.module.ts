import { NgModule } from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {LoginComponent} from './components/login/login.component';
import {AuthGuard} from "./auth/auth.guard";
import {MainComponent} from "./components/main/main.component";
import {GroupsComponent} from "./components/groups/groups.component";
import {StudentsComponent} from "./components/students/students.component";
import {TeachersComponent} from "./components/teachers/teachers.component";
import {MarksComponent} from "./components/marks/marks.component";
import {ChooseGroupComponent} from "./components/marks/choose-group/choose-group.component";
import {ChooseSubjectComponent} from "./components/marks/choose-subject/choose-subject.component";

const routes: Routes = [
  {
    path: '', canActivate: [AuthGuard],
    children: [
      {path: '', pathMatch: 'full', redirectTo: 'main'},
      {path: 'main', pathMatch: 'full', component: MainComponent},
      {path: 'marks', pathMatch: 'full', component: ChooseGroupComponent},
      {path: 'marks/:group', pathMatch: 'full', component: ChooseSubjectComponent},
      {path: 'marks/:group/:subject', pathMatch: 'full', component: MarksComponent},
      {path: 'groups', pathMatch: 'full', component: GroupsComponent},
      {path: 'teachers', pathMatch: 'full', component: TeachersComponent},
      {path: 'students', pathMatch: 'full', component: StudentsComponent},
    ]
  },
  { path: 'login', pathMatch: 'full', component: LoginComponent, canActivate: [AuthGuard]},
  { path: '**',   redirectTo: ''},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
