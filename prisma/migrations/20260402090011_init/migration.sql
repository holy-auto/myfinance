-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameEn" TEXT,
    "type" TEXT NOT NULL,
    "normalBalance" TEXT NOT NULL,
    "category" TEXT,
    "parentId" TEXT,
    "level" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isSummary" BOOLEAN NOT NULL DEFAULT false,
    "taxCategoryId" TEXT,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Account_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Account" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "JournalEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "entryNumber" TEXT NOT NULL,
    "entryDate" DATETIME NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "isReversal" BOOLEAN NOT NULL DEFAULT false,
    "reversalOfId" TEXT,
    "fiscalYear" INTEGER NOT NULL,
    "fiscalMonth" INTEGER NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'MANUAL',
    "businessUnitId" TEXT,
    "projectId" TEXT,
    "createdById" TEXT NOT NULL,
    "approvedById" TEXT,
    "approvedAt" DATETIME,
    "rejectedReason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "JournalEntry_reversalOfId_fkey" FOREIGN KEY ("reversalOfId") REFERENCES "JournalEntry" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "JournalEntry_businessUnitId_fkey" FOREIGN KEY ("businessUnitId") REFERENCES "BusinessUnit" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "JournalEntry_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "JournalEntry_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "JournalEntry_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "JournalLine" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "journalEntryId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "debit" DECIMAL NOT NULL DEFAULT 0,
    "credit" DECIMAL NOT NULL DEFAULT 0,
    "description" TEXT,
    "taxCategory" TEXT,
    "departmentId" TEXT,
    "businessUnitId" TEXT,
    "projectId" TEXT,
    "lineOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "JournalLine_journalEntryId_fkey" FOREIGN KEY ("journalEntryId") REFERENCES "JournalEntry" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "JournalLine_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "JournalLine_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "JournalLine_businessUnitId_fkey" FOREIGN KEY ("businessUnitId") REFERENCES "BusinessUnit" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "JournalLine_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Attachment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fileName" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "storageUrl" TEXT,
    "ocrStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "ocrData" TEXT,
    "uploadedById" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Attachment_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EntryAttachment" (
    "journalEntryId" TEXT NOT NULL,
    "attachmentId" TEXT NOT NULL,

    PRIMARY KEY ("journalEntryId", "attachmentId"),
    CONSTRAINT "EntryAttachment_journalEntryId_fkey" FOREIGN KEY ("journalEntryId") REFERENCES "JournalEntry" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "EntryAttachment_attachmentId_fkey" FOREIGN KEY ("attachmentId") REFERENCES "Attachment" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ClosingPeriod" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fiscalYear" INTEGER NOT NULL,
    "fiscalMonth" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "closedById" TEXT,
    "closedAt" DATETIME,
    "reopenedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ClosingPeriod_closedById_fkey" FOREIGN KEY ("closedById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Department" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "BusinessUnit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "startDate" DATETIME,
    "endDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT,
    "mfaEnabled" BOOLEAN NOT NULL DEFAULT false,
    "mfaSecret" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" DATETIME,
    "allowedIps" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "permissions" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "UserRole" (
    "userId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "assignedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assignedById" TEXT,

    PRIMARY KEY ("userId", "roleId"),
    CONSTRAINT "UserRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "UserRole_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "auth_accounts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    CONSTRAINT "auth_accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" DATETIME NOT NULL,
    CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "changes" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "KpiSnapshot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "snapshotDate" DATETIME NOT NULL,
    "metric" TEXT NOT NULL,
    "value" DECIMAL NOT NULL,
    "businessUnitId" TEXT,
    "periodType" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "KpiSnapshot_businessUnitId_fkey" FOREIGN KEY ("businessUnitId") REFERENCES "BusinessUnit" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BudgetPlan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fiscalYear" INTEGER NOT NULL,
    "fiscalMonth" INTEGER NOT NULL,
    "accountId" TEXT NOT NULL,
    "businessUnitId" TEXT,
    "amount" DECIMAL NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "BudgetPlan_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "BudgetPlan_businessUnitId_fkey" FOREIGN KEY ("businessUnitId") REFERENCES "BusinessUnit" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_code_key" ON "Account"("code");

-- CreateIndex
CREATE INDEX "Account_type_idx" ON "Account"("type");

-- CreateIndex
CREATE INDEX "Account_parentId_idx" ON "Account"("parentId");

-- CreateIndex
CREATE INDEX "Account_code_idx" ON "Account"("code");

-- CreateIndex
CREATE UNIQUE INDEX "JournalEntry_entryNumber_key" ON "JournalEntry"("entryNumber");

-- CreateIndex
CREATE UNIQUE INDEX "JournalEntry_reversalOfId_key" ON "JournalEntry"("reversalOfId");

-- CreateIndex
CREATE INDEX "JournalEntry_fiscalYear_fiscalMonth_idx" ON "JournalEntry"("fiscalYear", "fiscalMonth");

-- CreateIndex
CREATE INDEX "JournalEntry_status_idx" ON "JournalEntry"("status");

-- CreateIndex
CREATE INDEX "JournalEntry_entryDate_idx" ON "JournalEntry"("entryDate");

-- CreateIndex
CREATE INDEX "JournalEntry_createdById_idx" ON "JournalEntry"("createdById");

-- CreateIndex
CREATE INDEX "JournalLine_journalEntryId_idx" ON "JournalLine"("journalEntryId");

-- CreateIndex
CREATE INDEX "JournalLine_accountId_idx" ON "JournalLine"("accountId");

-- CreateIndex
CREATE INDEX "JournalLine_departmentId_idx" ON "JournalLine"("departmentId");

-- CreateIndex
CREATE INDEX "JournalLine_businessUnitId_idx" ON "JournalLine"("businessUnitId");

-- CreateIndex
CREATE UNIQUE INDEX "ClosingPeriod_fiscalYear_fiscalMonth_key" ON "ClosingPeriod"("fiscalYear", "fiscalMonth");

-- CreateIndex
CREATE UNIQUE INDEX "Department_code_key" ON "Department"("code");

-- CreateIndex
CREATE UNIQUE INDEX "BusinessUnit_code_key" ON "BusinessUnit"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Project_code_key" ON "Project"("code");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");

-- CreateIndex
CREATE UNIQUE INDEX "auth_accounts_provider_providerAccountId_key" ON "auth_accounts"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "KpiSnapshot_metric_snapshotDate_idx" ON "KpiSnapshot"("metric", "snapshotDate");

-- CreateIndex
CREATE INDEX "KpiSnapshot_businessUnitId_idx" ON "KpiSnapshot"("businessUnitId");

-- CreateIndex
CREATE UNIQUE INDEX "BudgetPlan_fiscalYear_fiscalMonth_accountId_businessUnitId_key" ON "BudgetPlan"("fiscalYear", "fiscalMonth", "accountId", "businessUnitId");
