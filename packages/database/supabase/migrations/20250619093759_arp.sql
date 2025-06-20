

CREATE TABLE "folder" (
  "id" TEXT NOT NULL DEFAULT xid(),
  "displayName" TEXT NOT NULL,
  "displayOrder" INTEGER NOT NULL DEFAULT 0,
  "companyId" TEXT NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT "pk_folder" PRIMARY KEY ("id"),
  CONSTRAINT "fk_folder_company" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE CASCADE,
  CONSTRAINT "uq_folder_companyId_displayName" UNIQUE ("companyId", "displayName")
);

CREATE INDEX "idx_folder_companyId" ON "folder" ("companyId");

CREATE TABLE "file" (
  "id" TEXT NOT NULL DEFAULT xid(),
  "path" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "size" INTEGER NOT NULL,
  "extension" TEXT NOT NULL,
  "readGroups" TEXT[],
  "type" TEXT,
  "metadata" JSONB,
  "companyId" TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT "pk_file" PRIMARY KEY ("id"),
  CONSTRAINT "fk_file_company" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE CASCADE
);

CREATE INDEX "idx_file_companyId" ON "file" ("companyId");
CREATE INDEX "idx_file_type" ON "file" ("type", "companyId", "createdAt" DESC);

CREATE TABLE "flag" (
  "id" TEXT NOT NULL DEFAULT xid(),
  "value" JSONB NOT NULL,
  "companyId" TEXT NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT "pk_flag" PRIMARY KEY ("id"),
  CONSTRAINT "fk_flag_company" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE CASCADE
);

CREATE INDEX "idx_flag_companyId" ON "flag" ("companyId");

CREATE TABLE "flow" (
  "id" TEXT NOT NULL DEFAULT xid(),
  "folderId" TEXT,
  "externalId" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'DISABLED',
  "schedule" JSONB,
  "publishedVersionId" TEXT,
  "handshakeConfiguration" JSONB,
  "metadata" JSONB,
  "companyId" TEXT NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT "pk_flow" PRIMARY KEY ("id"),
  CONSTRAINT "fk_flow_folder" FOREIGN KEY ("folderId") REFERENCES "folder"("id") ON DELETE SET NULL
);

CREATE INDEX "idx_flow_folderId" ON "flow" ("folderId");
CREATE INDEX "idx_flow_companyId" ON "flow" ("companyId");

CREATE TABLE "flowVersion" (
  "id" TEXT NOT NULL DEFAULT xid(),
  "displayName" TEXT NOT NULL,
  "trigger" JSONB,
  "valid" BOOLEAN NOT NULL,
  "state" TEXT NOT NULL,
  "flowId" TEXT NOT NULL,
  "schemaVersion" TEXT,
  "connectionIds" TEXT[],
  "companyId" TEXT NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  "createdBy" TEXT NOT NULL,
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  "updatedBy" TEXT,
  CONSTRAINT "pk_flowVersion" PRIMARY KEY ("id"),
  CONSTRAINT "fk_flowVersion_flow" FOREIGN KEY ("flowId") REFERENCES "flow"("id") ON DELETE CASCADE,
  CONSTRAINT "fk_flowVersion_company" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE CASCADE,
  CONSTRAINT "fk_flowVersion_createdBy" FOREIGN KEY ("createdBy") REFERENCES "user"("id") ON DELETE CASCADE
);

ALTER TABLE "flow" ADD CONSTRAINT "fk_flow_publishedVersion" FOREIGN KEY ("publishedVersionId") REFERENCES "flowVersion"("id") ON DELETE SET NULL;

CREATE INDEX "idx_flowVersion_flowId" ON "flowVersion" ("flowId");
CREATE INDEX "idx_flowVersion_companyId" ON "flowVersion" ("companyId");


