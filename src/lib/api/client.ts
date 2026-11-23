import "server-only";
import { getWorkspace } from "../workspace";
import { reachUrl } from "../auth-cookies";
export class ReachApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ReachApiError";
  }
}
export const isApiConfigured = () => true;
export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const { identity, clinicId } = await getWorkspace();
  if (!path.startsWith("/") || path.includes("..") || path.includes("://"))
    throw new Error("Invalid resource");
  const response = await fetch(
    `${reachUrl()}/clinics/${clinicId}${path === "/" ? "" : path}`,
    {
      ...options,
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
        Authorization: `Bearer ${identity.accessToken}`,
      },
    },
  );
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new ReachApiError(
      response.status,
      Array.isArray(body.message)
        ? body.message.join(", ")
        : body.message || `Reach returned ${response.status}`,
    );
  }
  return response.status === 204
    ? (undefined as T)
    : ((await response.json()) as T);
}
