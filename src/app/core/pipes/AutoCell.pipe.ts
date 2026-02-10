import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'autoCell'
})
export class AutoCellPipe implements PipeTransform {
  transform(value: any, key?: string): any {
    // Badge para boolean
    if (typeof value === 'boolean') {
      return value ? '✅ Sí' : '❌ No';
    }

    // Para strings: primero manejos específicos
    if (typeof value === 'string') {
      const v = value;

      // Acorta IDs largos (cuando el key sugiere que es un ID)
      if (key && key.toLowerCase().includes('id') && v.length > 8) {
        return v.slice(0, 8) + '...';
      }

      // Convierte CONSTANTES en MAYÚSCULAS con guión bajo -> Title Case con espacios
      // SUPER_ADMIN -> "Super Admin"
      if (/^[A-Z_]+$/.test(v)) {
        return v
          .split('_')
          .filter(Boolean)
          .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
          .join(' ');
      }

      // Formatea fecha en string (YYYY-MM-DD o YYYY/MM/DD)
      if (/\d{4}[-\/]\d{2}[-\/]\d{2}/.test(v)) {
        const date = new Date(v);
        if (!isNaN(date.getTime())) {
          const y = date.getFullYear();
          const m = String(date.getMonth() + 1).padStart(2, '0');
          const d = String(date.getDate()).padStart(2, '0');
          return `${y}/${m}/${d}`;
        }
      }
    }

    // Timestamps numéricos (ms) o Date objeto
    if (value instanceof Date || (typeof value === 'number' && value > 100000000000)) {
      const date = typeof value === 'number' ? new Date(value) : value;
      if (!isNaN(date.getTime())) {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}/${m}/${d}`;
      }
    }

    // Resto: valor tal cual
    return value;
  }
}
