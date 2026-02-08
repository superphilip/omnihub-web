import { AbstractControl, ValidationErrors, ValidatorFn, AsyncValidatorFn } from '@angular/forms';
import { Observable, of, timer, map } from 'rxjs';

export function required(message = 'Campo requerido'): ValidatorFn {
  return (control: AbstractControl) =>
    !control.value || (typeof control.value === 'string' && control.value.trim() === '')
      ? { valRequired: { message } }
      : null;
}

export function minWords(count: number, message?: string): ValidatorFn {
  return (control: AbstractControl) => {
    const value = control.value?.toString().trim() || '';
    if (!value) return null;

    const words = value.split(/\s+/).filter((word: string) => word.length > 0);

    const onlyLetters = /^[a-zA-ZÀ-ÿ\u00f1\u00d1\s]+$/.test(value);
    const hasEnoughWords = words.length >= count;

    return (!onlyLetters || !hasEnoughWords)
      ? { minWords: { message: message || `Debes ingresar al menos ${count} palabras` } }
      : null;
  };
}

export function onlyNumbers(minLen: number = 0, message?: string): ValidatorFn {
  return (control: AbstractControl) => {
    const value = control.value?.toString().trim() || '';
    if (!value) return null;

    const isNumeric = /^\d+$/.test(value);
    const hasMinLength = value.length >= minLen;

    if (!isNumeric || !hasMinLength) {
      const defaultMsg = `Solo se permite números (Mínimo ${minLen} dígitos)`;

      return {
        onlyNumbers: {
          message: message || defaultMsg
        }
      };
    }

    return null;
  };
}

export function validAddress(minLen = 10, message?: string): ValidatorFn {
  return (control: AbstractControl) => {
    const value = control.value?.toString().trim() || '';
    if (!value) return null;
    const hasLetters = /[a-zA-ZÀ-ÿ]/.test(value);
    const hasNumbers = /\d/.test(value);
    const hasMinLength = value.length >= minLen;
    const isValid = hasLetters && hasNumbers && hasMinLength;
    return !isValid
      ? { validAddress: { message: message || `Ingresa una dirección válida (Ej: Calle 10 #20-30) (Mínimo ${minLen} caracteres)` } }
      : null;
  };
}

export function roleFormat(message?: string): ValidatorFn {
  return (control: AbstractControl) => {
    const value = control.value || '';
    if (!value) return null;

    // Solo permite letras MAYÚSCULAS y guiones bajos
    // No permite espacios, minúsculas ni otros símbolos
    const isValid = /^[A-Z_]+$/.test(value);

    const defaultMsg = 'El rol debe estar en MAYÚSCULAS y usar guiones bajos (ej. SUPER_ADMIN)';

    return !isValid ? { roleFormat: { message: message || defaultMsg } } : null;
  };
}

export function robustPassword(minLen = 8, message?: string): ValidatorFn {
  return (control: AbstractControl) => {
    const value = control.value || '';
    if (!value) return null;

    const hasUpper = /[A-Z]/.test(value);
    const hasLower = /[a-z]/.test(value);
    const hasNumber = /\d/.test(value);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(value);
    const hasMinLength = value.length >= minLen;

    const isValid = hasUpper && hasLower && hasNumber && hasSpecial && hasMinLength;

    const defaultMsg = `Tu contraseña debe tener al menos ${minLen} caracteres e incluir una mayúscula, un número y un símbolo`;

    return !isValid ? { robustPassword: { message: message || defaultMsg } } : null;
  };
}

export function email(message = 'Email inválido'): ValidatorFn {
  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return (control: AbstractControl) =>
    control.value && !EMAIL_REGEX.test(control.value)
      ? { email: { message } }
      : null;
}

export function minLength(len: number, message?: string): ValidatorFn {
  return (control: AbstractControl) =>
    control.value && control.value.length < len
      ? { minlength: { requiredLength: len, actualLength: (control.value || '').length, message: message || `Mínimo ${len} caracteres` } }
      : null;
}

export function maxLength(len: number, message?: string): ValidatorFn {
  return (control: AbstractControl) =>
    control.value && control.value.length > len
      ? { maxlength: { requiredLength: len, actualLength: (control.value || '').length, message: message || `Máximo ${len} caracteres` } }
      : null;
}
