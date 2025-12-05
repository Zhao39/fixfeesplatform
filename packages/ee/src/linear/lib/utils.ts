import type { Database } from "@carbon/database";

export enum LinearWorkStateType {
  Triage = "triage",
  Backlog = "backlog",
  Unstarted = "unstarted",
  Started = "started",
  Completed = "completed",
  Canceled = "canceled",
}

type CarbonTaskStatus = Database["public"]["Enums"]["nonConformanceTaskStatus"];

export const mapLinearStatusToCarbonStatus = (
  status: LinearWorkStateType
): CarbonTaskStatus => {
  switch (status) {
    case LinearWorkStateType.Triage:
    case LinearWorkStateType.Unstarted:
    case LinearWorkStateType.Backlog:
      return "Pending";
    case LinearWorkStateType.Started:
      return "In Progress";
    case LinearWorkStateType.Canceled:
      return "Skipped";
    default:
      throw new Error(`Unknown Linear status: ${status}`);
  }
};
