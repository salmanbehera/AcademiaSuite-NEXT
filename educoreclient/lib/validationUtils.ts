// Centralized helpers to extract server-side validation errors and map them to form error shape
export function extractValidationErrors(
  err: any
): Record<string, string> | null {
  if (!err) return null;

  // Common places where validation errors may be attached
  const respData = err?.response?.data;
  const candidate = err?.validation ?? respData?.errors ?? respData ?? null;
  if (!candidate) return null;

  // If the server returned a general error payload (e.g. { message, type, trace })
  // and it does not contain a dedicated `errors` object, treat it as a
  // non-validation error so we don't map the global `message` into form fields.
  if (respData && !respData.errors) {
    const nonFieldKeys = [
      "message",
      "title",
      "type",
      "status",
      "trace",
      "detail",
      "instance",
    ];
    const keys = Object.keys(respData);
    const hasOnlyNonFieldKeys =
      keys.length > 0 && keys.every((k) => nonFieldKeys.includes(k));
    if (hasOnlyNonFieldKeys) return null;
  }

  // If the payload is already in the desired field->message shape
  if (typeof candidate === "object" && !Array.isArray(candidate)) {
    const mapped: Record<string, string> = {};
    Object.entries(candidate).forEach(([key, value]) => {
      // If the value is an array (e.g., ["msg1","msg2"]), take the first
      // message. If it's an object, stringify as a fallback.
      if (Array.isArray(value)) mapped[key] = String(value[0] ?? "");
      else if (typeof value === "object" && value !== null)
        mapped[key] = JSON.stringify(value);
      else mapped[key] = String(value ?? "");
    });
    return mapped;
  }

  // If candidate is an array of issues (e.g., zod-like), try to map
  if (Array.isArray(candidate)) {
    const mapped: Record<string, string> = {};
    candidate.forEach((issue: any) => {
      // issue.path may be ['field'] and issue.message may exist
      if (issue && issue.path && issue.message) {
        const field = Array.isArray(issue.path)
          ? String(issue.path[0])
          : String(issue.path);
        if (!mapped[field]) mapped[field] = issue.message;
      }
    });
    return Object.keys(mapped).length ? mapped : null;
  }

  return null;
}

// Apply extracted validation errors to a form error setter
export function applyValidationToForm(
  setFormErrors: (
    updater: (prev: Record<string, string>) => Record<string, string>
  ) => void,
  err: any
): boolean {
  const validation = extractValidationErrors(err);
  if (!validation) return false;
  setFormErrors((prev) => ({ ...prev, ...validation }));
  return true;
}
