import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CustomInput } from '@components/CustomInput/CustomInput';


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
}
