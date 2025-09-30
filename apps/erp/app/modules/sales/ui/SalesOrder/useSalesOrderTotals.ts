import { useNanoStore } from "@carbon/remix";
import { atom } from "nanostores";

const $totals = atom<{ total: number }>({
  total: 0,
});
export const useSalesOrderTotals = () => useNanoStore($totals);
