import { useCallback, useEffect, useRef } from "react";

export default function useCallbackRef<T extends (...args: any[]) => any>(
  callback: T | undefined,
  deps: React.DependencyList = []
) {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  });

  // biome-ignore lint/correctness/useExhaustiveDependencies: suppressed due to migration
  return useCallback(((...args) => callbackRef.current?.(...args)) as T, deps);
}
