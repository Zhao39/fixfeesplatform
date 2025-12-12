import type { MetaFunction } from "@vercel/remix";
import { Outlet } from "react-router";
import type { Handle } from "~/utils/handle";
import { path } from "~/utils/path";

export const meta: MetaFunction = () => {
  return [{ title: "Carbon | Warehouse Transfer" }];
};

export const handle: Handle = {
  breadcrumb: "Inventory",
  to: path.to.inventory,
  module: "inventory"
};

export default function WarehouseTransferRoute() {
  return <Outlet />;
}
