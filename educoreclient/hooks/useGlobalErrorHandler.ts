"use client";

import { useCallback } from "react";
import { useToast } from "@/app/components/ui/ToastProvider";

export interface ErrorHandlerOptions {
  showToast?: boolean;
  logToConsole?: boolean;
  logToServer?: boolean;
  fallbackMessage?: string;
}

export const useGlobalErrorHandler = () => {
  const { showError } = useToast();

  const handleError = useCallback(
    (error: unknown, context: string, options: ErrorHandlerOptions = {}) => {
      const {
        // Do not show a toast by default. Callers that want an automatic
        // user-facing notification should pass `showToast: true` explicitly.
        showToast = false,
        logToConsole = true,
        logToServer = false,
        fallbackMessage = "An unexpected error occurred",
      } = options;

      // Extract error message
      let errorMessage = fallbackMessage;
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      }

      // Log to console
      if (logToConsole) {
        console.error(`[${context}]:`, error);
      }

      // Show toast notification only when explicitly requested by the caller
      if (showToast) {
        showError("Error", errorMessage);
      }

      // Log to server (optional)
      if (logToServer) {
        // TODO: Implement server logging
        // logErrorToServer(context, error, errorMessage);
      }

      return errorMessage;
    },
    [showError]
  );

  // Specific handlers for common operations
  const handleApiError = useCallback(
    (error: unknown, operation: string, options: ErrorHandlerOptions = {}) => {
      return handleError(error, `API ${operation}`, {
        fallbackMessage: `Failed to ${operation.toLowerCase()}. Please try again.`,
        ...options,
      });
    },
    [handleError]
  );

  const handleValidationError = useCallback(
    (error: unknown, field: string, options: ErrorHandlerOptions = {}) => {
      return handleError(error, `Validation ${field}`, {
        fallbackMessage: `Invalid ${field}. Please check your input.`,
        logToServer: false,
        ...options,
      });
    },
    [handleError]
  );

  return {
    handleError,
    handleApiError,
    handleValidationError,
  };
};

export default useGlobalErrorHandler;
