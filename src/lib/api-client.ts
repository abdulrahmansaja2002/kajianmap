export interface ApiSuccessBody<T> {
  success: true;
  message?: string;
  data: T;
}

export interface ApiErrorBody {
  success: false;
  message: string;
  errors?: Record<string, string[] | undefined>;
}

export class ApiError extends Error {
  status: number;
  fieldErrors?: Record<string, string[] | undefined>;

  constructor(message: string, status: number, fieldErrors?: Record<string, string[] | undefined>) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

interface ApiFetchOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  /** Attaches `Authorization: Bearer <token>` when provided — pass
   *  `useAuth().token` from mutation hooks that need it. */
  token?: string | null;
}

/**
 * Thin wrapper around `fetch` for talking to this app's own `/api/*`
 * routes. Every route responds with the same envelope (see
 * `server/helpers/api-response.ts`):
 *   success: { success: true, data, message? }
 *   error:   { success: false, message, errors? }
 *
 * Every TanStack Query hook in `hooks/queries/` goes through this so
 * parsing and error-normalization only lives in one place — callers just
 * get back `T` or a thrown `ApiError`.
 */
export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { body, token, headers, ...rest } = options;

  const res = await fetch(path, {
    ...rest,
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  // A 204 or a body-less error page won't parse as JSON — fall back to
  // null rather than letting `.json()` throw and mask the real status.
  const json = (await res.json().catch(() => null)) as
    | ApiSuccessBody<T>
    | ApiErrorBody
    | null;

  if (!res.ok || !json || json.success !== true) {
    const message = json?.message ?? `Permintaan gagal (${res.status}).`;
    const fieldErrors = json && json.success === false ? json.errors : undefined;
    throw new ApiError(message, res.status, fieldErrors);
  }

  return json.data;
}
