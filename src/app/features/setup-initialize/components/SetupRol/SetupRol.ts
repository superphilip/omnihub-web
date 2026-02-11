import { ChangeDetectionStrategy, Component, computed, effect, input } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { formatRoleName } from '@core/utils/role.utils';
import { CustomInput } from 'src/app/shared/components/CustomInput/CustomInput';


@Component({
  selector: 'setup-rol',
  imports: [ReactiveFormsModule, CustomInput],
  templateUrl: './SetupRol.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SetupRol {
  formGroup = input.required<FormGroup>();
  controls = computed(() => ({
    roleName: this.formGroup().get('primaryRoleName') as FormControl,
    description: this.formGroup().get('primaryRoleDescription') as FormControl,
  }));
  constructor() {
    effect(() => {
      const nameControl = this.controls().roleName;
      if (!nameControl) return;
      nameControl.valueChanges.subscribe(value => {
        const formatted = formatRoleName(value);
        if (value !== formatted) {
          nameControl.setValue(formatted, { emitEvent: false });
        }
      });
    });
  }
}
