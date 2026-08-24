-- AlterTable
ALTER TABLE "settings" ADD COLUMN     "msgDebtTemplate" TEXT,
ADD COLUMN     "msgRentalDueTodayTemplate" TEXT,
ADD COLUMN     "msgRentalDueTomorrowTemplate" TEXT,
ADD COLUMN     "msgRentalReminderTemplate" TEXT;
