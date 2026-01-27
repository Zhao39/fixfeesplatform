# Onshape Part Sync Overview

The sync process happens in two main phases: **fetching BOM data** and **syncing to the database**.

## Phase 1: Fetching BOM Data (BOM Route)

**File:** `apps/erp/app/routes/api+/integrations.onshape.d.$did.v.$vid.e.$eid.bom.ts`

1. Calls the Onshape API to get the Bill of Materials for a document/version/element
2. Transforms raw BOM rows into structured objects with headers as keys
3. **Looks up existing items** by building unique part numbers using `readableIdWithRevision` (part number + revision, e.g., "WIDGET-001-A")
4. Queries the `item` table to find matches:
   ```typescript
   client.from("item")
     .select("id, readableId, readableIdWithRevision, defaultMethodType, replenishmentSystem")
     .in("readableIdWithRevision", Array.from(uniquePartNumbers))
   ```
5. For each row, attaches:
   - `id`: The existing Carbon item ID if found, otherwise `undefined`
   - Preserves existing `replenishmentSystem` and `defaultMethodType` if the item exists
   - Falls back to Onshape's "Purchasing Level" field for new items ("Purchased" → Buy/Pick, otherwise → Make)

## Phase 2: Syncing to Database (Edge Function)

**File:** `packages/database/supabase/functions/sync/index.ts`

The sync function processes BOM data in a **transaction** and handles existing vs new parts differently:

### When an Existing Part is Synced (has `id`)

```typescript
if (itemId) {
  // Update existing item with Onshape data
  await trx
    .updateTable("item")
    .set({
      externalId: { onshapeData: data.data },
      updatedBy: userId,
      updatedAt: new Date().toISOString(),
    })
    .where("id", "=", itemId)
    .execute();
}
```

**What happens:**
- The item record is **updated** (not replaced) with the Onshape metadata stored in `externalId.onshapeData`
- The `updatedBy` and `updatedAt` fields are updated
- **No other fields are changed** — the item's name, readableId, revision, replenishment system, etc. are preserved

### When a New Part is Synced (no `id`)

```typescript
// Create new item and part
const item = await trx.insertInto("item").values({
  readableId: partId,
  revision: revision ?? "0",
  name,
  type: "Part",
  unitOfMeasureCode: "EA",
  itemTrackingType: "Inventory",
  replenishmentSystem,
  defaultMethodType,
  companyId,
  externalId: { onshapeData: data.data },
  createdBy: userId,
});

// Create or update the part record
await trx.insertInto("part").values({ id: partId, companyId, createdBy: userId })
  .onConflict((oc) => oc.columns(["id", "companyId"]).doUpdateSet({
    updatedBy: userId,
    updatedAt: new Date().toISOString(),
  }));
```

**What happens:**
- A new `item` record is created
- A new `part` record is created (or updated if the part ID already exists)
- The item is tracked in a `newlyCreatedItemsByPartId` map to prevent duplicates within the same sync

## Additional Processing (Both Cases)

For all items (new or existing):

1. **Method Materials are deleted and recreated**: The function first deletes all existing `methodMaterial` entries for the parent make method, then recreates them with the synced data:
   ```typescript
   await trx.deleteFrom("methodMaterial").where("makeMethodId", "=", makeMethodId).execute();
   ```

2. **Make Methods are created if needed**: If an item has children (sub-assemblies) or `defaultMethodType === "Make"`, a `makeMethod` is created (or looked up if it exists)

3. **Tree traversal**: The BOM is processed as a tree using dotted index notation (e.g., "1", "1.1", "1.1.1"), ensuring parents are processed before children

## After Sync Completes

The API route (`integrations.onshape.sync.ts:76-92`) updates the parent item's `externalId` with sync metadata:

```typescript
currentExternalId["onshape"] = {
  documentId,
  versionId,
  elementId,
  lastSyncedAt: new Date().toISOString()
};
```

## Key Takeaway

**Existing parts preserve their core data** (readableId, revision, name, replenishmentSystem, defaultMethodType) — only the `externalId.onshapeData` metadata is updated. The method materials (BOM relationships) are fully recreated to match the current Onshape structure.
