import { ChangeDetectionStrategy, Component, computed, effect, input, output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Role } from '../../interfaces/Roles';
import { CustomInput } from "@components/CustomInput/CustomInput";
import { formatRoleName } from 'src/app/utils/role.utils';

@Component({
  selector: 'role-form',
  imports: [ReactiveFormsModule,CustomInput],
  templateUrl: './RoleForm.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoleForm {
  // Inputs (igual patrón que SetupAdmin / SetupRol)
  formGroup = input.required<FormGroup>();
  pending = input<boolean>(false);

  // Outputs con API de signals
  submitForm = output<Role>();
  cancel = output<void>();

  controls = computed(() => ({
    name: this.formGroup().get('name') as FormControl,
    description: this.formGroup().get('description') as FormControl,
    isSystemRole: this.formGroup().get('isSystemRole') as FormControl,
  }));

  constructor() {
    effect(() => {
      const nameCtrl = this.controls().name;

      nameCtrl.valueChanges.subscribe(value => {
        const formatted = formatRoleName(value); // <--- Usamos la utilidad aquí

        if (value !== formatted) {
          nameCtrl.setValue(formatted, { emitEvent: false });
        }
      });
    });
  }

  onSubmit() {
    const form = this.formGroup();
    if (form.invalid) {
      form.markAllAsTouched();
      return;
    }

    const rawValue = form.getRawValue();
    const roleData: Role = {
      ...rawValue,
      name: rawValue.name.trim()
    };

    this.submitForm.emit(roleData);
  }
}
