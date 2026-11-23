"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { AlertCircle } from "lucide-react";
import { AuthShell } from "@/components/brand/auth-shell";
import { Button } from "@/components/ui";
import { fieldControlClass } from "@/components/reach/live-form";
import { cn } from "@/lib/utils";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [mfa, setMfa] = useState<string>();
  const [dev, setDev] = useState<string>();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const codeInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (mfa) codeInput.current?.focus();
  }, [mfa]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await fetch(`/api/auth/${mfa ? "verify" : "login"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mfa ? { mfaToken: mfa, code } : { identifier: email, password }),
      });
      const result = await response.json();
      if (!response.ok) {
        if (mfa) {
          setMfa(undefined);
          setCode("");
        }
        throw new Error(result.error ?? "Sign-in failed. Check your details and try again.");
      }
      if (result.status === "MFA_REQUIRED") {
        setMfa(result.mfaToken);
        setDev(result.devMfaCode);
        return;
      }
      // A full navigation discards any previous account's client router cache.
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.assign("/choose-clinic");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Sign-in failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell
      title={mfa ? "Check your email" : "Sign in"}
      description={mfa ? `Enter the 6-digit code sent to ${email}.` : "Use your Oryndoc account. It's the same one you use for Oryndoc Central."}
    >
      <form onSubmit={submit} noValidate={false} className="space-y-4 rounded-md border border-border bg-surface p-5 sm:p-6">
        {error && (
          <div role="alert" className="flex gap-2 rounded-sm bg-danger-subtle px-3 py-2.5 text-[13px] text-danger">
            <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}
        {mfa ? (
          <div className="space-y-1">
            <label htmlFor="code" className="block text-[13px] font-medium text-text-primary">
              Verification code
            </label>
            <input
              ref={codeInput}
              id="code"
              className={cn(fieldControlClass, "h-11 text-center text-lg tracking-[0.4em] tabular-nums")}
              autoComplete="one-time-code"
              inputMode="numeric"
              pattern="\d{6}"
              maxLength={6}
              spellCheck={false}
              required
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            />
            {dev && <p className="text-xs text-text-tertiary">Development code: {dev}</p>}
          </div>
        ) : (
          <>
            <div className="space-y-1">
              <label htmlFor="identifier" className="block text-[13px] font-medium text-text-primary">
                Email or verified mobile number
              </label>
              <input
                id="identifier"
                className={cn(fieldControlClass, "h-10")}
                autoComplete="username"
                spellCheck={false}
                autoCapitalize="none"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="password" className="block text-[13px] font-medium text-text-primary">
                Password
              </label>
              <input
                id="password"
                className={cn(fieldControlClass, "h-10")}
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </>
        )}
        <Button type="submit" size="lg" loading={busy} className="w-full">
          {busy ? (mfa ? "Verifying…" : "Signing in…") : mfa ? "Verify and continue" : "Sign in"}
        </Button>
        {mfa && (
          <button
            type="button"
            onClick={() => {
              setMfa(undefined);
              setCode("");
              setError("");
            }}
            className="focus-ring w-full rounded-xs text-center text-[13px] font-medium text-brand-text hover:underline"
          >
            Use a different account
          </button>
        )}
      </form>
    </AuthShell>
  );
}
