-- AlterTable
ALTER TABLE "people" ADD COLUMN     "lastReminderAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "settings" ADD COLUMN     "metodoPagoLabel" TEXT,
ADD COLUMN     "metodoPagoValor" TEXT;
