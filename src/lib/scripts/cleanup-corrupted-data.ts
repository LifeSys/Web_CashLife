/**
 * Con Firestore (sin schema) los documentos podían quedar con campos
 * `undefined`/`NaN`, así que este script los reparaba en cada login.
 * Con Postgres + Prisma el propio schema tipa cada columna al escribir,
 * así que esa clase de corrupción ya no puede ocurrir: se deja como
 * no-op para no tener que tocar quien la llama (AuthProvider).
 */
export async function cleanupUserData(_uid: string): Promise<{
  transactionsFixed: number;
  accountsFixed: number;
  categoriesFixed: number;
}> {
  return { transactionsFixed: 0, accountsFixed: 0, categoriesFixed: 0 };
}
