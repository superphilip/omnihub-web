import { Component, signal } from '@angular/core';
import { NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router, RouterOutlet } from '@angular/router';
import { CustomToast } from './shared/components/CustomToast/CustomToast';



@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CustomToast ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('omnihub-app');
}
