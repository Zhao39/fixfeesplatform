import type { Database } from "@carbon/database";
import { Status } from "@carbon/react";
import { hasIncompleteJobs } from "@carbon/utils";

type SalesOrderStatusProps = {
  status?: Database["public"]["Enums"]["salesOrderStatus"] | null;
  jobs?: Array<{
    salesOrderLineId: string;
    productionQuantity: number;
    quantityComplete: number;
    status: string;
  }>;
  lines?: Array<{
    id: string;
    methodType: "Buy" | "Make" | "Pick";
    saleQuantity: number;
  }>;
};

const SalesStatus = ({ status, jobs, lines }: SalesOrderStatusProps) => {
  // Check if the order has incomplete jobs
  const isManufacturing =
    jobs !== undefined &&
    lines !== undefined &&
    hasIncompleteJobs({ jobs, lines });

  if (isManufacturing && !(status === "Closed" || status === "Cancelled")) {
    return (
      <Status color="yellow" tooltip={status}>
        In Progress
      </Status>
    );
  }

  switch (status) {
    case "Draft":
      return <Status color="gray">{status}</Status>;
    case "Cancelled":
    case "Closed":
      return <Status color="red">{status}</Status>;
    case "To Ship and Invoice":
    case "To Ship":
      return <Status color="orange">{status}</Status>;
    case "To Invoice":
    case "Confirmed":
      return <Status color="blue">{status}</Status>;
    case "Needs Approval":
    case "In Progress":
      return <Status color="yellow">{status}</Status>;
    case "Invoiced":
    case "Completed":
      return <Status color="green">{status}</Status>;
    default:
      return null;
  }
};

export default SalesStatus;
