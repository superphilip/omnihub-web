import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

export interface SimpleColumn {
  key: string;
  label: string;
}

@Component({
  selector: 'custom-columns-visible',
  imports: [],
  templateUrl: './CustomColumnsVisible.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomColumnsVisible {
  columns = input<readonly SimpleColumn[]>([]);
  hidden = input<ReadonlySet<string>>(new Set());

  toggle = output<string>();
  showAll = output<void>();
  hideAll = output<void>();
}
