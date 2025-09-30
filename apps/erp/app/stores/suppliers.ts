import { useNanoStore } from "@carbon/remix";
import { atom } from "nanostores";
import type { ListItem } from "~/types";

const $suppliersStore = atom<ListItem[]>([]);
export const useSuppliers = () => useNanoStore($suppliersStore, "suppliers");
