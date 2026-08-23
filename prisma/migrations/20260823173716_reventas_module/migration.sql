-- CreateTable
CREATE TABLE "shared_services" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "loginEmail" TEXT,
    "loginPassword" TEXT,
    "scheduledPaymentId" TEXT,
    "color" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "shared_services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "pin" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "service_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profile_rentals" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "personId" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "accountId" TEXT,
    "transactionId" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "profile_rentals_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "shared_services_userId_idx" ON "shared_services"("userId");

-- CreateIndex
CREATE INDEX "service_profiles_userId_idx" ON "service_profiles"("userId");

-- CreateIndex
CREATE INDEX "service_profiles_serviceId_idx" ON "service_profiles"("serviceId");

-- CreateIndex
CREATE INDEX "profile_rentals_userId_idx" ON "profile_rentals"("userId");

-- CreateIndex
CREATE INDEX "profile_rentals_profileId_idx" ON "profile_rentals"("profileId");

-- AddForeignKey
ALTER TABLE "shared_services" ADD CONSTRAINT "shared_services_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_profiles" ADD CONSTRAINT "service_profiles_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "shared_services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profile_rentals" ADD CONSTRAINT "profile_rentals_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "service_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
