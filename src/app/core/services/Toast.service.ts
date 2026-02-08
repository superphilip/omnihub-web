import { Injectable, signal } from '@angular/core';

export interface ToastMessage {
  text: string;
  type: 'success' | 'error';
  id: number;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  toasts = signal<ToastMessage[]>([]);

  show(text: string, type: 'success' | 'error' = 'success', duration = 3000) {
    const id = Date.now() + Math.random();
    this.toasts.update(arr => [...arr, { text, type, id }]);
    setTimeout(() => {
      this.toasts.update(arr => arr.filter(t => t.id !== id));
    }, duration);
  }

  close(id: number) {
    this.toasts.update(arr => arr.filter(t => t.id !== id));
  }
}
