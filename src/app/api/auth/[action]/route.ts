import { NextRequest, NextResponse } from "next/server";
import {
  REFRESH,
  centralUrl,
  setSession,
  clearSession,
} from "@/lib/auth-cookies";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ action: string }> },
) {
  const origin = process.env.APP_ORIGIN ?? request.nextUrl.origin;
  if (request.headers.get("origin") !== origin)
    return NextResponse.json(
      { error: "Invalid request origin" },
      { status: 403 },
    );
  const { action } = await context.params;
  const paths: Record<string, string> = {
    login: "login",
    verify: "mfa/verify",
    refresh: "refresh",
    logout: "logout",
  };
  if (!paths[action])
    return NextResponse.json({ error: "Unknown action" }, { status: 404 });
  const refresh = request.cookies.get(REFRESH)?.value;
  try {
    const upstream = await fetch(`${centralUrl()}/v1/auth/${paths[action]}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(refresh
          ? { Cookie: `oryndoc_central_refresh_token=${refresh}` }
          : {}),
      },
      body: ["login", "verify"].includes(action)
        ? JSON.stringify(await request.json())
        : undefined,
      cache: "no-store",
      redirect: "error",
      signal: AbortSignal.timeout(10000),
    });
    const body = upstream.status === 204 ? {} : await upstream.json();
    const response = NextResponse.json(
      {
        status: body.status,
        mfaToken: body.mfaToken,
        devMfaCode: body.devMfaCode,
        error: body.message,
      },
      { status: upstream.ok ? 200 : upstream.status },
    );
    response.headers.set("Cache-Control", "no-store");
    if (body.accessToken && upstream.ok)
      setSession(response, body.accessToken, upstream);
    if (action === "logout") clearSession(response);
    return response;
  } catch {
    const response = NextResponse.json(
      { error: "Central is temporarily unavailable. Please retry." },
      { status: 503 },
    );
    if (action === "logout") clearSession(response);
    return response;
  }
}
