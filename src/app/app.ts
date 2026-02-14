import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CustomToast } from "@components/CustomToast/CustomToast";


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CustomToast ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('omnihub-app');
}
