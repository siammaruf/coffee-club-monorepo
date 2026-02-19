import { useState, useEffect, useCallback } from 'react';

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
 * Generic data fetching hook.
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

    const refetch = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await fetchFn();
            setData(result);
        } catch (err: any) {
            const message = err?.message || 'An error occurred while fetching data.';
            setError(message);
            console.error('useFetch error:', err);
        } finally {
            setLoading(false);
        }
    }, [fetchFn]);

    useEffect(() => {
        if (immediate) {
            refetch();
        }
    }, []);

    return { data, loading, error, refetch, setData };
}

export default useFetch;
