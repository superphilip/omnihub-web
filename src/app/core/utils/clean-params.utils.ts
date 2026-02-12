export function cleanParams<T extends Record<string, any>>(params: T): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== '') {
      result[k] = String(v);
    }
  }
  return result;
}
