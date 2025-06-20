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
