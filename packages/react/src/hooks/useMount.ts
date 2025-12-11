import { useEffect } from "react";

export default function useMount(callback: () => void) {
  // biome-ignore lint/correctness/useExhaustiveDependencies: suppressed due to migration
  useEffect(() => {
    callback();
  }, []);
}
