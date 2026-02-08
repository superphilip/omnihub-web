import { Component, signal } from '@angular/core';
import { NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router, RouterOutlet } from '@angular/router';
import { CustomToast } from "@components/CustomToast/CustomToast";


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CustomToast ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('omnihub-app');
  loading = true;
  constructor(private router: Router) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) this.loading = true;
      if (event instanceof NavigationEnd || event instanceof NavigationCancel || event instanceof NavigationError) {
        this.loading = false;
      }
    });
  }
}
