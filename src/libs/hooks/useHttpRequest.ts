"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Observable, Subscription } from "rxjs";

interface UseHttpRequestOptions {
	immediate?: boolean;
}

interface UseHttpRequestResult<T> {
	data: T | null;
	loading: boolean;
	error: string | null;
	execute: () => void;
}

export function useHttpRequest<T>(
	requestFn: () => Observable<T>,
	options?: UseHttpRequestOptions
): UseHttpRequestResult<T> {
	const [data, setData] = useState<T | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const subscriptionRef = useRef<Subscription | null>(null);

	const execute = useCallback(() => {
		subscriptionRef.current?.unsubscribe();
		setLoading(true);
		setError(null);

		subscriptionRef.current = requestFn().subscribe({
			next: (result) => {
				setData(result);
				setLoading(false);
			},
			error: (err) => {
				setError(err?.message ?? "Something went wrong");
				setLoading(false);
			},
		});
	}, [requestFn]);

	useEffect(() => {
		if (options?.immediate) {
			execute();
		}

		return () => {
			subscriptionRef.current?.unsubscribe();
		};
	}, [execute, options?.immediate]);

	return { data, loading, error, execute };
}
