import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { generateRandomUsername } from '@core/utils/userName.utils';
import { CustomInput } from 'src/app/shared/components/CustomInput/CustomInput';


@Component({
  selector: 'setup-admin',
  imports: [ReactiveFormsModule, CustomInput],
  templateUrl: './SetupAdmin.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SetupAdmin {
  formGroup = input.required<FormGroup>();

  controls = computed(() => ({
    firstName: this.formGroup().get('adminFirstName') as FormControl,
    lastName: this.formGroup().get('adminLastName') as FormControl,
    idNumber: this.formGroup().get('adminIdNumber') as FormControl,
    userName: this.formGroup().get('adminUserName') as FormControl,
    email: this.formGroup().get('adminEmail') as FormControl,
    phone: this.formGroup().get('adminPhone') as FormControl,
    password: this.formGroup().get('adminPassword') as FormControl,
  }));

  generateUserName() {
    // asigna el username generado al FormControl del usuario
    this.controls().userName.setValue(generateRandomUsername());
    this.controls().userName.markAsDirty();
    this.controls().userName.markAsTouched();
  }
}
