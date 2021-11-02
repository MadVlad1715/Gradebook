import { Component } from '@angular/core';
import {AuthService} from "./auth/auth.service";
import {Router} from "@angular/router";
import {MatIconRegistry} from "@angular/material/icon";
import {DomSanitizer} from "@angular/platform-browser";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent {
  private icons: string[] = [
    'delete', 'clear', 'settings', 'edit', 'login',
    'password', 'user', 'label', 'teacher', 'search',
    'group_add', 'user_add', 'book', 'add', 'home',
    'students', 'groups', 'logout', 'menu'];

  constructor(public auth: AuthService,
              private iconRegistry: MatIconRegistry,
              private sanitizer: DomSanitizer) {
    this.icons.forEach(
      name => iconRegistry.addSvgIcon(name, sanitizer.bypassSecurityTrustResourceUrl(`./assets/icons/${name}.svg`))
    );
  }
}
