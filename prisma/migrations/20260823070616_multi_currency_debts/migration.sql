-- AlterTable
ALTER TABLE "payable_obligations" ADD COLUMN     "moneda" TEXT NOT NULL DEFAULT 'PEN',
ADD COLUMN     "tipoCambio" DOUBLE PRECISION NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "receivable_debts" ADD COLUMN     "moneda" TEXT NOT NULL DEFAULT 'PEN',
ADD COLUMN     "tipoCambio" DOUBLE PRECISION NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "settings" ADD COLUMN     "tipoCambioUpdatedAt" TIMESTAMP(3),
ADD COLUMN     "tipoCambioUsdPen" DOUBLE PRECISION;
