import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-root',
  imports: [],
  templateUrl: './Root.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Root { }
