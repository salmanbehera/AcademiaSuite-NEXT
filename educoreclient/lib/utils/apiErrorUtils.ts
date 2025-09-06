// Utility: Global API error handler for React hooks and services
export function handleApiError(
  err: any,
  context: string,
  setError: (msg: string) => void
) {
  let message = 'An unexpected error occurred.';
  if (err && typeof err === 'object') {
    if (err.message) message = err.message;
    else if (typeof err.toString === 'function') message = err.toString();
  } else if (typeof err === 'string') {
    message = err;
  }
  setError(`${context}: ${message}`);
  console.error(`Error in ${context}:`, err);
}
