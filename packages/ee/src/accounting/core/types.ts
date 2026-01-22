import type { Database } from "@carbon/database";
import type { Kysely, KyselyDatabase, KyselyTx } from "@carbon/database/client";
import type { SupabaseClient } from "@supabase/supabase-js";
import type z from "zod";
import type { AccountingProvider } from "../providers";
import type {
  AccountingSyncSchema,
  ContactSchema,
  EmployeeSchema,
  ItemSchema,
  ProviderCredentialsSchema,
  ProviderID,
  ProviderIntegrationMetadataSchema,
  SyncDirectionSchema
} from "./models";
import { withSyncDisabled } from "./utils";

// /********************************************************\
// *                  Provider Types Start                  *
// \********************************************************/
export type ProviderCredentials = z.output<typeof ProviderCredentialsSchema>;
export type ProviderIntegrationMetadata = z.infer<
  typeof ProviderIntegrationMetadataSchema
>;

export interface OAuthClientOptions {
  clientId: string;
  clientSecret: string;
  tokenUrl: string;
  accessToken?: string;
  refreshToken?: string;
  redirectUri?: string;
  getAuthUrl: (scopes: string[], redirectUri: string) => string;
  onTokenRefresh?: (creds: ProviderCredentials) => Promise<void>;
}

export interface AuthProvider {
  getCredentials(): ProviderCredentials;
  getAuthUrl(scopes: string[], redirectUri: string): string;
  exchangeCode(code: string, redirectUri: string): Promise<ProviderCredentials>;
  refresh(): Promise<ProviderCredentials>;
}

export type ProviderConfig<T = unknown> = {
  id: ProviderID;
  companyId: string;
  syncConfig: GlobalSyncConfig;
  onTokenRefresh?: OAuthClientOptions["onTokenRefresh"];
} & T;

export abstract class BaseProvider {
  static id: ProviderID;

  protected creds?: ProviderCredentials;
  public auth!: AuthProvider;

  abstract getSyncConfig<T extends AccountingEntityType>(
    entity: T
  ): GlobalSyncConfig["entities"][T];

  abstract validate(auth: ProviderCredentials): Promise<boolean>;

  abstract authenticate(...args: any[]): Promise<ProviderCredentials>;
}

// /********************************************************\
// *                   Provider Types End                   *
// \********************************************************/

// /********************************************************\
// *                    Sync Types Start                    *
// \********************************************************/

export type SyncDirection = z.infer<typeof SyncDirectionSchema>;

/**
 * Defines which system owns the data integrity.
 * - 'carbon': Carbon data overwrites Accounting data.
 * - 'accounting': Accounting data overwrites Carbon data.
 */
export type SystemOfRecord = "carbon" | "accounting";

// ============================================================================
// 2. CONFIGURATION INTERFACES
// ============================================================================

// Core domain types
export type AccountingEntityType =
  | "customer"
  | "vendor"
  | "item"
  | "employee"
  | "purchaseOrder"
  | "bill"
  | "salesOrder"
  | "invoice"
  | "payment"
  | "inventoryAdjustment";

export interface EntityConfig {
  /** Is this entity sync active? */
  enabled: boolean;

  /** Direction of sync. */
  direction: SyncDirection;

  /** In case of a data conflict, who wins? */
  owner: SystemOfRecord;

  /**
   * ISO Date string. Only sync records modified after this date.
   * Critical for initial setup to prevent syncing ancient history.
   */
  syncFromDate?: string;
}

export interface GlobalSyncConfig {
  /**
   * The configuration for each specific entity
   */
  entities: Record<AccountingEntityType, EntityConfig>;
}

export interface EntityDefinition {
  label: string;
  type: "master" | "transaction";
  dependsOn?: AccountingEntityType[];
  supportedDirections: SyncDirection[];
}

export type AccountingSyncPayload = z.infer<typeof AccountingSyncSchema>;

