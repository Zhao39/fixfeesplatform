import { Outlet } from "@remix-run/react";
import { LuHistory, LuPackageOpen, LuTruck } from "react-icons/lu";
import { MobileTabs } from "~/components/MobileTabs";
import { path } from "~/utils/path";

export default function ShipmentLayout() {
  return (
    <div className="flex flex-col h-[calc(100dvh-49px)] w-full">
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>
      <ShipmentNavigation />
    </div>
  );
}

function ShipmentNavigation() {
  const tabs = [
    {
      icon: LuTruck,
      label: "New",
      to: path.to.shipNew,
    },
    {
      icon: LuPackageOpen,
      label: "Open",
      to: path.to.shipOpen,
    },
    {
      icon: LuHistory,
      label: "Past",
      to: path.to.shipPast,
    },
  ];

  return <MobileTabs tabs={tabs} />;
}
