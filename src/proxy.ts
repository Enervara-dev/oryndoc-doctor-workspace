import { NextRequest, NextResponse } from "next/server";
import {
  ACCESS,
  REFRESH,
  centralUrl,
  tokenExpiry,
  setSession,
  clearSession,
} from "./lib/auth-cookies";

// Short single-flight window for concurrent requests from the same browser.
const pending = new Map<
  string,
  Promise<{ response: Response; body: { accessToken?: string } }>
>();
export async function proxy(request: NextRequest) {
  const token = request.cookies.get(ACCESS)?.value;
  if (token && tokenExpiry(token) > Date.now() / 1000 + 30)
    return NextResponse.next();
  const refresh = request.cookies.get(REFRESH)?.value;
  if (refresh) {
    try {
      let flight = pending.get(refresh);
      if (!flight) {
        flight = fetch(`${centralUrl()}/v1/auth/refresh`, {
          method: "POST",
          headers: { Cookie: `oryndoc_central_refresh_token=${refresh}` },
          signal: AbortSignal.timeout(5000),
          cache: "no-store",
          redirect: "error",
        }).then(async (response) => ({
          response,
          body: await response.json(),
        }));
        pending.set(refresh, flight);
        setTimeout(() => pending.delete(refresh), 3000);
      }
      const { response, body } = await flight;
      if (response.ok && body.accessToken) {
        request.cookies.set(ACCESS, body.accessToken);
        const headers = new Headers(request.headers);
        headers.set("cookie", request.cookies.toString());
        const next = NextResponse.next({ request: { headers } });
        setSession(next, body.accessToken, response);
        return next;
      }
      if (response.status >= 500)
        return new NextResponse(
          "Sign-in service is temporarily unavailable. Please retry.",
          { status: 503 },
        );
    } catch {
      return new NextResponse(
        "Sign-in service is temporarily unavailable. Please retry.",
        { status: 503 },
      );
    }
  }
  const response = NextResponse.redirect(new URL("/login", request.url));
  clearSession(response);
  return response;
}
export const config = { matcher: ["/", "/reach/:path*", "/choose-clinic"] };
