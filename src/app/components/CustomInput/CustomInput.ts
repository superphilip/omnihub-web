import { CommonModule} from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, input, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'custom-input',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './CustomInput.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomInput<T = string> {
  label = input.required<string>();
  type = input<string>('text');
  control = input.required<FormControl<T>>();
  placeholder = input<string>();
  hint = input<string>();
  required = input<boolean>(true);
  pattern = input<string>();
  minlength = input<number>();
  maxlength = input<number>();
  title = input<string>();
  showIcon = input<boolean>(false);

  objectKeys = Object.keys;

  controlSignal = computed(() => this.control());


}
