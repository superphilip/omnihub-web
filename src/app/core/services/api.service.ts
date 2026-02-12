import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl.replace(/\/+$/, '');

  private url(path: string): string {
    const p = path.replace(/^\/+/, '');
    return `${this.baseUrl}/${p}`;
  }

  get<T>(
  path: string,
  query?: Record<string, string | number | boolean>,
  options?: { headers?: Record<string, string> }
) {
  let params = new HttpParams();
  if (query) {
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') params = params.set(k, String(v));
    });
  }
  // Tipado explícito
  const httpOptions: {
    params: HttpParams;
    headers?: HttpHeaders;
  } = {
    params,
    ...(options?.headers ? { headers: new HttpHeaders(options.headers) } : {})
  };

  return this.http.get<T>(this.url(path), httpOptions);
}

  post<T>(
  path: string,
  body?: unknown,
  query?: Record<string, string | number | boolean>,
  options?: { headers?: Record<string, string> }
) {
  let params = new HttpParams();
  if (query) {
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') params = params.set(k, String(v));
    });
  }
  const httpOptions: { params: HttpParams; headers?: HttpHeaders } = { params };
  if (options?.headers) {
    httpOptions.headers = new HttpHeaders(options.headers);
  }
  // NO poner observe aquí
  return this.http.post<T>(this.url(path), body ?? {}, httpOptions);
}

  put<T>(
    path: string,
    body?: unknown,
    options?: { headers?: Record<string, string> }
  ) {
    let httpOptions: any = {};
    if (options?.headers) {
      httpOptions.headers = new HttpHeaders(options.headers);
    }
    return this.http.put<T>(this.url(path), body ?? {}, httpOptions);
  }

  delete<T>(
    path: string,
    options?: { headers?: Record<string, string> }
  ) {
    let httpOptions: any = {};
    if (options?.headers) {
      httpOptions.headers = new HttpHeaders(options.headers);
    }
    return this.http.delete<T>(this.url(path), httpOptions);
  }
}
