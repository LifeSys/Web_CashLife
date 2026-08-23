-- CreateTable
CREATE TABLE "scheduled_payment_splits" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "scheduledPaymentId" TEXT NOT NULL,
    "personId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "scheduled_payment_splits_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "scheduled_payment_splits_userId_idx" ON "scheduled_payment_splits"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "scheduled_payment_splits_scheduledPaymentId_personId_key" ON "scheduled_payment_splits"("scheduledPaymentId", "personId");

-- AddForeignKey
ALTER TABLE "scheduled_payment_splits" ADD CONSTRAINT "scheduled_payment_splits_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scheduled_payment_splits" ADD CONSTRAINT "scheduled_payment_splits_scheduledPaymentId_fkey" FOREIGN KEY ("scheduledPaymentId") REFERENCES "scheduled_payments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
