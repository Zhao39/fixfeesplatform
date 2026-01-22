import { Status } from "@carbon/react";
import type { approvalStatusType } from "../approvals.models";

type ApprovalStatusProps = {
  status: (typeof approvalStatusType)[number] | null;
};

const ApprovalStatus = ({ status }: ApprovalStatusProps) => {
  switch (status) {
    case "Pending":
      return <Status color="orange">Pending</Status>;
    case "Approved":
      return <Status color="green">Approved</Status>;
    case "Rejected":
      return <Status color="red">Rejected</Status>;
    case "Cancelled":
      return <Status color="gray">Cancelled</Status>;
    default:
      return null;
  }
};

export default ApprovalStatus;