CREATE TABLE "flowRun" (
  "id" TEXT NOT NULL DEFAULT xid(),
  "flowId" TEXT NOT NULL,
  "flowVersionId" TEXT NOT NULL,
  "flowDisplayName" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "tasks" INTEGER,
  "environment" TEXT,
  "logsFileId" TEXT,
  "pauseMetadata" JSONB,
  "startTime" TIMESTAMP WITH TIME ZONE NOT NULL,
  "finishTime" TIMESTAMP WITH TIME ZONE,
  "terminationReason" TEXT,
  "failedStepName" TEXT,
  "companyId" TEXT NOT NULL,
  "tags" TEXT[],
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT "pk_flowRun" PRIMARY KEY ("id"),
  CONSTRAINT "fk_flowRun_flow" FOREIGN KEY ("flowId") REFERENCES "flow"("id") ON DELETE CASCADE,
  CONSTRAINT "fk_flowRun_flowVersion" FOREIGN KEY ("flowVersionId") REFERENCES "flowVersion"("id") ON DELETE CASCADE,
  CONSTRAINT "fk_flowRun_company" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE CASCADE,
  CONSTRAINT "uq_flowRun_flowId_flowVersionId_startTime" UNIQUE ("flowId", "flowVersionId", "startTime"),
  CONSTRAINT "fk_flowRun_logsFile" FOREIGN KEY ("logsFileId") REFERENCES "file"("id") ON DELETE SET NULL
);

CREATE INDEX "idx_flowRun_flowId" ON "flowRun" ("flowId");
CREATE INDEX "idx_flowRun_flowVersionId" ON "flowRun" ("flowVersionId");
CREATE INDEX "idx_flowRun_companyId" ON "flowRun" ("companyId");
CREATE INDEX "idx_flowRun_environment" ON "flowRun" ("companyId", "environment", "createdAt" DESC);
CREATE INDEX "idx_flowRun_environment_status" ON "flowRun" ("companyId", "environment", "status", "createdAt" DESC);
CREATE INDEX "idx_flowRun_environment_status_flowId" ON "flowRun" ("companyId", "environment", "status", "flowId", "createdAt" DESC);
CREATE INDEX "idx_flowRun_environment_status_flowId_createdAt" ON "flowRun" ("companyId", "environment", "status", "flowId", "createdAt" DESC);
CREATE INDEX "idx_flowRun_environment_status_flowId_failedStepName" ON "flowRun" ("companyId", "flowId", "failedStepName");


CREATE TABLE "storeEntry" (
  "id" TEXT NOT NULL DEFAULT xid(),
  "key" TEXT NOT NULL CHECK (length("key") <= 128),
  "value" JSONB,
  "companyId" TEXT NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT "pk_storeEntry" PRIMARY KEY ("id"),
  CONSTRAINT "fk_storeEntry_company" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE CASCADE
);

CREATE INDEX "idx_storeEntry_companyId" ON "storeEntry" ("companyId");
CREATE INDEX "idx_storeEntry_key" ON "storeEntry" ("key", "companyId");


CREATE TABLE "appConnection" (
  "id" TEXT NOT NULL DEFAULT xid(),
  "externalId" TEXT NOT NULL,
  "displayName" TEXT NOT NULL,
  "pieceName" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "type" TEXT NOT NULL,
  "value" JSONB NOT NULL, -- TODO: encrypt at rest
  "ownerId" TEXT,
  "metadata" JSONB,
  "companyId" TEXT NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT "pk_appConnection" PRIMARY KEY ("id"),
  CONSTRAINT "fk_appConnection_company" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE CASCADE,
  CONSTRAINT "fk_appConnection_owner" FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE SET NULL,
  CONSTRAINT "uq_appConnection_companyId_pieceName_externalId" UNIQUE ("companyId", "pieceName", "externalId")
);

CREATE INDEX "idx_appConnection_companyId" ON "appConnection" ("companyId");

CREATE TABLE "appCredential" (
  "id" TEXT NOT NULL DEFAULT xid(),
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  "appName" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "settings" JSONB NOT NULL,
  CONSTRAINT "pk_appCredential" PRIMARY KEY ("id"),
  CONSTRAINT "fk_appCredential_company" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE CASCADE
);

