export enum AccountType {
  CASH = 'cash',
  BANK = 'bank',
  WALLET = 'wallet',
  SAFE_BOX = 'safe_box',
  CREDIT_CARD = 'credit_card',
}

export const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  [AccountType.CASH]: 'Efectivo',
  [AccountType.BANK]: 'Banco',
  [AccountType.WALLET]: 'Billetera Digital',
  [AccountType.SAFE_BOX]: 'Caja Fuerte',
  [AccountType.CREDIT_CARD]: 'Tarjeta de Crédito',
};
