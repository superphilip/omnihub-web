import { uniqueNamesGenerator, adjectives, colors, animals } from 'unique-names-generator';

export function generateRandomUsername(): string {
  const base = uniqueNamesGenerator({
    dictionaries: [animals],
    style: 'upperCase', // Opcional: convierte a mayúsculas
    length: 1, // Usa dos palabras: un adjetivo y un animal
    separator: ''
  });
  // Agrega un número aleatorio (opcional)
  const numSuffix = Math.floor(Math.random() * 100);
  return `${base}${numSuffix}`;
}
