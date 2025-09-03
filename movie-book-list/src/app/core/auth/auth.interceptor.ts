import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const isAuthEndpoint =
    req.url.includes('/login') || req.url.includes('/register');

  let isReqres = false;
  try {
    const base =
      typeof window !== 'undefined'
        ? window.location.origin
        : 'http://localhost';
    const u = new URL(req.url, base);

    isReqres = u.hostname === 'reqres.in';
  } catch {
    isReqres = false;
  }

  const setHeaders: Record<string, string> = {};

  if (isReqres) {
    const apiKey = (
      (import.meta as any)?.env?.NG_APP_REQRES_API_KEY || ''
    ).trim();
    if (apiKey) setHeaders['x-api-key'] = apiKey;
  }

  if (!isAuthEndpoint) {
    const token =
      localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) setHeaders['Authorization'] = `Bearer ${token}`;
  }

  return Object.keys(setHeaders).length
    ? next(req.clone({ setHeaders }))
    : next(req);
};
