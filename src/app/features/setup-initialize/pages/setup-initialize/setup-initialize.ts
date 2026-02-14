import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { useSetupInitializeMutation } from '../../services/setup-initialize.api';
import { SetupInitializePayload } from '../../interfaces/setup-initialize';
import { CommonModule } from '@angular/common';

import { SetupHeader } from "../../components/SetupHeader/SetupHeader";

import { SetupRol } from "../../components/SetupRol/SetupRol";
import { SetupAdmin } from "../../components/SetupAdmin/SetupAdmin";
import { email, minLength, required, minWords, onlyNumbers, validAddress, robustPassword,} from '@core/utils/validation.utils';
import { SetupCompany } from '../../components/SetupHeader/SetupCompany/SetupCompany';
import { normalizeBackendErrors } from '@core/utils/error.utils';
import { Router } from '@angular/router';
import { CustomToast } from "@components/CustomToast/CustomToast";
import { ToastService } from '@core/services/Toast.service';

@Component({
  selector: 'app-setup-initialize',
  imports: [ReactiveFormsModule, CommonModule, SetupHeader, SetupCompany, SetupRol, SetupAdmin, CustomToast],
  templateUrl: './setup-initialize.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SetupInitialize {
  private toast = inject(ToastService);
  private router = inject(Router);
  fb = new FormBuilder();
  form = this.fb.group({
    companyName: ['', required()],
    companyEmail: ['', [required(), email()]],
    companyPhone: ['', [required(), onlyNumbers(6, 'El teléfono debe contener solo números y tener al menos 6 dígitos')]],
    companyAddress: ['', [required(), validAddress(10)]],
    primaryRoleName: ['', [required()]],
    primaryRoleDescription: ['', required()],
    adminFirstName: ['', [required(), minWords(2, 'Ingresa al menos dos nombres')]],
    adminLastName: ['', [required(), minWords(2, 'Ingresa al menos dos apellidos')]],
    adminIdNumber: ['', [required(), onlyNumbers(10, 'El número de identificación debe contener solo números y tener al menos 10 dígitos')]],
    adminUserName: ['', [required(), minLength(5)]],
    adminEmail: ['', [required(), email()]],
    adminPassword: ['', [required(), robustPassword(8)]],
    adminPhone: ['', [required(), onlyNumbers(10, 'El teléfono debe contener solo números y tener al menos 10 dígitos')]],
  });

  setupMutation = useSetupInitializeMutation();
  isSuccess = signal(false);

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toast.show('Por favor, revisa los campos marcados en rojo', 'error');
      return;
    }

    const payload = this.form.getRawValue() as SetupInitializePayload;

    this.setupMutation.mutate(payload, {
      onSuccess: () => {
        this.isSuccess.set(true);
        this.toast.show('¡Sistema inicializado! Redirigiendo...', 'success');
        setTimeout(() => this.router.navigate(['/auth/login'], { replaceUrl: true }), 3100);
      },
      onError: (err: unknown) => {
        const errorBody = (err && typeof err === 'object' && 'error' in err) ? (err as { error: unknown }).error : err;
        const normalized = normalizeBackendErrors(errorBody);

        let errorMessage = normalized['general']?.[0];
        if (!errorMessage) {
          const firstField = Object.keys(normalized).find(f => f !== 'general' && normalized[f]?.[0]);
          if (firstField) errorMessage = normalized[firstField][0];
        }
        if (!errorMessage) errorMessage = 'Error en la validación';

        this.toast.show(errorMessage, 'error');

        Object.entries(normalized).forEach(([field, messages]) => {
          if (field === 'general') return;
          const control = this.form.get(field);
          if (control) {
            control.setErrors(null);
            control.setErrors({ backend: messages[0] }); // TIP: solo el primero
            control.markAsTouched();
          }
        });
      }
    });
  }
}
