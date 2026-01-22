import type { KyselyTx } from "@carbon/database/client";
import { sql } from "kysely";
import { updateAccountingEntityExternalId } from "../../../core/service";
import { type Accounting, BaseEntitySyncer } from "../../../core/types";
import { parseDotnetDate, type Xero } from "../models";

// Type for rows returned from employee queries with user joins
type EmployeeRow = {
  id: string;
  companyId: string;
  active: boolean;
  employeeTypeId: string;
  firstName: string;
  lastName: string;
  fullName: string | null;
  email: string;
  updatedAt: string | null;
  // From employeeJob join
  title: string | null;
  departmentId: string | null;
  locationId: string | null;
  managerId: string | null;
  startDate: string | null;
};

export class EmployeeSyncer extends BaseEntitySyncer<
  Accounting.Employee,
  Xero.Employee,
  "UpdatedDateUTC"
> {
  // =================================================================
  // 1. ID MAPPING
  // =================================================================

  async getRemoteId(localId: string): Promise<string | null> {
    // Employees are linked to user table which has externalId
    const userLink = await this.database
      .selectFrom("user")
      .select(["id", "externalId"])
      .where("id", "=", localId)
      .executeTakeFirst();

    if (!userLink?.externalId) return null;

    const externalId = userLink.externalId as Record<string, { id?: string }>;
    return externalId?.[this.provider.id]?.id ?? null;
  }

  async getLocalId(remoteId: string): Promise<string | null> {
    // Check user table for the external ID link
    const userLink = await this.database
      .selectFrom("user")
      .select("id")
      .where(sql`"externalId"->${this.provider.id}->>'id'`, "=", remoteId)
      .executeTakeFirst();

    return userLink?.id ?? null;
  }

  protected async linkEntities(
    tx: KyselyTx,
    localId: string,
    remoteId: string
  ): Promise<void> {
    // Update the user table's externalId with the Xero employee ID
    await updateAccountingEntityExternalId(
      tx,
      "user",
      localId,
      this.provider.id,
      remoteId
    );
  }

  // =================================================================
  // 2. TIMESTAMP EXTRACTION
  // =================================================================

  protected getRemoteUpdatedAt(remote: Xero.Employee): Date | null {
    if (!remote.UpdatedDateUTC) return null;
    return parseDotnetDate(remote.UpdatedDateUTC);
  }

  // =================================================================
  // 3. LOCAL FETCH (Single + Batch)
  // =================================================================

  async fetchLocal(id: string): Promise<Accounting.Employee | null> {
    const employees = await this.fetchEmployeesByIds([id]);
    return employees.get(id) ?? null;
  }

  protected async fetchLocalBatch(
    ids: string[]
  ): Promise<Map<string, Accounting.Employee>> {
    if (ids.length === 0) return new Map();
    return this.fetchEmployeesByIds(ids);
  }

  private async fetchEmployeesByIds(
    ids: string[]
  ): Promise<Map<string, Accounting.Employee>> {
    if (ids.length === 0) return new Map();

    const rows = await this.database
      .selectFrom("employee")
      .innerJoin("user", "user.id", "employee.id")
      .leftJoin("employeeJob", (join) =>
        join
          .onRef("employeeJob.id", "=", "employee.id")
          .onRef("employeeJob.companyId", "=", "employee.companyId")
      )
      .select([
        "employee.id",
        "employee.companyId",
        "employee.active",
        "employee.employeeTypeId",
        "user.firstName",
        "user.lastName",
        "user.fullName",
        "user.email",
        "user.updatedAt",
        "employeeJob.title",
        "employeeJob.departmentId",
        "employeeJob.locationId",
        "employeeJob.managerId",
        "employeeJob.startDate"
      ])
      .where("employee.id", "in", ids)
      .where("employee.companyId", "=", this.companyId)
      .execute();

    return this.transformRows(rows);
  }

  private transformRows(rows: EmployeeRow[]): Map<string, Accounting.Employee> {
    const result = new Map<string, Accounting.Employee>();

    for (const row of rows) {
      result.set(row.id, {
        id: row.id,
        companyId: row.companyId,
        firstName: row.firstName,
        lastName: row.lastName,
        fullName: row.fullName,
        email: row.email,
        active: row.active,
        title: row.title,
        departmentId: row.departmentId,
        locationId: row.locationId,
        managerId: row.managerId,
        startDate: row.startDate,
        updatedAt: row.updatedAt ?? new Date().toISOString(),
        raw: row
      });
    }

    return result;
  }

  // =================================================================
  // 4. REMOTE FETCH (Single + Batch)
  // =================================================================

  async fetchRemote(id: string): Promise<Xero.Employee | null> {
    const result = await this.provider.request<{ Employees: Xero.Employee[] }>(
      "GET",
      `/Employees/${id}`
    );

    return result.error ? null : (result.data?.Employees?.[0] ?? null);
  }

  protected async fetchRemoteBatch(
    ids: string[]
  ): Promise<Map<string, Xero.Employee>> {
    const result = new Map<string, Xero.Employee>();
    if (ids.length === 0) return result;

    // Xero doesn't support batch fetching employees by IDs directly
    // We need to fetch all and filter, or fetch one by one
    // For efficiency, we'll fetch individually in parallel
    const promises = ids.map(async (id) => {
      const employee = await this.fetchRemote(id);
      if (employee) {
        result.set(employee.EmployeeID, employee);
      }
    });

    await Promise.all(promises);
    return result;
  }

  // =================================================================
  // 5. TRANSFORMATION (Carbon -> Xero)
  // =================================================================

  protected async mapToRemote(
    local: Accounting.Employee
  ): Promise<Omit<Xero.Employee, "UpdatedDateUTC">> {
    const existingRemoteId = await this.getRemoteId(local.id);

    return {
      EmployeeID: existingRemoteId!,
      Status: local.active ? "ACTIVE" : "DELETED",
      FirstName: local.firstName,
      LastName: local.lastName,
      ExternalLink: local.externalLink
        ? {
            Url: local.externalLink.url ?? undefined,
            Description: local.externalLink.description ?? undefined
          }
        : undefined
    };
  }

  // =================================================================
  // 6. TRANSFORMATION (Xero -> Carbon)
  // =================================================================

  protected async mapToLocal(
    remote: Xero.Employee
  ): Promise<Partial<Accounting.Employee>> {
    return {
      firstName: remote.FirstName,
      lastName: remote.LastName,
      fullName: `${remote.FirstName} ${remote.LastName}`,
      active: remote.Status !== "DELETED",
      externalLink: remote.ExternalLink
        ? {
            url: remote.ExternalLink.Url ?? null,
            description: remote.ExternalLink.Description ?? null
          }
        : undefined,
      updatedAt: remote.UpdatedDateUTC
        ? parseDotnetDate(remote.UpdatedDateUTC).toISOString()
        : new Date().toISOString()
    };
  }

  // =================================================================
  // 7. UPSERT LOCAL
  // =================================================================

  protected async upsertLocal(
    tx: KyselyTx,
    data: Partial<Accounting.Employee>,
    remoteId: string
  ): Promise<string> {
    const existingLocalId = await this.getLocalId(remoteId);

    const externalIdData = {
      [this.provider.id]: {
        id: remoteId,
        provider: this.provider.id,
        lastSyncedAt: new Date().toISOString()
      }
    };

    if (existingLocalId) {
      // Update existing user
      await tx
        .updateTable("user")
        .set({
          firstName: data.firstName ?? undefined,
          lastName: data.lastName ?? undefined,
          fullName: data.fullName ?? undefined,
          active: data.active,
          updatedAt: new Date().toISOString(),
          externalId: sql`COALESCE("externalId", '{}'::jsonb) || ${JSON.stringify(
            externalIdData
          )}::jsonb`
        })
        .where("id", "=", existingLocalId)
        .execute();

      return existingLocalId;
    }

    // For new employees from Xero, we need to create a user first
    // This is a more complex operation as it requires auth setup
    // For now, we'll throw an error - employees should be created in Carbon first
    throw new Error(
      `Cannot create new employee from Xero. Employee with ID ${remoteId} must be created in Carbon first and then synced.`
    );
  }

  // =================================================================
  // 8. UPSERT REMOTE (Single + Batch)
  // =================================================================

  protected async upsertRemote(
    data: Omit<Xero.Employee, "UpdatedDateUTC">,
    localId: string
  ): Promise<string> {
    const existingRemoteId = await this.getRemoteId(localId);
    const employees = existingRemoteId
      ? [{ ...data, EmployeeID: existingRemoteId }]
      : [data];

    const result = await this.provider.request<{ Employees: Xero.Employee[] }>(
      "POST",
      "/Employees",
      { body: JSON.stringify({ Employees: employees }) }
    );

    if (result.error || !result.data?.Employees?.[0]?.EmployeeID) {
      throw new Error(
        `Failed to ${
          existingRemoteId ? "update" : "create"
        } employee in Xero: ${result.error}`
      );
    }

    return result.data.Employees[0].EmployeeID;
  }

  protected async upsertRemoteBatch(
    data: Array<{
      localId: string;
      payload: Omit<Xero.Employee, "UpdatedDateUTC">;
    }>
  ): Promise<Map<string, string>> {
    const result = new Map<string, string>();
    if (data.length === 0) return result;

    const employees: Xero.Employee[] = [];
    const localIdOrder: string[] = [];

    for (const { localId, payload } of data) {
      const existingRemoteId = await this.getRemoteId(localId);
      employees.push(
        existingRemoteId
          ? ({ ...payload, EmployeeID: existingRemoteId } as Xero.Employee)
          : (payload as Xero.Employee)
      );
      localIdOrder.push(localId);
    }

    const response = await this.provider.request<{
      Employees: Xero.Employee[];
    }>("POST", "/Employees", {
      body: JSON.stringify({ Employees: employees })
    });

    if (response.error || !response.data?.Employees) {
      throw new Error(`Batch upsert failed: ${response.error}`);
    }

    for (let i = 0; i < response.data.Employees.length; i++) {
      const returnedEmployee = response.data.Employees[i];
      const localId = localIdOrder[i];
      if (returnedEmployee?.EmployeeID && localId) {
        result.set(localId, returnedEmployee.EmployeeID);
      }
    }

    return result;
  }
}
