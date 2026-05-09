-- CreateEnum
CREATE TYPE "CounterpartyKind" AS ENUM ('CUSTOMER', 'VENDOR', 'BOTH', 'OTHER');

-- CreateEnum
CREATE TYPE "TaxKind" AS ENUM ('TAXABLE_SALES', 'TAXABLE_PURCHASE', 'EXEMPT', 'NON_TAXABLE', 'OUT_OF_SCOPE', 'REDUCED_SALES', 'REDUCED_PURCHASE');

-- CreateEnum
CREATE TYPE "BankAccountType" AS ENUM ('CHECKING', 'SAVINGS', 'CREDIT_CARD', 'E_MONEY', 'CASH');

-- CreateEnum
CREATE TYPE "BankTransactionStatus" AS ENUM ('UNMATCHED', 'MATCHED', 'IGNORED');

-- AlterTable
ALTER TABLE "JournalEntry" ADD COLUMN "counterpartyId" TEXT;

-- CreateTable
CREATE TABLE "Counterparty" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameKana" TEXT,
    "kind" "CounterpartyKind" NOT NULL DEFAULT 'BOTH',
    "registrationNo" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "bankInfo" TEXT,
    "paymentTerms" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Counterparty_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaxRate" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "rate" DECIMAL(65,30) NOT NULL,
    "kind" "TaxKind" NOT NULL,
    "effectiveFrom" TIMESTAMP(3),
    "effectiveTo" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TaxRate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BankAccount" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "BankAccountType" NOT NULL,
    "bankName" TEXT,
    "branchName" TEXT,
    "accountNumber" TEXT,
    "linkedAccountId" TEXT,
    "openingBalance" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BankAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BankTransaction" (
    "id" TEXT NOT NULL,
    "bankAccountId" TEXT NOT NULL,
    "txDate" TIMESTAMP(3) NOT NULL,
    "description" TEXT NOT NULL,
    "memo" TEXT,
    "amountIn" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "amountOut" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "balance" DECIMAL(65,30),
    "status" "BankTransactionStatus" NOT NULL DEFAULT 'UNMATCHED',
    "matchedJournalId" TEXT,
    "externalId" TEXT,
    "importBatchId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BankTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JournalRule" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 100,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "matchKeyword" TEXT,
    "matchAmountMin" DECIMAL(65,30),
    "matchAmountMax" DECIMAL(65,30),
    "counterpartyId" TEXT,
    "debitAccountId" TEXT,
    "creditAccountId" TEXT,
    "taxCategory" TEXT,
    "businessUnitId" TEXT,
    "projectId" TEXT,
    "description" TEXT,
    "hitCount" INTEGER NOT NULL DEFAULT 0,
    "lastHitAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JournalRule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Counterparty_code_key" ON "Counterparty"("code");

-- CreateIndex
CREATE INDEX "Counterparty_code_idx" ON "Counterparty"("code");

-- CreateIndex
CREATE INDEX "Counterparty_name_idx" ON "Counterparty"("name");

-- CreateIndex
CREATE UNIQUE INDEX "TaxRate_code_key" ON "TaxRate"("code");

-- CreateIndex
CREATE UNIQUE INDEX "BankAccount_code_key" ON "BankAccount"("code");

-- CreateIndex
CREATE INDEX "BankTransaction_bankAccountId_txDate_idx" ON "BankTransaction"("bankAccountId", "txDate");

-- CreateIndex
CREATE INDEX "BankTransaction_status_idx" ON "BankTransaction"("status");

-- CreateIndex
CREATE INDEX "BankTransaction_externalId_idx" ON "BankTransaction"("externalId");

-- CreateIndex
CREATE INDEX "JournalRule_priority_idx" ON "JournalRule"("priority");

-- CreateIndex
CREATE INDEX "JournalRule_isActive_idx" ON "JournalRule"("isActive");

-- CreateIndex
CREATE INDEX "JournalEntry_counterpartyId_idx" ON "JournalEntry"("counterpartyId");

-- AddForeignKey
ALTER TABLE "JournalEntry" ADD CONSTRAINT "JournalEntry_counterpartyId_fkey" FOREIGN KEY ("counterpartyId") REFERENCES "Counterparty"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BankAccount" ADD CONSTRAINT "BankAccount_linkedAccountId_fkey" FOREIGN KEY ("linkedAccountId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BankTransaction" ADD CONSTRAINT "BankTransaction_bankAccountId_fkey" FOREIGN KEY ("bankAccountId") REFERENCES "BankAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BankTransaction" ADD CONSTRAINT "BankTransaction_matchedJournalId_fkey" FOREIGN KEY ("matchedJournalId") REFERENCES "JournalEntry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JournalRule" ADD CONSTRAINT "JournalRule_counterpartyId_fkey" FOREIGN KEY ("counterpartyId") REFERENCES "Counterparty"("id") ON DELETE SET NULL ON UPDATE CASCADE;
