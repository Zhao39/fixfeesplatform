CREATE TYPE "planType" AS ENUM ('Trial', 'Per User', 'Flat Fee');

CREATE TABLE "planTemplate" (
  "id" TEXT NOT NULL DEFAULT xid(),
  "name" TEXT NOT NULL,
  "description" TEXT,
  "planType" "planType" NOT NULL,
  "stripePriceId" TEXT NOT NULL,
  "stripeProductId" TEXT NOT NULL,
  "pricePerUser" DECIMAL(10,2),
  "flatPrice" DECIMAL(10,2),
  "includedUsers" INTEGER NOT NULL DEFAULT 1,
  "includedTasks" INTEGER NOT NULL DEFAULT 10000,
  "includedAiTokens" INTEGER NOT NULL DEFAULT 1000000,
  "trialDays" INTEGER,
  "active" BOOLEAN NOT NULL DEFAULT TRUE,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT "pk_planTemplate" PRIMARY KEY ("id")
);


CREATE TABLE "companyPlan" (
  "id" TEXT NOT NULL DEFAULT xid(),
  "includedTasks" INTEGER NOT NULL DEFAULT 10000,
  "includedAiTokens" INTEGER NOT NULL DEFAULT 1000000,
  "includedUsers" INTEGER NOT NULL DEFAULT 10,
  "tasksLimit" INTEGER NOT NULL DEFAULT 10000,
  "aiTokensLimit" INTEGER NOT NULL DEFAULT 1000000,
  "subscriptionStartDate" TIMESTAMP WITH TIME ZONE NOT NULL,
  "stripeCustomerId" TEXT,
  "stripeSubscriptionId" TEXT NOT NULL,
  "stripeSubscriptionStatus" TEXT NOT NULL DEFAULT 'ACTIVE',
  "companyId" TEXT NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  "planTemplateId" TEXT REFERENCES "planTemplate"("id"),
  "planType" "planType" NOT NULL DEFAULT 'Flat Fee',
  "pricePerUser" DECIMAL(10,2),
  "flatPrice" DECIMAL(10,2),
  "trialEndDate" TIMESTAMP WITH TIME ZONE,
  "billingCycle" TEXT NOT NULL DEFAULT 'monthly',
  CONSTRAINT "pk_companyPlan" PRIMARY KEY ("id"),
  CONSTRAINT "fk_companyPlan_company" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE CASCADE,
  CONSTRAINT "uq_companyPlan_companyId" UNIQUE ("companyId")
);

CREATE INDEX "idx_companyPlan_companyId" ON "companyPlan" ("companyId");

CREATE TABLE "companyUsage" (
  "id" TEXT NOT NULL DEFAULT xid(),
  "users" INTEGER NOT NULL DEFAULT 0,
  "tasks" INTEGER NOT NULL DEFAULT 0,
  "aiTokens" INTEGER NOT NULL DEFAULT 0,
  "nextResetDatetime" TIMESTAMP WITH TIME ZONE NOT NULL,
  "companyId" TEXT NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT "pk_companyUsage" PRIMARY KEY ("id"),
  CONSTRAINT "fk_companyUsage_company" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE CASCADE
);

CREATE INDEX "idx_companyUsage_companyId" ON "companyUsage" ("companyId");


CREATE TABLE "billingEvent" (
  "id" TEXT NOT NULL DEFAULT xid(),
  "companyId" TEXT NOT NULL,
  "eventType" TEXT NOT NULL,
  "stripeEventId" TEXT,
  "amount" DECIMAL(10,2),
  "currency" TEXT NOT NULL DEFAULT 'USD',
  "metadata" JSONB,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT "pk_billingEvent" PRIMARY KEY ("id"),
  CONSTRAINT "fk_billingEvent_company" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE CASCADE
);
