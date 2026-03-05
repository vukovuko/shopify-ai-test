-- CreateTable
CREATE TABLE "InmateProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "din" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "facilityName" TEXT NOT NULL,
    "facilityAddress1" TEXT NOT NULL,
    "facilityAddress2" TEXT,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zip" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'US',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "InmateProfile_din_key" ON "InmateProfile"("din");

-- CreateIndex
CREATE INDEX "InmateProfile_lastName_firstName_idx" ON "InmateProfile"("lastName", "firstName");

-- CreateIndex
CREATE INDEX "InmateProfile_isActive_idx" ON "InmateProfile"("isActive");