export type SyncFn = (input: {
  client: SupabaseClient<Database>;
  kysely: Kysely<KyselyDatabase>;
  entity: AccountingEntity;
  provider: AccountingProvider;
  payload: AccountingSyncPayload;
}) => Promise<any> | any;

export interface AccountingEntity<
  T extends AccountingEntityType = AccountingEntityType
> {
  entityType: T;
  entityId: string;
  operation: "create" | "update" | "delete" | "sync";
  lastSyncedAt?: string;
}

export interface SyncContext {
  database: Kysely<KyselyDatabase>;
  companyId: string;
  provider: AccountingProvider;
  config: EntityConfig;
}

export interface SyncResult {
  status: "success" | "skipped" | "error";
  action: "created" | "updated" | "deleted" | "none";
  localId?: string;
  remoteId?: string;
  error?: unknown;
}

export interface BatchSyncResult {
  results: SyncResult[];
  successCount: number;
  errorCount: number;
  skippedCount: number;
}

export interface IEntitySyncer {
  // Single-item methods
  pushToAccounting(entityId: string): Promise<SyncResult>;
  pullFromAccounting(remoteId: string): Promise<SyncResult>;

  // Batch methods
  pushBatchToAccounting(entityIds: string[]): Promise<BatchSyncResult>;
  pullBatchFromAccounting(remoteIds: string[]): Promise<BatchSyncResult>;
}

export abstract class BaseEntitySyncer<
  TLocal, // Carbon DB Entity Type (e.g. Invoice)
  TRemote, // Accounting API Entity Type (e.g. Xero.Invoice)
  TOmit extends string | symbol | number // Fields to omit from mapping
