import type { Authenticated, NavItem } from "@carbon/utils";
import {
  LuArrowRightLeft,
  LuFolderCheck,
  LuHandCoins,
  LuShoppingCart,
  LuTally5,
  LuTruck,
  LuTvMinimalPlay,
} from "react-icons/lu";
import { path } from "~/utils/path";
import { usePermissions } from "./usePermissions";

export function useModules() {
  const permissions = usePermissions();

  const modules: Authenticated<NavItem>[] = [
    {
      name: "Build",
      to: path.to.build,
      icon: LuTvMinimalPlay,
    },
    {
      name: "Receive",
      to: path.to.receive,
      icon: LuHandCoins,
      permission: "inventory",
    },
    {
      name: "Ship",
      to: path.to.ship,
      icon: LuTruck,
      permission: "inventory",
    },
    {
      name: "Pick",
      to: path.to.pick,
      icon: LuShoppingCart,
      permission: "inventory",
    },
    {
      name: "Count",
      to: path.to.count,
      icon: LuTally5,
      permission: "inventory",
    },

    {
      name: "Transfer",
      to: path.to.transfer,
      icon: LuArrowRightLeft,
      permission: "inventory",
    },
    {
      name: "Quality",
      to: path.to.quality,
      icon: LuFolderCheck,
      permission: "quality",
    },
  ];

  return modules.filter((item) => {
    if (item.permission) {
      return permissions.can("view", item.permission);
    } else if (item.role) {
      return permissions.is(item.role);
    } else {
      return true;
    }
  });
}