CREATE UNIQUE INDEX "idx_appCredential_companyId_appName" ON "appCredential" ("appName", "companyId");
CREATE INDEX "idx_appCredential_companyId" ON "appCredential" ("companyId");

CREATE TABLE "connectionKey" (
  "id" TEXT NOT NULL DEFAULT xid(),
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), 
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  "companyId" TEXT NOT NULL,
  "settings" JSONB NOT NULL,
  CONSTRAINT "pk_connectionKey" PRIMARY KEY ("id"),
  CONSTRAINT "fk_connectionKey_company" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE CASCADE
);

CREATE INDEX "idx_connectionKey_companyId" ON "connectionKey" ("companyId");

CREATE TABLE "appEventRouting" (
  "id" TEXT NOT NULL DEFAULT xid(),
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  "appName" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "flowId" TEXT NOT NULL, 
  "identifierValue" TEXT NOT NULL,
  "event" TEXT NOT NULL,
  CONSTRAINT "pk_appEventRouting" PRIMARY KEY ("id"),
  CONSTRAINT "fk_appEventRouting_company" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE CASCADE,
  CONSTRAINT "fk_appEventRouting_flow" FOREIGN KEY ("flowId") REFERENCES "flow"("id") ON DELETE CASCADE,
  CONSTRAINT "uq_appEventRouting_appName_companyId_identifierValue_event" UNIQUE ("appName", "companyId", "identifierValue", "event")
);

CREATE INDEX "idx_appEventRouting_flowId" ON "appEventRouting" ("flowId");
CREATE UNIQUE INDEX "idx_appEventRouting_appName_companyId_identifierValue_event" ON "appEventRouting" ("appName", "companyId", "identifierValue", "event");

CREATE TABLE "triggerEvent" (
  "id" TEXT NOT NULL DEFAULT xid(),
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  "flowId" TEXT NOT NULL,
  "sourceName" TEXT NOT NULL,
  "fileId" TEXT,
  "companyId" TEXT NOT NULL,
  CONSTRAINT "pk_triggerEvent" PRIMARY KEY ("id"),
  CONSTRAINT "fk_triggerEvent_company" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE CASCADE,
  CONSTRAINT "fk_triggerEvent_flow" FOREIGN KEY ("flowId") REFERENCES "flow"("id") ON DELETE CASCADE,
  CONSTRAINT "fk_triggerEvent_file" FOREIGN KEY ("fileId") REFERENCES "file"("id")
);

CREATE INDEX "idx_triggerEvent_flowId" ON "triggerEvent" ("flowId");
CREATE INDEX "idx_triggerEvent_companyId" ON "triggerEvent" ("companyId");

CREATE TABLE "webhookSimulation" (
  "id" TEXT NOT NULL DEFAULT xid(),
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  "flowId" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  CONSTRAINT "pk_webhookSimulation" PRIMARY KEY ("id"),
  CONSTRAINT "fk_webhookSimulation_flow" FOREIGN KEY ("flowId") REFERENCES "flow"("id") ON DELETE CASCADE,
  CONSTRAINT "fk_webhookSimulation_company" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE CASCADE
);

CREATE INDEX "idx_webhookSimulation_flowId" ON "webhookSimulation" ("flowId");
CREATE INDEX "idx_webhookSimulation_companyId" ON "webhookSimulation" ("companyId");

CREATE COLLATION en_natural (LOCALE = 'en-US-u-kn-true', PROVIDER = 'icu');

