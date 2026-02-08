export interface ZodIssue {
  path: string[] | string;
  message: string;
}

export interface NormalizedErrors {
  [field: string]: string[];
}

function hasZodErrorsArray(e: unknown): e is { errors: ZodIssue[] } {
  return (
    typeof e === 'object' &&
    e !== null &&
    'errors' in e &&
    Array.isArray((e as { errors?: unknown }).errors) &&
    (
      ((e as { errors?: unknown }).errors as unknown[]).length === 0 ||
      ((e as { errors?: unknown }).errors as unknown[]).every(
        issue =>
          typeof issue === 'object' &&
          issue !== null &&
          'message' in issue &&
          'path' in issue
      )
    )
  );
}

function isObj(val: unknown): val is Record<string, unknown> {
  return typeof val === 'object' && val !== null;
}

function flatten(val: unknown): string[] {
  if (Array.isArray(val)) {
    return val.flatMap(flatten);
  }
  if (isObj(val)) {
    return Object.values(val).flatMap(flatten);
  }
  return val !== undefined && val !== null ? [String(val)] : [];
}


export function normalizeBackendErrors(error: unknown): NormalizedErrors {
  const result: NormalizedErrors = {};

  if (hasZodErrorsArray(error)) {
    for (const issue of error.errors) {
      const field =
        typeof issue.path === 'string'
          ? issue.path
          : Array.isArray(issue.path) && typeof issue.path[0] === 'string'
          ? issue.path[0]
          : 'general';
      if (!result[field]) result[field] = [];
      result[field].push(issue.message);
    }
    return result;
  }

  if (typeof error === 'string') {
    result['general'] = [error];
    return result;
  }

  if (Array.isArray(error)) {
    error.forEach((item) => {
      if (!isObj(item)) return;
      const field =
        (typeof item['field'] === 'string' && item['field']) ||
        (typeof item['key'] === 'string' && item['key']) ||
        'general';
      let value: unknown;
      if ('message' in item && item['message'] !== undefined) value = item['message'];
      else if ('code' in item && item['code'] !== undefined) value = item['code'];
      else if ('errors' in item && item['errors'] !== undefined) value = item['errors'];
      else if ('detail' in item && item['detail'] !== undefined) value = item['detail'];
      else value = item;
      const messages = flatten(value);
      if (!result[field]) result[field] = [];
      result[field].push(...messages);
    });
    return result;
  }

  if (isObj(error)) {
  Object.entries(error).forEach(([field, val]) => {
    let messages = flatten(val);
    messages = messages.filter(msg => typeof msg === 'string' && msg.trim() && msg !== 'false' && msg !== 'undefined');
    if (messages.length) {
      result[field] = messages;
    }
  });
  return result;
}

  result['general'] = ['Error desconocido'];
  return result;
}
