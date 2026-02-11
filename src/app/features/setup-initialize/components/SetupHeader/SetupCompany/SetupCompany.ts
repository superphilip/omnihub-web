import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CustomInput } from 'src/app/shared/components/CustomInput/CustomInput';


@Component({
  selector: 'setup-company',
  imports: [CustomInput, ReactiveFormsModule],
  templateUrl: './SetupCompany.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SetupCompany {
  formGroup = input.required<FormGroup>();
  controls = computed(() => ({
    name: this.formGroup().get('companyName') as FormControl,
    email: this.formGroup().get('companyEmail') as FormControl,
    phone: this.formGroup().get('companyPhone') as FormControl,
    address: this.formGroup().get('companyAddress') as FormControl,
  }));
}
