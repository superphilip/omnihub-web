export const formatRoleName = (value: string | null | undefined): string => {
  if (!value) return '';

  return value
    .trimStart()
    .toUpperCase()
    .replace(/\s+/g, '_');
};
