import { useState, useEffect, useRef, useCallback } from 'react';

interface UseFetchOptions {
    immediate?: boolean;
}

interface UseFetchResult<T> {
    data: T | null;
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
    setData: React.Dispatch<React.SetStateAction<T | null>>;
}

/**
 * Generic data fetching hook with cancellation support.
 *
 * @param fetchFn - An async function that returns data of type T.
 * @param options - Options to control fetch behavior.
 * @param options.immediate - If true (default), fetches data on mount.
 *
 * @example
 * ```tsx
 * const { data, loading, error, refetch } = useFetch(
 *     () => orderService.getAll({ page: 1, limit: 10 }),
 *     { immediate: true }
 * );
 * ```
 */
export function useFetch<T>(
    fetchFn: () => Promise<T>,
    options: UseFetchOptions = {}
): UseFetchResult<T> {
    const { immediate = true } = options;

    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState<boolean>(immediate);
    const [error, setError] = useState<string | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);
    const isMountedRef = useRef(true);
    const fetchFnRef = useRef(fetchFn);

    // Keep the refetch function stable but always call the latest fetchFn
    fetchFnRef.current = fetchFn;

    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, []);

    const refetch = useCallback(async () => {
        // Cancel any previous in-flight request
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        const controller = new AbortController();
        abortControllerRef.current = controller;

        setLoading(true);
        setError(null);
        try {
            const result = await fetchFnRef.current();
            if (isMountedRef.current && !controller.signal.aborted) {
                setData(result);
            }
        } catch (err: any) {
            if (isMountedRef.current && !controller.signal.aborted) {
                const message = err?.message || 'An error occurred while fetching data.';
                setError(message);
                console.error('useFetch error:', err);
            }
        } finally {
            if (isMountedRef.current && !controller.signal.aborted) {
                setLoading(false);
            }
        }
    }, []);

    useEffect(() => {
        if (immediate) {
            refetch();
        }
    }, [immediate, refetch]);

    return { data, loading, error, refetch, setData };
}

export default useFetch;