CREATE TABLE "pieceMetadata" (
  "id" TEXT NOT NULL DEFAULT xid(),
  "name" TEXT NOT NULL,
  "displayName" TEXT NOT NULL,
  "actions" JSON,
  "triggers" JSON,
  "auth" JSON,
  "i18n" JSON,
  "archiveId" TEXT,
  "logoUrl" TEXT NOT NULL,
  "description" TEXT,
  "version" TEXT NOT NULL COLLATE "en_natural",
  "minimumSupportedRelease" TEXT NOT NULL COLLATE "en_natural",
  "maximumSupportedRelease" TEXT NOT NULL COLLATE "en_natural",
  "pieceType" TEXT NOT NULL DEFAULT 'OFFICIAL',
  "packageType" TEXT NOT NULL DEFAULT 'REGISTRY',
  "categories" TEXT[],
  "authors" TEXT[],
  "companyUsage" INTEGER NOT NULL DEFAULT 0,
  "companyId" TEXT NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT "pk_pieceMetadata" PRIMARY KEY ("id"),
  CONSTRAINT "fk_pieceMetadata_archive" FOREIGN KEY ("archiveId") REFERENCES "file"("id") ON DELETE RESTRICT,
  CONSTRAINT "fk_pieceMetadata_company" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE CASCADE,
  CONSTRAINT "uq_pieceMetadata_name_version_companyId" UNIQUE ("name", "version", "companyId")
);

CREATE INDEX "idx_pieceMetadata_companyId" ON "pieceMetadata" ("companyId");
CREATE UNIQUE INDEX "idx_pieceMetadata_name_version_companyId" ON "pieceMetadata" ("name", "version", "companyId");


CREATE TABLE "stepFile" (
  "id" TEXT NOT NULL DEFAULT xid(),
  "flowId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "size" INTEGER NOT NULL,
  "stepName" TEXT NOT NULL,
  "data" BYTEA NOT NULL,
  "companyId" TEXT NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT "pk_stepFile" PRIMARY KEY ("id"),
  CONSTRAINT "fk_stepFile_company" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE CASCADE,
  CONSTRAINT "fk_stepFile_flow" FOREIGN KEY ("flowId") REFERENCES "flow"("id") ON DELETE CASCADE
);

CREATE UNIQUE INDEX "idx_stepFile_companyId_flowId_stepName_name" ON "stepFile" ("companyId", "flowId", "stepName", "name");
CREATE INDEX "idx_stepFile_companyId" ON "stepFile" ("companyId");
CREATE INDEX "idx_stepFile_flowId" ON "stepFile" ("flowId");

CREATE TABLE "chatbot" (
  "id" TEXT NOT NULL DEFAULT xid(),
  "type" TEXT NOT NULL,
  "displayName" TEXT NOT NULL,
  "connectionId" TEXT,
  "dataSources" JSON NOT NULL,
  "prompt" TEXT,
  "visibilityStatus" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT "pk_chatbot" PRIMARY KEY ("id"),
  CONSTRAINT "fk_chatbot_company" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE CASCADE,
  CONSTRAINT "fk_chatbot_connection" FOREIGN KEY ("connectionId") REFERENCES "appConnection"("id") ON DELETE CASCADE
);

CREATE INDEX "idx_chatbot_companyId" ON "chatbot" ("companyId");
CREATE INDEX "idx_chatbot_connectionId" ON "chatbot" ("connectionId");



CREATE TABLE "oauthApp" (
  "id" TEXT NOT NULL DEFAULT xid(),
  "pieceName" TEXT NOT NULL,
  "clientId" TEXT NOT NULL,
  "clientSecret" JSONB NOT NULL,
  "companyId" TEXT NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT "pk_oauthApp" PRIMARY KEY ("id"),
  CONSTRAINT "uq_oauthApp_pieceName" UNIQUE ("pieceName")
);

CREATE UNIQUE INDEX "idx_oauthApp_pieceName" ON "oauthApp" ("pieceName");
CREATE INDEX "idx_oauthApp_companyId" ON "oauthApp" ("companyId");

CREATE TABLE "issue" (
  "id" TEXT NOT NULL DEFAULT xid(),
  "flowId" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "stepName" TEXT,
  "lastOccurrence" TIMESTAMP WITH TIME ZONE NOT NULL,
  "companyId" TEXT NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT "pk_issue" PRIMARY KEY ("id"),
  CONSTRAINT "uq_issue_flowId_stepName" UNIQUE ("flowId", "stepName"),
  CONSTRAINT "fk_issue_flow" FOREIGN KEY ("flowId") REFERENCES "flow"("id") ON DELETE CASCADE,
  CONSTRAINT "fk_issue_company" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE CASCADE
);

