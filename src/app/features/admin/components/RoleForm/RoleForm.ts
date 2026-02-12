import { ChangeDetectionStrategy, Component, computed, effect, input, output, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CreateRole, Role } from '../../interfaces/Roles';
import { CustomInput } from "@components/CustomInput/CustomInput";
import { formatRoleName } from 'src/app/utils/role.utils';
import { normalizeBackendErrors } from 'src/app/utils/error.utils';
import { handleNormalizedErrors } from 'src/app/utils/formError.utils';

@Component({
  selector: 'role-form',
  imports: [ReactiveFormsModule, CustomInput],
  templateUrl: './RoleForm.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoleForm {

  formGroup = input.required<FormGroup>();
  mutationFn = input.required<
    (payload: CreateRole, opts: {
      onSuccess?: () => void;
      onError?: (err: unknown) => void;
    }) => unknown
  >();

  // --- Outputs ---
  success = output<void>();
  cancel = output<void>();

  // Inputs (igual patrón que SetupAdmin / SetupRol)
  pending = signal<boolean>(false);

  successMsg = signal('');
  errorMsg = signal('');

  // Outputs con API de signals
  submitForm = output<Role>();

  controls = computed(() => ({
    name: this.formGroup().get('name') as FormControl,
    description: this.formGroup().get('description') as FormControl,
    isSystemRole: this.formGroup().get('isSystemRole') as FormControl,
  }));

  constructor() {
    // Formatea el nombre en vivo
    effect(() => {
      const nameCtrl = this.controls().name;
      nameCtrl.valueChanges.subscribe(value => {
        const formatted = formatRoleName(value ?? '');
        if (value !== formatted) {
          nameCtrl.setValue(formatted, { emitEvent: false });
        }
      });
    });
  }

  onSubmit() {
    const form = this.formGroup();
    this.errorMsg.set('');
    this.successMsg.set('');
    if (form.invalid) {
      form.markAllAsTouched();
      return;
    }

    this.pending.set(true);

    // Payload tipado para creación
    const payload: CreateRole = {
      name: form.value.name?.trim() ?? '',
      description: form.value.description,
      isSystemRole: form.value.isSystemRole,
    };

    this.mutationFn()(payload, {
      onSuccess: () => {
        this.pending.set(false);
        this.successMsg.set('Rol creado correctamente');
        form.reset({ name: '', description: '', isSystemRole: false });
        this.success.emit();
        setTimeout(() => this.successMsg.set(''), 2000);
      },
      onError: (err: unknown) => {
        this.pending.set(false);
        // Normaliza y visualiza errores con tus utilities
        const errorBody = err && typeof err === 'object' && 'error' in err
          ? (err as { error: unknown }).error
          : err;
        const normalized = normalizeBackendErrors(errorBody);
        handleNormalizedErrors(normalized, form, msg => {
          this.errorMsg.set(msg);
        });
        this.successMsg.set('');
      }
    });
  }
}
