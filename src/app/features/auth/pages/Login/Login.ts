import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoginRequest } from '../../interfaces/Login';
import { LoginService } from '../../services/Login.service';
import { normalizeBackendErrors } from 'src/app/utils/error.utils';
import { handleNormalizedErrors } from 'src/app/utils/formError.utils';
import { CustomInput } from "@components/CustomInput/CustomInput";
import { CustomToast } from "@components/CustomToast/CustomToast";
import { email, required } from 'src/app/utils/validation.utils';
import { ToastService } from '@core/services/Toast.service';

@Component({
  selector: 'app-login',
  imports: [CustomInput, ReactiveFormsModule, CustomToast],
  templateUrl: './Login.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class Login {
  login = inject(LoginService);
  toast = inject(ToastService);
  private router = inject(Router);

  fb = new FormBuilder();
  form = this.fb.group({
    userName: ['', [required()]],
    password: ['', required()]
  });

  errors = signal<Record<string, string[]>>({});
  controls = computed(() => ({
    userName: this.form.get('userName') as FormControl,
    password: this.form.get('password') as FormControl,
  }));

  onSubmit() {
    this.errors.set({});
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toast.show('Por favor completa los campos marcados en rojo', 'error');
      return;
    }

    const payload = this.form.getRawValue() as LoginRequest;
    this.login.loginMutation.mutate(payload, {
      onSuccess: () => {
        this.router.navigate(['/admin'], { replaceUrl: true });
      },
      onError: (err: unknown) => {
        // Procesa el error con la utilidad
        const errorBody = err && typeof err === 'object' && 'error' in err ? (err as { error: unknown }).error : err;
        const normalized = normalizeBackendErrors(errorBody);

        // Función genérica para setear errores y toast
        handleNormalizedErrors(normalized, this.form, msg => this.toast.show(msg, 'error'));
        this.errors.set(normalized);
      }
    });
  }
}
