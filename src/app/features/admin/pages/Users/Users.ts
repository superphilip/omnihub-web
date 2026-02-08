import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-users',
  imports: [],
  templateUrl: './Users.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class Users { }
