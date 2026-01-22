import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  VStack
} from "@carbon/react";
import { formatDate } from "@carbon/utils";
import { EmployeeAvatar } from "~/components";
import type { ApprovalHistory as ApprovalHistoryType } from "~/modules/approvals";
import ApprovalStatus from "./ApprovalStatus";

type ApprovalHistoryProps = {
  history: ApprovalHistoryType;
};

const ApprovalHistory = ({ history }: ApprovalHistoryProps) => {
  if (!history || history.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Approval History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">No approval history</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Approval History</CardTitle>
      </CardHeader>
      <CardContent>
        <VStack spacing={4} className="w-full">
          {history.map((item) => (
            <div key={item.id} className="border rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between">
                <ApprovalStatus status={item.status} />
                <span className="text-sm text-muted-foreground">
                  {formatDate(item.requestedAt)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Requested by:
                </span>
                <EmployeeAvatar employeeId={item.requestedBy} />
              </div>
              {item.decisionBy && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    Decision by:
                  </span>
                  <EmployeeAvatar employeeId={item.decisionBy} />
                  <span className="text-sm text-muted-foreground">
                    on {formatDate(item.decisionAt)}
                  </span>
                </div>
              )}
              {item.decisionNotes && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Notes: </span>
                  {item.decisionNotes}
                </div>
              )}
            </div>
          ))}
        </VStack>
      </CardContent>
    </Card>
  );
};

export default ApprovalHistory;
