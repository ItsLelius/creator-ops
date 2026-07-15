import { useEffect, useState, type FormEvent } from "react";
import {
  AlertCircle,
  Eye,
  EyeOff,
  LoaderCircle,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const REMEMBERED_EMAIL_KEY = "adistudios_remembered_email";

export function LoginPage() {
  const { signInWithPassword, authError, clearAuthError } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [localError, setLocalError] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);

  // Prefill from a previously remembered email, if any.
  useEffect(() => {
    const remembered = window.localStorage.getItem(REMEMBERED_EMAIL_KEY);
    if (remembered) {
      setEmail(remembered);
      setRememberMe(true);
    }
  }, []);

  const visibleError = localError || authError;
  const canSubmit = email.trim().length > 0 && password.length > 0 && !loggingIn;

  function resetErrors() {
    if (localError) setLocalError("");
    if (authError) clearAuthError();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSubmit) return;

    try {
      resetErrors();
      setLoggingIn(true);

      await signInWithPassword(email.trim(), password);

      if (rememberMe) {
        window.localStorage.setItem(REMEMBERED_EMAIL_KEY, email.trim());
      } else {
        window.localStorage.removeItem(REMEMBERED_EMAIL_KEY);
      }
    } catch (error) {
      setLocalError(
        error instanceof Error ? error.message : "Failed to login.",
      );
    } finally {
      setLoggingIn(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#07090D] p-4 font-sans antialiased">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/3 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/10 blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 h-[360px] w-[360px] rounded-full bg-violet-500/10 blur-[120px]" />
      </div>

      <section className="relative w-full max-w-[380px] overflow-hidden rounded-[36px] border border-white/15 bg-gradient-to-b from-[#1B1D23] to-[#111318] p-7 shadow-[0_30px_100px_rgba(0,0,0,0.55)] sm:p-8">
        {/* Brand row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-[#0B0D10] text-xs font-semibold text-white">
              AS
            </div>
            <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              Adi Studios
            </span>
          </div>

          <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-medium text-slate-400">
            Admin Portal
          </span>
        </div>

        <h1 className="mt-8 text-2xl font-semibold tracking-tight text-white">
          Welcome back,
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Please enter your details.
        </p>

        <form className="mt-7 space-y-3.5" onSubmit={handleSubmit} noValidate>
          <div
            className={[
              "rounded-full border bg-white/[0.06] px-5 py-3.5 transition",
              visibleError
                ? "border-red-500/40"
                : "border-white/10 focus-within:border-blue-500/50",
            ].join(" ")}
          >
            <input
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                resetErrors();
              }}
              type="email"
              inputMode="email"
              autoComplete="username"
              autoFocus
              disabled={loggingIn}
              placeholder="Email ID"
              className="w-full min-w-0 bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-500 disabled:opacity-60"
            />
          </div>

          <div
            className={[
              "flex items-center gap-2 rounded-full border bg-white/[0.06] px-5 py-3.5 transition",
              visibleError
                ? "border-red-500/40"
                : "border-white/10 focus-within:border-blue-500/50",
            ].join(" ")}
          >
            <input
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                resetErrors();
              }}
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              disabled={loggingIn}
              placeholder="Password"
              className="w-full min-w-0 bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-500 disabled:opacity-60"
            />

            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="shrink-0 text-slate-500 transition hover:text-white"
            >
              {showPassword ? (
                <EyeOff className="h-[18px] w-[18px]" />
              ) : (
                <Eye className="h-[18px] w-[18px]" />
              )}
            </button>
          </div>

          <div className="flex items-center justify-between px-1.5 pt-1 text-sm">
            <label className="flex items-center gap-2 text-slate-400">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(event) => setRememberMe(event.target.checked)}
                className="h-4 w-4 rounded border-white/20 bg-white/10 accent-blue-500"
              />
              Remember me
            </label>

            <button
              type="button"
              onClick={() =>
                alert("Later: trigger password reset email via Supabase.")
              }
              className="font-medium text-slate-400 transition hover:text-white"
            >
              Forgot password?
            </button>
          </div>

          {visibleError && (
            <p
              role="alert"
              className="flex items-center gap-1.5 px-1.5 text-sm text-red-400"
            >
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              {visibleError}
            </p>
          )}

          <button
            type="submit"
            disabled={!canSubmit}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-white px-4 py-3.5 text-sm font-bold uppercase tracking-wide text-[#0A0A0D] transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loggingIn && (
              <LoaderCircle className="h-4 w-4 animate-spin text-[#0A0A0D]" />
            )}
            {loggingIn ? "Signing In" : "Sign In"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Don't have access?{" "}
          <span className="font-semibold text-slate-300">
            Contact your admin.
          </span>
        </p>
      </section>
    </main>
  );
}