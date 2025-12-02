import type { Fetcher } from "@remix-run/react";
import { useFetcher } from "@remix-run/react";
import { noop } from "@tanstack/react-query";
import React from "react";

type FetcherOptions = { key?: string; onStateChange?: (state: Fetcher["state"]) => Promise<void> | void };

export function useAsyncFetcher<TData>(options?: FetcherOptions) {
	const onStateChange = options?.onStateChange || noop;

	const fetcher = useFetcher<TData>({
		key: options?.key,
	});

	const instance = React.useRef<PromiseWithResolvers<TData>>();

	if (!instance.current) {
		instance.current = Promise.withResolvers<TData>();
	}

	const submit = React.useCallback(
		(...args: Parameters<typeof fetcher.submit>) => {
			fetcher.submit(...args);
			return instance.current!.promise;
		},
		[fetcher, instance]
	);

	const load = React.useCallback(
		(...args: Parameters<typeof fetcher.load>) => {
			fetcher.load(...args);
			return instance.current!.promise;
		},
		[fetcher, instance]
	);

	React.useEffect(() => {
		onStateChange(fetcher.state);
		if (fetcher.state === "idle") {
			if (fetcher.data) {
				instance.current?.resolve(fetcher.data as TData); // I think we don't need to use SerializeFrom here
				instance.current = Promise.withResolvers<TData>();
			}
			console.log("Fetcher idle - reset promise");
		}
	}, [fetcher.state, fetcher.data, onStateChange]);

	return {
		...fetcher,
		data: fetcher.data as TData,
		submit,
		load,
	};
}
