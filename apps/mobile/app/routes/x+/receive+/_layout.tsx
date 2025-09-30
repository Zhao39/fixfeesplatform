import { Outlet } from "@remix-run/react";
import { LuHandCoins, LuHistory, LuPackageOpen } from "react-icons/lu";
import { MobileTabs } from "~/components/MobileTabs";
import { path } from "~/utils/path";

export default function ReceiptLayout() {
  return (
    <div className="flex flex-col h-[calc(100dvh-49px)] w-full">
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>
      <ReceiptNavigation />
    </div>
  );
}

function ReceiptNavigation() {
  const tabs = [
    {
      icon: LuHandCoins,
      label: "New",
      to: path.to.receiveNew,
    },
    {
      icon: LuPackageOpen,
      label: "Open",
      to: path.to.receiveOpen,
    },
    {
      icon: LuHistory,
      label: "Past",
      to: path.to.receivePast,
    },
  ];

  return <MobileTabs tabs={tabs} />;
}
