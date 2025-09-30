import { cn } from "@carbon/react";
import { NavLink } from "@remix-run/react";
import type { IconType } from "react-icons";

type Tab = {
  label: string;
  to: string;
  icon: IconType;
};

export function MobileTabs({ tabs }: { tabs: Tab[] }) {
  return (
    <div
      className={cn(
        "shadow-lg grid border-t bg-background",
        tabs.length === 1
          ? "grid-cols-1"
          : tabs.length === 2
          ? "grid-cols-2"
          : tabs.length === 3
          ? "grid-cols-3"
          : tabs.length === 4
          ? "grid-cols-4"
          : tabs.length === 5
          ? "grid-cols-5"
          : "grid-cols-6"
      )}
    >
      {tabs.map((tab) => (
        <NavLink
          to={tab.to}
          key={tab.label}
          className={({ isActive }) =>
            cn(
              `flex flex-col items-center justify-center gap-1 hover:bg-accent transition-colors py-3 border-t-2 border-t-transparent mt-[-1px]`,
              isActive ? "border-primary" : "text-muted-foreground"
            )
          }
        >
          <tab.icon className="text-xl" />
          <span className="font-sm">{tab.label}</span>
        </NavLink>
      ))}
    </div>
  );
}
