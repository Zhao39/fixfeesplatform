import { getUser } from "@carbon/auth";
import type { Database } from "@carbon/database";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  getLinearIssueFromExternalId,
  LinearClient,
  mapCarbonStatusToLinearStatus,
} from "../../linear/lib";
import type { NotificationEvent, NotificationService } from "../types";

const linear = new LinearClient();

/**
 * Linear Notification Service
 * Updates Linear issues based on Carbon notification events
 */
export class LinearNotificationService implements NotificationService {
  id = "linear";
  name = "Linear";

  async send(
    event: NotificationEvent,
    context: { serviceRole: SupabaseClient<Database> }
  ): Promise<void> {
    // Currently, we have no notifications to send via Linear

    switch (event.type) {
      case "task.status.changed": {
        if (event.data.type !== "action") return;

        const issue = await getLinearIssueFromExternalId(
          (event.data as any).externalId
        );

        if (!issue) return;

        await linear.updateIssue(event.companyId, {
          id: issue.id,
          stateId: mapCarbonStatusToLinearStatus(event.data.status),
        });

        break;
      }

      case "task.assigned": {
        if (event.data.table !== "nonConformanceActionTask") return;

        const issue = await getLinearIssueFromExternalId(
          (event.data as any).externalId
        );

        if (!issue) return; // No linked Linear issue

        const { data: user } = await getUser(
          context.serviceRole,
          event.data.assignee
        );

        if (!user) return; // No assignee user

        const [linearUser] = await linear.getUsers(event.companyId, {
          email: user.email,
        });

        if (!linearUser) return;

        await linear.updateIssue(event.companyId, {
          id: issue.id,
          assigneeId: linearUser.id,
        });
        break;
      }
    }
    return;
  }
}
