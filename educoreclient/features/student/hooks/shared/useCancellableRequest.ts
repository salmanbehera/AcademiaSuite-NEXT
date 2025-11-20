/**
 * Request Cancellation Hook
 * Provides AbortController support for async operations
 */

"use client";

import { useEffect, useRef, useCallback } from "react";

export interface UseCancellableRequestReturn {
  signal: AbortSignal;
  cancelPendingRequests: () => void;
  isRequestCancelled: (error: any) => boolean;
}

/**
 * Hook to manage request cancellation with AbortController
 * Automatically cancels pending requests when component unmounts
 */
export function useCancellableRequest(): UseCancellableRequestReturn {
  const abortControllerRef = useRef<AbortController | null>(null);

  // Initialize AbortController
  useEffect(() => {
    abortControllerRef.current = new AbortController();

    // Cleanup: cancel pending requests on unmount
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Cancel all pending requests
  const cancelPendingRequests = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      // Create a new controller for future requests
      abortControllerRef.current = new AbortController();
    }
  }, []);

  // Check if error is from cancelled request
  const isRequestCancelled = useCallback((error: any): boolean => {
    return error?.name === "AbortError" || error?.name === "CancelledError";
  }, []);

  return {
    signal: abortControllerRef.current?.signal || new AbortController().signal,
    cancelPendingRequests,
    isRequestCancelled,
  };
}

/**
 * Hook to create cancellable async function
 */
export function useCancellableAsync<T extends (...args: any[]) => Promise<any>>(
  asyncFn: T,
  deps: React.DependencyList = []
): [T, () => void] {
  const { signal, cancelPendingRequests, isRequestCancelled } =
    useCancellableRequest();

  const cancellableFunction = useCallback(
    async (...args: Parameters<T>): Promise<ReturnType<T>> => {
      try {
        // Pass signal as first argument if function expects it
        const result = await asyncFn(...args, signal);
        return result;
      } catch (error) {
        if (!isRequestCancelled(error)) {
          throw error;
        }
        // Silently handle cancelled requests
        return Promise.reject(error);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [asyncFn, signal, isRequestCancelled, ...deps]
  ) as T;

  return [cancellableFunction, cancelPendingRequests];
}

/**
 * Utility to make fetch requests cancellable
 */
export async function fetchWithCancel<T>(
  url: string,
  options: RequestInit = {},
  signal?: AbortSignal
): Promise<T> {
  const response = await fetch(url, {
    ...options,
    signal,
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}

/**
 * Utility to add timeout to requests
 */
export function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  signal?: AbortSignal
): Promise<T> {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error(`Request timeout after ${timeoutMs}ms`));
    }, timeoutMs);

    // Listen for abort signal
    signal?.addEventListener("abort", () => {
      clearTimeout(timeoutId);
      reject(new Error("Request aborted"));
    });

    promise
      .then((result) => {
        clearTimeout(timeoutId);
        resolve(result);
      })
      .catch((error) => {
        clearTimeout(timeoutId);
        reject(error);
      });
  });
}

/**
 * Hook for sequential requests with cancellation
 */
export function useSequentialRequests<T>() {
  const { signal, cancelPendingRequests } = useCancellableRequest();
  const runningRef = useRef(false);

  const executeSequential = useCallback(
    async (
      requests: Array<() => Promise<T>>,
      onProgress?: (completed: number, total: number) => void
    ): Promise<T[]> => {
      if (runningRef.current) {
        throw new Error("Sequential requests already running");
      }

      runningRef.current = true;
      const results: T[] = [];

      try {
        for (let i = 0; i < requests.length; i++) {
          if (signal.aborted) {
            throw new Error("Requests cancelled");
          }

          const result = await requests[i]();
          results.push(result);

          if (onProgress) {
            onProgress(i + 1, requests.length);
          }
        }

        return results;
      } finally {
        runningRef.current = false;
      }
    },
    [signal]
  );

  return {
    executeSequential,
    cancelRequests: cancelPendingRequests,
    isRunning: runningRef.current,
  };
}

/**
 * Hook for parallel requests with cancellation
 */
export function useParallelRequests<T>() {
  const { signal, cancelPendingRequests } = useCancellableRequest();

  const executeParallel = useCallback(
    async (
      requests: Array<() => Promise<T>>,
      maxConcurrent: number = 5
    ): Promise<T[]> => {
      const results: T[] = [];
      const executing: Promise<void>[] = [];

      for (let i = 0; i < requests.length; i++) {
        if (signal.aborted) {
          throw new Error("Requests cancelled");
        }

        const request = requests[i]();
        const wrappedRequest = request.then((result) => {
          results[i] = result;
        });

        executing.push(wrappedRequest);

        if (executing.length >= maxConcurrent) {
          await Promise.race(executing);
          executing.splice(
            executing.findIndex((p) => p === wrappedRequest),
            1
          );
        }
      }

      await Promise.all(executing);
      return results;
    },
    [signal]
  );

  return {
    executeParallel,
    cancelRequests: cancelPendingRequests,
  };
}
