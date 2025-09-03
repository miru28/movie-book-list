import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, tap, throwError, of } from 'rxjs';

type User = { email: string; firstName?: string; lastName?: string };
type LocalUser = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
};

const API_URL: string = 'https://reqres.in/api';

@Injectable({ providedIn: 'root' })
export class AuthService {
  token = signal<string | null>(
    localStorage.getItem('token') || sessionStorage.getItem('token'),
  );
  user = signal<User | null>(null);

  private readLocalUsers(): LocalUser[] {
    try {
      return JSON.parse(localStorage.getItem('demo_users') || '[]');
    } catch {
      return [];
    }
  }

  private writeLocalUsers(users: LocalUser[]) {
    localStorage.setItem('demo_users', JSON.stringify(users));
  }

  private saveLocalUser(u: LocalUser) {
    const all = this.readLocalUsers();
    const idx = all.findIndex((x) => x.email === u.email);
    if (idx >= 0) all[idx] = u;
    else all.push(u);
    this.writeLocalUsers(all);
  }

  private findLocalUser(email: string, password: string): LocalUser | null {
    const e = (email ?? '').trim().toLowerCase();
    const p = (password ?? '').trim();
    return (
      this.readLocalUsers().find((u) => u.email === e && u.password === p) ||
      null
    );
  }

  private genToken(prefix = 'local'): string {
    return `${prefix}-${Math.random().toString(36).slice(2)}${Date.now()}`;
  }

  constructor(private http: HttpClient) {
    console.log('[AuthService] API_URL =', API_URL);
  }

  login(email: string, password: string, remember: boolean) {
    const payload = {
      email: (email ?? '').trim().toLowerCase(),
      password: (password ?? '').trim(),
    };

    return this.http
      .post<{ token: string }>(`${API_URL}/login`, payload, {
        headers: { 'x-api-key': 'reqres-free-v1' },
      })
      .pipe(
        tap((res) => {
          const token = res.token;
          this.token.set(token);
          (remember ? localStorage : sessionStorage).setItem('token', token);

          if (!this.user()) {
            this.user.set({
              email: payload.email,
              firstName: '',
              lastName: '',
            });
          }
        }),

        catchError((err) => {
          const local = this.findLocalUser(payload.email, payload.password);
          if (local) {
            const token = this.genToken();
            this.token.set(token);
            (remember ? localStorage : sessionStorage).setItem('token', token);
            this.user.set({
              email: local.email,
              firstName: local.firstName,
              lastName: local.lastName,
            });
            return of({ token });
          }
          const msg = err?.error?.error || err?.message || 'Login failed';
          return throwError(() => new Error(msg));
        }),
      );
  }

  register(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
  ) {
    const payload = {
      email: (email ?? '').trim().toLowerCase(),
      password: (password ?? '').trim(),
    };

    return this.http
      .post<{ id: number; token: string }>(`${API_URL}/register`, payload)
      .pipe(
        tap((res) => {
          this.saveLocalUser({
            email: payload.email,
            password: payload.password,
            firstName,
            lastName,
          });
          this.token.set(res.token);
          localStorage.setItem('token', res.token);
          this.user.set({ email: payload.email, firstName, lastName });
        }),
        catchError(() => {
          this.saveLocalUser({
            email: payload.email,
            password: payload.password,
            firstName,
            lastName,
          });
          const token = this.genToken('reg');
          this.token.set(token);
          localStorage.setItem('token', token);
          this.user.set({ email: payload.email, firstName, lastName });
          return of({ id: 0, token });
        }),
      );
  }

  logout() {
    this.token.set(null);
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
  }

  isLoggedIn() {
    return !!this.token();
  }
}
