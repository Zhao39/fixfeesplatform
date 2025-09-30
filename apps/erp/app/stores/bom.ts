import { useNanoStore } from "@carbon/remix";
import { atom } from "nanostores";

const $bomStore = atom<string | null>(null);
export const useBom = () => useNanoStore($bomStore, "bom");
