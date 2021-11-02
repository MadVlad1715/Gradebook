import {AfterViewInit, Component, OnInit} from '@angular/core';
import {Router} from "@angular/router";
import {MatDialog} from "@angular/material/dialog";
import {LogoutComponent} from "../logout/logout.component";
import {AuthService} from "../../auth/auth.service";

@Component({
  selector: 'app-navigation',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements AfterViewInit {

  constructor(public auth: AuthService, private router: Router, private dialog: MatDialog) { }

  ngAfterViewInit() {
    document.addEventListener("click", this.hideNav);

    const nav = document.querySelector(".header nav");
    const mq = window.matchMedia("(max-width: 1000px)");
    mq.matches && nav?.classList.add('transition');
    mq.addEventListener('change', (e: any) => {
      e.matches ? nav?.classList.add('transition') : nav?.classList.remove('transition');
    });
  }

  showLogoutDialog(): void {
    const dialogRef = this.dialog.open(LogoutComponent);
    dialogRef.afterClosed().subscribe(result => {
      if (result) this.auth.logout(result.logoutFromAll);
    });
  }

  get showNavigation(): boolean {
    return this.auth.isAuth && this.router.url !== '/login';
  }

  menuBtnClick() {
    document.querySelector("nav")?.classList.toggle("show");
  }

  hideNav() {
    document.querySelector('nav')?.classList.remove('show');
  }
}
