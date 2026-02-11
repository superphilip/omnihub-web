import { FormGroup } from '@angular/forms';
import { NormalizedErrors } from './error.utils'; // asume que tienes tus types

export function handleNormalizedErrors(
  normalized: NormalizedErrors,
  form: FormGroup,
  showToast: (msg: string) => void
) {
  // Decide el mensaje a mostrar en un solo lugar
  let errorMessage = normalized['general']?.[0] ?? undefined;
  if (!errorMessage) {
    const firstField = Object.keys(normalized).find(f => f !== 'general' && normalized[f]?.[0]);
    if (firstField) errorMessage = normalized[firstField]?.[0];
  }

  // SÓLIDO: Si el mensaje no es string o es vacío o es boolean, fallback
  if (typeof errorMessage !== 'string' || !errorMessage.trim() || errorMessage === 'false' || errorMessage === 'undefined') {
    errorMessage = 'Error en la validación';
  }

  showToast(errorMessage);

  // Marca errores a controles reactivos
  Object.entries(normalized).forEach(([field, messages]) => {
    if (field === 'general') return;
    const control = form.get(field);
    if (control) {
      control.setErrors(null); // Limpia los previos
      control.setErrors({ backend: messages[0] });
      control.markAsTouched();
    }
  });
}