> implements IEntitySyncer
{
  protected database: Kysely<KyselyDatabase>;
  protected companyId: string;
  protected provider: AccountingProvider;
  protected config: EntityConfig;

  constructor(protected context: SyncContext) {
    this.database = context.database;
    this.companyId = context.companyId;
    this.provider = context.provider;
    this.config = context.config;
  }

  // =================================================================
  // 1. ABSTRACT ID MAPPING (Implemented by Subclasses)
  // =================================================================

  /**
   * Look up the Remote ID (e.g. Xero ID) for a given Local ID (Carbon ID).
   * Must be implemented by the resource to query its specific table/column.
   */
  public abstract getRemoteId(localId: string): Promise<string | null>;

  /**
   * Look up the Local ID (Carbon ID) for a given Remote ID (e.g. Xero ID).
   */
  public abstract getLocalId(remoteId: string): Promise<string | null>;

  /**
   * Save the link between a Carbon ID and a Remote ID.
   */
  protected abstract linkEntities(
    tx: KyselyTx,
    localId: string,
    remoteId: string
  ): Promise<void>;

  protected abstract fetchLocal(id: string): Promise<TLocal | null>;

  protected abstract fetchRemote(id: string): Promise<TRemote | null>;

  protected abstract mapToRemote(local: TLocal): Promise<Omit<TRemote, TOmit>>;

  protected abstract mapToLocal(remote: TRemote): Promise<Partial<TLocal>>;

  /**
   * Extract the last updated timestamp from a remote entity.
   * Used to compare with local entity to avoid unnecessary updates.
   */
  protected abstract getRemoteUpdatedAt(remote: TRemote): Date | null;

  protected abstract upsertLocal(
    tx: KyselyTx,
    data: Partial<TLocal>,
    remoteId: string
  ): Promise<string>;

  protected abstract upsertRemote(
    data: Omit<TRemote, TOmit>,
    localId: string
  ): Promise<string>;

  // =================================================================
  // 2. ABSTRACT BATCH METHODS (Implemented by Subclasses)
  // =================================================================

  /**
   * Fetch multiple local entities by their IDs.
   * Returns a Map of localId -> entity.
   */
  protected abstract fetchLocalBatch(
    ids: string[]
  ): Promise<Map<string, TLocal>>;

  /**
   * Fetch multiple remote entities by their IDs.
   * Returns a Map of remoteId -> entity.
   */
  protected abstract fetchRemoteBatch(
    ids: string[]
  ): Promise<Map<string, TRemote>>;

  /**
   * Upsert multiple remote entities in a single API call.
   * Returns a Map of localId -> remoteId.
   */
  protected abstract upsertRemoteBatch(
    data: Array<{ localId: string; payload: Omit<TRemote, TOmit> }>
  ): Promise<Map<string, string>>;

  // =================================================================
  // 3. PUSH WORKFLOW (Carbon ->upsertRemoteBatch Accounting)
  // =================================================================

  async pushToAccounting(entityId: string): Promise<SyncResult> {
    if (!this.config.enabled) {
      return {
        status: "skipped",
        action: "none",
        error: "Sync disabled in config"
      };
    }

    try {
      const localEntity = await this.fetchLocal(entityId);
      if (!localEntity) {
        return {
          status: "error",
          action: "none",
          error: `Entity ${entityId} not found in Carbon`
        };
      }

      const remotePayload = await this.mapToRemote(localEntity);

      const id = await this.upsertRemote(remotePayload, entityId);

      const remoteId = await withSyncDisabled(this.database, async (tx) => {
        await this.linkEntities(tx, entityId, id);

        return id;
      });

      await this.logSyncOperation("push", entityId, remoteId, "success");

      return {
        status: "success",
        action: "updated",
        localId: entityId,
        remoteId
      };
    } catch (err: any) {
      await this.logSyncOperation("push", entityId, undefined, "error", err);
      return {
        status: "error",
        action: "none",
        localId: entityId,
        error: err
      };
    }
  }

  // =================================================================
  // 4. PULL WORKFLOW (Accounting -> Carbon)
  // =================================================================

  async pullFromAccounting(remoteId: string): Promise<SyncResult> {
    if (!this.config.enabled) {
      return {
        status: "skipped",
        action: "none",
        error: "Sync disabled in config"
      };
    }

    try {
      const remoteEntity = await this.fetchRemote(remoteId);
      if (!remoteEntity) {
        return {
          status: "error",
          action: "none",
          error: `Entity ${remoteId} not found in Remote`
        };
      }

      // Check if local entity exists and is already up to date
      const existingLocalId = await this.getLocalId(remoteId);
      if (existingLocalId) {
        const localEntity = await this.fetchLocal(existingLocalId);
        const remoteUpdatedAt = this.getRemoteUpdatedAt(remoteEntity);

        if (localEntity && remoteUpdatedAt) {
          const localUpdatedAt = new Date((localEntity as any).updatedAt);
          if (localUpdatedAt >= remoteUpdatedAt) {
            return {
              status: "skipped",
              action: "none",
              localId: existingLocalId,
              remoteId,
              error: "Local entity is up to date"
            };
          }
        }
      }

      const localPayload = await this.mapToLocal(remoteEntity);

      // Wrap DB writes in withSyncDisabled to prevent circular triggers
      // (external sync -> DB write -> trigger -> sync back to external)
      const newLocalId = await withSyncDisabled(this.database, async (tx) => {
        const id = await this.upsertLocal(tx, localPayload, remoteId);
        await this.linkEntities(tx, id, remoteId);

        return id;
      });

      await this.logSyncOperation("pull", newLocalId, remoteId, "success");

      return {
        status: "success",
        action: existingLocalId ? "updated" : "created",
        localId: newLocalId,
        remoteId
      };
    } catch (err: any) {
      await this.logSyncOperation("pull", undefined, remoteId, "error", err);
      return {
        status: "error",
        action: "none",
        remoteId,
        error: err
      };
    }
  }

  // =================================================================
  // 5. BATCH PUSH WORKFLOW (Carbon -> Accounting)
  // =================================================================

  async pushBatchToAccounting(entityIds: string[]): Promise<BatchSyncResult> {
    const results: SyncResult[] = [];

    if (!this.config.enabled) {
      for (const id of entityIds) {
        results.push({
          status: "skipped",
          action: "none",
          localId: id,
          error: "Sync disabled in config"
        });
      }
      return this.summarizeBatchResults(results);
    }

    try {
      // 1. Fetch all local entities in batch
      const localEntities = await this.fetchLocalBatch(entityIds);

      // Track entities not found locally
      const notFoundIds = entityIds.filter((id) => !localEntities.has(id));
      for (const id of notFoundIds) {
        results.push({
          status: "error",
          action: "none",
          localId: id,
          error: `Entity ${id} not found in Carbon`
        });
      }

      // 2. Map all found entities to remote payloads
      const batchPayloads: Array<{
        localId: string;
        payload: Omit<TRemote, TOmit>;
      }> = [];

      for (const [localId, entity] of localEntities) {
        try {
          const payload = await this.mapToRemote(entity);
          batchPayloads.push({ localId, payload });
        } catch (err) {
          results.push({
            status: "error",
            action: "none",
            localId,
            error: err
          });
        }
      }

      if (batchPayloads.length === 0) {
        return this.summarizeBatchResults(results);
      }

      // 3. Upsert all in a single batch call
      const remoteIdMap = await this.upsertRemoteBatch(batchPayloads);

      await withSyncDisabled(this.database, async (tx) => {
        // 4. Link entities and record results
        for (const { localId } of batchPayloads) {
          const remoteId = remoteIdMap.get(localId);
          if (remoteId) {
            await this.linkEntities(tx, localId, remoteId);
            results.push({
              status: "success",
              action: "updated",
              localId,
              remoteId
            });
          } else {
            results.push({
              status: "error",
              action: "none",
              localId,
              error: "Remote upsert did not return ID"
            });
          }
        }
      });
    } catch (err: any) {
      // If the whole batch fails, mark all as errors
      for (const id of entityIds) {
        if (!results.find((r) => r.localId === id)) {
          results.push({
            status: "error",
            action: "none",
            localId: id,
            error: err
          });
        }
      }
    }

    return this.summarizeBatchResults(results);
  }

  // =================================================================
  // 6. BATCH PULL WORKFLOW (Accounting -> Carbon)
  // =================================================================

  async pullBatchFromAccounting(remoteIds: string[]): Promise<BatchSyncResult> {
    const results: SyncResult[] = [];

    if (!this.config.enabled) {
      for (const id of remoteIds) {
        results.push({
          status: "skipped",
          action: "none",
          remoteId: id,
          error: "Sync disabled in config"
        });
      }
      return this.summarizeBatchResults(results);
    }

    try {
      // 1. Fetch all remote entities in batch
      const remoteEntities = await this.fetchRemoteBatch(remoteIds);

      // Track entities not found remotely
      const notFoundIds = remoteIds.filter((id) => !remoteEntities.has(id));
      for (const id of notFoundIds) {
        results.push({
          status: "error",
          action: "none",
          remoteId: id,
          error: `Entity ${id} not found in Remote`
        });
      }

      // 2. Process each found entity
      for (const [remoteId, entity] of remoteEntities) {
        try {
          // Check system of record
          const existingLocalId = await this.getLocalId(remoteId);
          if (existingLocalId && this.config.owner === "carbon") {
            results.push({
              status: "skipped",
              action: "none",
              remoteId,
              localId: existingLocalId,
              error: "Carbon is System of Record"
            });
            continue;
          }

          // Map and upsert locally
          const localPayload = await this.mapToLocal(entity);

          const localId = await withSyncDisabled(this.database, async (tx) => {
            const id = await this.upsertLocal(tx, localPayload, remoteId);

            await this.linkEntities(tx, id, remoteId);

            return id;
          });

          results.push({
            status: "success",
            action: "updated",
            localId,
            remoteId
          });
        } catch (err) {
          results.push({
            status: "error",
            action: "none",
            remoteId,
            error: err
          });
        }
      }
    } catch (err: any) {
      // If the whole batch fails, mark all as errors
      for (const id of remoteIds) {
        if (!results.find((r) => r.remoteId === id)) {
          results.push({
            status: "error",
            action: "none",
            remoteId: id,
            error: err
          });
        }
      }
    }

    return this.summarizeBatchResults(results);
  }

  private summarizeBatchResults(results: SyncResult[]): BatchSyncResult {
    return {
      results,
      successCount: results.filter((r) => r.status === "success").length,
      errorCount: results.filter((r) => r.status === "error").length,
      skippedCount: results.filter((r) => r.status === "skipped").length
    };
  }

  // =================================================================
  // 7. DEPENDENCY HELPER
  // =================================================================

  /**
   * JIT (Just-In-Time) Dependency Sync.
   * Finds the Remote ID for a related entity. If not synced, it syncs it.
   */
  protected async ensureDependencySynced(
    type: AccountingEntityType,
    localId: string
  ): Promise<string> {
    console.log(`[BaseSyncer] Resolving dependency: ${type} ${localId}`);

    // 1. Instantiate the dependency's Syncer
    // Dynamic import to avoid circular dependency
    const { SyncFactory } = await import("./sync");
    const syncer = SyncFactory.getSyncer(type, {
      ...this.context,
      config: this.context.provider.getSyncConfig(type)
    });

    // 2. Check if it's already synced (using the dependency's own logic)
    // Note: This requires getRemoteId to be exposed on the syncer instance
    const existingRemoteId = await (syncer as any).getRemoteId(localId);
    if (existingRemoteId) {
      return existingRemoteId;
    }

    console.log(
      `[BaseSyncer] Dependency not found. Triggering sync for ${type} ${localId}`
    );

    // 3. Force a Push
    const result = await syncer.pushToAccounting(localId);

    if (result.status === "error" || !result.remoteId) {
      throw new Error(
        `Dependency failed: Could not sync ${type} ${localId}. Error: ${result.error}`
      );
    }

    return result.remoteId;
  }

  // =================================================================
  // 6. LOGGING
  // =================================================================

  private async logSyncOperation(
    direction: "push" | "pull",
    localId: string | undefined,
    remoteId: string | undefined,
    status: "success" | "error",
    error?: unknown
  ) {
    console.log(
      `[SyncLog] ${direction.toUpperCase()} | Entity: ${this.getEntityTypeName()} | LocalID: ${localId} | RemoteID: ${remoteId} | Status: ${status} `
    );

    if (error) {
      console.error(error);
    }
  }

  private getEntityTypeName(): string {
    return (this.context as any).entityType || "unknown";
  }
}

// /********************************************************\
// *                     Sync Types End                     *
// \********************************************************/

export namespace Accounting {
  export type Contact = z.infer<typeof ContactSchema>;
  export type Employee = z.infer<typeof EmployeeSchema>;
  export type Item = z.infer<typeof ItemSchema>;
}

export interface RequestContext {
  auth?: ProviderCredentials;
  signal?: AbortSignal;
}

export interface SyncOptions {
  modifiedSince?: Date;
  cursor?: string;
  limit?: number;
  includeDeleted?: boolean;
}

export interface ReadableResource<T> {
  list(options?: SyncOptions): Promise<T[]>;
  get(id: string): Promise<T>;
}

export type WritableResource<T, Create, Update> = {
  create(data: Create): Promise<T>;
  update(id: string, data: Update): Promise<T>;
  upsert(...data: Array<Update & { id: string }>): Promise<T>;
  delete(id: string): Promise<void>;
};

export type Resource<T, Create, Update = Create> = ReadableResource<T> &
  WritableResource<T, Create, Update>;
