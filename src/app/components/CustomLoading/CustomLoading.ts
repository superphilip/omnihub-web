import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'custom-loading',
  imports: [],
  templateUrl: './CustomLoading.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomLoading {
  message = input<string>('Cargando...');
}
