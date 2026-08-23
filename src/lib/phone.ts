/**
 * Normaliza cualquier forma en que se escriba un teléfono ("980 514 426",
 * "980-514-426", "+51980514426"...) a un solo formato de almacenamiento:
 * +<código país><número>, sin espacios ni separadores.
 *
 * Para celulares peruanos (9 dígitos, empiezan en 9) sin código de país,
 * se asume Perú y se antepone +51 — es el caso real de este app. Números
 * que ya traen su propio código de país se respetan tal cual.
 */
export function normalizePhoneNumber(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return '';

  const digits = trimmed.replace(/\D/g, '');
  if (!digits) return trimmed;

  if (digits.length === 9 && digits.startsWith('9')) {
    return `+51${digits}`;
  }

  return `+${digits}`;
}

/**
 * Formato de lectura: "+51 980 514 426". Si no reconoce el patrón
 * (número de otro país, longitud rara), muestra el valor tal cual está
 * guardado en vez de inventar una agrupación incorrecta.
 */
export function formatPhoneDisplay(phone?: string | null): string {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 11 && digits.startsWith('51')) {
    const rest = digits.slice(2);
    return `+51 ${rest.slice(0, 3)} ${rest.slice(3, 6)} ${rest.slice(6)}`;
  }
  return phone;
}
