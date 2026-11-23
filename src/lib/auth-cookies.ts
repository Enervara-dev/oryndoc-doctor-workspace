import type { NextResponse } from "next/server";

export const ACCESS = "od_workspace_access";
export const REFRESH = "od_workspace_refresh";
export const CLINIC = "od_workspace_clinic";
export const centralUrl = () =>
  process.env.CENTRAL_API_URL ?? "http://localhost:4001";
export const reachUrl = () =>
  process.env.REACH_API_URL ?? "http://localhost:3001";
export const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

export function tokenExpiry(token: string): number {
  try {
    return (
      Number(
        JSON.parse(Buffer.from(token.split(".")[1], "base64url").toString())
          .exp,
      ) || 0
    );
  } catch {
    return 0;
  }
}
export function setSession(
  response: NextResponse,
  accessToken: string,
  upstream: Response,
) {
  response.cookies.set(ACCESS, accessToken, {
    ...cookieOptions,
    maxAge: Math.max(
      0,
      tokenExpiry(accessToken) - Math.floor(Date.now() / 1000),
    ),
  });
  const refresh = upstream.headers
    .getSetCookie()
    .find((cookie) => cookie.startsWith("oryndoc_central_refresh_token="));
  if (refresh)
    response.cookies.set(
      REFRESH,
      refresh.split(";")[0].split("=").slice(1).join("="),
      {
        ...cookieOptions,
        maxAge: 30 * 24 * 3600,
      },
    );
}
export function clearSession(response: NextResponse) {
  for (const name of [ACCESS, REFRESH, CLINIC])
    response.cookies.set(name, "", { ...cookieOptions, maxAge: 0 });
}