CREATE UNIQUE INDEX "idx_issue_flowId_stepName" ON "issue" ("flowId", "stepName");
CREATE INDEX "idx_issue_companyId" ON "issue" ("companyId");




CREATE TABLE "alert" (
  "id" TEXT NOT NULL DEFAULT xid(),
  "channel" TEXT NOT NULL,
  "receiver" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT "pk_alert" PRIMARY KEY ("id"),
  CONSTRAINT "fk_alert_company" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE CASCADE
);

CREATE INDEX "idx_alert_companyId" ON "alert" ("companyId");


CREATE TABLE "workerMachine" (
  "id" TEXT NOT NULL DEFAULT xid(),
  "information" JSONB NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT "pk_workerMachine" PRIMARY KEY ("id")
);

CREATE TABLE "aiProvider" (
  "id" TEXT NOT NULL DEFAULT xid(),
  "config" JSONB NOT NULL,
  "provider" TEXT NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT "pk_aiProvider" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "idx_aiProvider_platformId_provider" ON "aiProvider" ("provider");

CREATE TABLE "aiUsage" (
  "id" TEXT NOT NULL DEFAULT xid(),
  "provider" TEXT NOT NULL,
  "model" TEXT NOT NULL, 
  "cost" NUMERIC NOT NULL,
  "companyId" TEXT NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT "pk_aiUsage" PRIMARY KEY ("id"),
  CONSTRAINT "fk_aiUsage_company" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE CASCADE
);

CREATE INDEX "idx_aiUsage_companyId_createdAt" ON "aiUsage" ("companyId", "createdAt");


CREATE TABLE "table" (
  "id" TEXT NOT NULL DEFAULT xid(),
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  "name" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  CONSTRAINT "pk_table" PRIMARY KEY ("id"),
  CONSTRAINT "fk_table_company" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE CASCADE
);

CREATE INDEX "idx_table_companyId" ON "table" ("companyId");

CREATE TABLE "field" (
  "id" TEXT NOT NULL DEFAULT xid(),
  "tableId" TEXT NOT NULL,
  "externalId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "data" JSONB,
  "companyId" TEXT NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT "pk_field" PRIMARY KEY ("id"),
  CONSTRAINT "fk_field_table" FOREIGN KEY ("tableId") REFERENCES "table"("id") ON DELETE CASCADE
);

CREATE INDEX "idx_field_tableId_name" ON "field" ("tableId", "name", "companyId");

CREATE TABLE "record" (
  "id" TEXT NOT NULL DEFAULT xid(),
  "tableId" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT "pk_record" PRIMARY KEY ("id"),
  CONSTRAINT "fk_record_table" FOREIGN KEY ("tableId") REFERENCES "table"("id") ON DELETE CASCADE,
  CONSTRAINT "fk_record_company" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE CASCADE
);



CREATE INDEX "idx_record_tableId" ON "record" ("tableId");
CREATE INDEX "idx_record_companyId" ON "record" ("companyId");
CREATE INDEX "idx_record_id_tableId_companyId" ON "record" ("id", "tableId", "companyId");

CREATE TABLE "cell" (
  "id" TEXT NOT NULL DEFAULT xid(),
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  "recordId" TEXT NOT NULL,
  "fieldId" TEXT NOT NULL,
  "value" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  CONSTRAINT "pk_cell" PRIMARY KEY ("id"),
  CONSTRAINT "fk_cell_record" FOREIGN KEY ("recordId") REFERENCES "record"("id") ON DELETE CASCADE,
  CONSTRAINT "fk_cell_field" FOREIGN KEY ("fieldId") REFERENCES "field"("id") ON DELETE CASCADE,
  CONSTRAINT "fk_cell_company" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE CASCADE
);

CREATE INDEX "idx_cell_recordId_fieldId" ON "cell" ("recordId", "fieldId", "companyId");
CREATE INDEX "idx_cell_companyId" ON "cell" ("companyId");

CREATE TABLE "tableWebhook" (
  "id" TEXT NOT NULL DEFAULT xid(),
  "tableId" TEXT NOT NULL,
  "flowId" TEXT NOT NULL,
  "events" TEXT[] NOT NULL,
  "companyId" TEXT NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT "pk_tableWebhook" PRIMARY KEY ("id"),
  CONSTRAINT "fk_tableWebhook_company" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE CASCADE,
  CONSTRAINT "fk_tableWebhook_table" FOREIGN KEY ("tableId") REFERENCES "table"("id") ON DELETE CASCADE,
  CONSTRAINT "fk_tableWebhook_flow" FOREIGN KEY ("flowId") REFERENCES "flow"("id") ON DELETE CASCADE
);

CREATE INDEX "idx_tableWebhook_companyId" ON "tableWebhook" ("companyId");
CREATE INDEX "idx_tableWebhook_tableId" ON "tableWebhook" ("tableId");
CREATE INDEX "idx_tableWebhook_flowId" ON "tableWebhook" ("flowId");

CREATE TABLE "agent" (
  "id" TEXT NOT NULL DEFAULT xid(),
  "profilePictureUrl" TEXT NOT NULL,
  "displayName" TEXT NOT NULL,
  "description" TEXT,
  "testPrompt" TEXT NOT NULL,
  "systemPrompt" TEXT NOT NULL,
  "maxSteps" INTEGER NOT NULL,
  "outputType" TEXT NOT NULL,
  "outputFields" JSONB NOT NULL,
  "companyId" TEXT NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT "pk_agent" PRIMARY KEY ("id"),
  CONSTRAINT "fk_agent_company" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE CASCADE
);

CREATE TABLE "todo" (
  "id" TEXT NOT NULL DEFAULT xid(),
  "flowId" TEXT,
  "agentId" TEXT,
  "runId" TEXT,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "status" JSONB NOT NULL,
  "statusOptions" JSONB NOT NULL,
  "assigneeId" TEXT,
  "resolveUrl" TEXT,
  "locked" BOOLEAN NOT NULL DEFAULT false,
  "companyId" TEXT NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  "createdBy" TEXT,
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT "pk_todo" PRIMARY KEY ("id"),
  CONSTRAINT "fk_todo_company" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE CASCADE,
  CONSTRAINT "fk_todo_flow" FOREIGN KEY ("flowId") REFERENCES "flow"("id") ON DELETE CASCADE,
  CONSTRAINT "fk_todo_agent" FOREIGN KEY ("agentId") REFERENCES "agent"("id") ON DELETE CASCADE,
  CONSTRAINT "fk_todo_run" FOREIGN KEY ("runId") REFERENCES "flowRun"("id") ON DELETE CASCADE,
  CONSTRAINT "fk_todo_createdBy" FOREIGN KEY ("createdBy") REFERENCES "user"("id") ON DELETE CASCADE,
  CONSTRAINT "fk_todo_assignee" FOREIGN KEY ("assigneeId") REFERENCES "user"("id") ON DELETE CASCADE
);

CREATE INDEX "idx_todo_companyId" ON "todo" ("companyId");
CREATE INDEX "idx_todo_flowId" ON "todo" ("flowId");
CREATE INDEX "idx_todo_agent_id" ON "todo" ("agentId");

CREATE TABLE "todoActivity" (
  "id" TEXT NOT NULL DEFAULT xid(),
  "todoId" TEXT NOT NULL,
  "userId" TEXT,
  "agentId" TEXT,
  "content" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT "pk_todoActivity" PRIMARY KEY ("id"),
  CONSTRAINT "fk_todoActivity_todo_id" FOREIGN KEY ("todoId") REFERENCES "todo"("id") ON DELETE CASCADE,
  CONSTRAINT "fk_todoActivity_user_id" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE,
  CONSTRAINT "fk_todoActivity_agent_id" FOREIGN KEY ("agentId") REFERENCES "agent"("id") ON DELETE CASCADE
);

CREATE INDEX "idx_todoActivity_todo_id" ON "todoActivity" ("todoId");
CREATE INDEX "idx_todoActivity_user_id" ON "todoActivity" ("userId");
CREATE INDEX "idx_todoActivity_agent_id" ON "todoActivity" ("agentId");


CREATE TABLE "todoComment" (
  "id" TEXT NOT NULL DEFAULT xid(),
  "content" TEXT NOT NULL,
  "todoId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT "pk_todoComment" PRIMARY KEY ("id"),
  CONSTRAINT "fk_todoComment_todo" FOREIGN KEY ("todoId") REFERENCES "todo"("id") ON DELETE CASCADE,
  CONSTRAINT "fk_todoComment_user" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE,
  CONSTRAINT "fk_todoComment_company" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE CASCADE
);

CREATE INDEX "idx_todoComment_todoId" ON "todoComment" ("todoId");
CREATE INDEX "idx_todoComment_userId" ON "todoComment" ("userId");
CREATE INDEX "idx_todoComment_companyId" ON "todoComment" ("companyId");


CREATE TABLE "mcp" (
  "id" TEXT NOT NULL DEFAULT xid(),
  "agentId" TEXT,
  "name" TEXT NOT NULL DEFAULT 'MCP Server',
  "token" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT "pk_mcp" PRIMARY KEY ("id"),
  CONSTRAINT "fk_mcp_agent" FOREIGN KEY ("agentId") REFERENCES "agent"("id") ON DELETE CASCADE
);

CREATE UNIQUE INDEX "idx_mcp_companyId" ON "mcp" ("companyId");
CREATE INDEX "idx_mcp_agentId" ON "mcp" ("agentId");

ALTER TABLE "agent" ADD COLUMN "mcpId" TEXT;
ALTER TABLE "agent" ADD CONSTRAINT "fk_agent_mcp" FOREIGN KEY ("mcpId") REFERENCES "mcp"("id") ON DELETE CASCADE;


CREATE TABLE "mcpTool" (
  "id" TEXT NOT NULL DEFAULT xid(),
  "mcpId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "pieceMetadata" JSONB,
  "flowId" TEXT,
  "companyId" TEXT NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT "pk_mcpTool" PRIMARY KEY ("id"),
  CONSTRAINT "fk_mcpTool_mcp" FOREIGN KEY ("mcpId") REFERENCES "mcp"("id") ON DELETE CASCADE,
  CONSTRAINT "fk_mcpTool_flow" FOREIGN KEY ("flowId") REFERENCES "flow"("id") ON DELETE NO ACTION,
  CONSTRAINT "fk_mcpTool_company" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE CASCADE
);

CREATE INDEX "idx_mcpTool_mcpId" ON "mcpTool" ("mcpId");
CREATE INDEX "idx_mcpTool_flowId" ON "mcpTool" ("flowId");



CREATE TABLE "mcpRun" (
  "id" TEXT NOT NULL DEFAULT xid(),
  "mcpId" TEXT NOT NULL,
  "toolId" TEXT,
  "metadata" JSONB NOT NULL,
  "input" JSONB NOT NULL,
  "output" JSONB NOT NULL,
  "status" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT "pk_mcpRun" PRIMARY KEY ("id"),
  CONSTRAINT "fk_mcpRun_mcp" FOREIGN KEY ("mcpId") REFERENCES "mcp"("id") ON DELETE CASCADE,
  CONSTRAINT "fk_mcpRun_tool" FOREIGN KEY ("toolId") REFERENCES "mcpTool"("id") ON DELETE SET NULL,
  CONSTRAINT "fk_mcpRun_company" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE CASCADE
);

CREATE INDEX "idx_mcpRun_mcpId" ON "mcpRun" ("mcpId");
CREATE INDEX "idx_mcpRun_toolId" ON "mcpRun" ("toolId");
CREATE INDEX "idx_mcpRun_companyId" ON "mcpRun" ("companyId");

