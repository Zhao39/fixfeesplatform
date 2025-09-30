import { Outlet } from "@remix-run/react";
import { LuHistory, LuPackageOpen, LuShieldCheck } from "react-icons/lu";
import { MobileTabs } from "~/components/MobileTabs";
import { path } from "~/utils/path";

export default function QualityLayout() {
  return (
    <div className="flex flex-col h-[calc(100dvh-49px)] w-full">
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>
      <QualityNavigation />
    </div>
  );
}

function QualityNavigation() {
  const tabs = [
    {
      icon: LuShieldCheck,
      label: "New",
      to: path.to.qualityNew,
    },
    {
      icon: LuPackageOpen,
      label: "Open",
      to: path.to.qualityOpen,
    },
    {
      icon: LuHistory,
      label: "Past",
      to: path.to.qualityPast,
    },
  ];

  return <MobileTabs tabs={tabs} />;
}
