import { useNanoStore } from "@carbon/remix";
import { atom } from "nanostores";
import type { ListItem } from "~/types";

const $peopleStore = atom<(ListItem & { avatarUrl: string | null })[]>([]);
export const usePeople = () => useNanoStore($peopleStore, "people");
