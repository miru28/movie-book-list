import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import {
  strongPassword,
  matchPassword,
} from '../../../shared/validators/password.validators';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';

@Component({
  standalone: true,
  selector: 'app-register',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  form = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, strongPassword]],
    confirmPassword: ['', [Validators.required]],
  });

  ngOnInit() {
    this.form.get('confirmPassword')?.addValidators(matchPassword('password'));
    this.form
      .get('password')
      ?.valueChanges.subscribe(() =>
        this.form
          .get('confirmPassword')
          ?.updateValueAndValidity({ onlySelf: true }),
      );
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { email, password, firstName, lastName } = this.form.value as any;
    this.auth.register(email, password, firstName, lastName).subscribe({
      next: () => this.router.navigateByUrl('/library'),
    });
  }
}
