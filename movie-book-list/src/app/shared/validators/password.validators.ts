import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const strongPassword: ValidatorFn = (
  control: AbstractControl,
): ValidationErrors | null => {
  const v = String(control.value || '');
  const ok =
    v.length >= 6 &&
    /[A-Z]/.test(v) &&
    /[a-z]/.test(v) &&
    /\d/.test(v) &&
    /[^A-Za-z0-9]/.test(v);
  return ok ? null : { strongPassword: true };
};

export const matchPassword = (otherControlName: string): ValidatorFn => {
  return (control: AbstractControl): ValidationErrors | null => {
    const parent = control.parent as any;
    if (!parent) return null;
    const other = parent.get(otherControlName);
    return control.value === other?.value ? null : { passwordMismatch: true };
  };
};
