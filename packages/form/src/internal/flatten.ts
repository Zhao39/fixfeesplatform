import { setPath } from "../utils";
import { MultiValueMap } from "./MultiValueMap";

export const objectFromPathEntries = (entries: [string, any][]) => {
  const map = new MultiValueMap<string, any>();
  // biome-ignore lint/suspicious/useIterableCallbackReturn: suppressed due to migration
  entries.forEach(([key, value]) => map.add(key, value));
  return [...map.entries()].reduce(
    (acc, [key, value]) =>
      setPath(acc, key, value.length === 1 ? value[0] : value),
    {} as Record<string, any>
  );
};
