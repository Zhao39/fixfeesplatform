import { useNanoStore } from "@carbon/remix";
import { atom } from "nanostores";
import type { ListItem } from "~/types";

const $customersStore = atom<ListItem[]>([]);
export const useCustomers = () => useNanoStore($customersStore, "customers");
