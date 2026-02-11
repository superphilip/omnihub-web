import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl.replace(/\/+$/, '');

  private url(path: string): string {
    const p = path.replace(/^\/+/, '');
    return `${this.baseUrl}/${p}`;
  }

  get<T>(path: string, query?: Record<string, string | number | boolean>) {
    let params = new HttpParams();
    if (query) {
      Object.entries(query).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') params = params.set(k, String(v));
      });
    }
    return this.http.get<T>(this.url(path), { params });
  }

  post<T>(path: string, body?: unknown, query?: Record<string, string | number | boolean>) {
    let params = new HttpParams();
    if (query) {
      Object.entries(query).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') params = params.set(k, String(v));
      });
    }
    return this.http.post<T>(this.url(path), body ?? {}, { params });
  }

  put<T>(path: string, body?: unknown) {
    return this.http.put<T>(this.url(path), body ?? {});
  }

  delete<T>(path: string) {
    return this.http.delete<T>(this.url(path));
  }
}
