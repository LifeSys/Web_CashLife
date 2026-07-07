/**
 * Limpia datos antes de escribir en Firestore
 * Elimina campos undefined, NaN, null y campos vacíos
 */
export function cleanFirestoreData(data: any): any {
  if (data === null || data === undefined) {
    return null;
  }

  if (Array.isArray(data)) {
    return data.map(item => cleanFirestoreData(item));
  }

  if (typeof data === 'object' && data.constructor === Object) {
    const cleaned: any = {};
    
    for (const [key, value] of Object.entries(data)) {
      // Skip undefined
      if (value === undefined) {
        continue;
      }

      // Convert NaN to 0
      if (typeof value === 'number' && isNaN(value)) {
        cleaned[key] = 0;
        continue;
      }

      // Recursively clean objects
      if (typeof value === 'object' && value !== null) {
        const cleanedValue = cleanFirestoreData(value);
        if (cleanedValue !== null) {
          cleaned[key] = cleanedValue;
        }
        continue;
      }

      // Keep valid values
      if (value !== null && value !== '') {
        cleaned[key] = value;
      }
    }

    return cleaned;
  }

  return data;
}

/**
 * Valida que un objeto tenga todos los campos requeridos
 */
export function validateRequiredFields(data: any, required: string[]): string[] {
  const missing: string[] = [];
  
  for (const field of required) {
    const value = data[field];
    if (value === undefined || value === null || value === '' || (typeof value === 'number' && isNaN(value))) {
      missing.push(field);
    }
  }

  return missing;
}

/**
 * Valida que un campo sea un número válido
 */
export function isValidNumber(value: any): boolean {
  return typeof value === 'number' && !isNaN(value) && isFinite(value);
}
