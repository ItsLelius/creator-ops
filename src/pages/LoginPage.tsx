import { useState, type FormEvent } from "react";
import { AlertCircle, Eye, EyeOff, LoaderCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export function LoginPage() {
  const { signInWithPassword, authError, clearAuthError } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);

  const visibleError = localError || authError;
  const canSubmit = email.trim().length > 0 && password.length > 0 && !loggingIn;

  function resetErrors() {
    if (localError) {
      setLocalError("");
    }

    if (authError) {
      clearAuthError();
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSubmit) {
      return;
    }

    try {
      resetErrors();
      setLoggingIn(true);

      await signInWithPassword(email.trim(), password);
    } catch (error) {
      setLocalError(
        error instanceof Error ? error.message : "Failed to sign in.",
      );
    } finally {
      setLoggingIn(false);
    }
  }

  return (
    <main
      className="flex min-h-screen items-center justify-center p-6 text-slate-100"
      style={{
        backgroundColor: "#0B0D10",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
      }}
    >
      <style>
        {`
          @keyframes adiGradientMove {
            0% {
              background-position: 0% 50%;
              transform: translateY(0);
            }

            50% {
              background-position: 100% 50%;
              transform: translateY(-7px);
            }

            100% {
              background-position: 0% 50%;
              transform: translateY(0);
            }
          }

          @keyframes adiGlowPulse {
            0%, 100% {
              opacity: 0.42;
            }

            50% {
              opacity: 0.75;
            }
          }

          .adi-gradient-orb {
            animation: adiGradientMove 8s ease-in-out infinite;
            background-size: 190% 190%;
          }

          .adi-glow-layer {
            animation: adiGlowPulse 5s ease-in-out infinite;
          }
        `}
      </style>

      <section
        className="grid w-full overflow-hidden rounded-2xl border border-white/10 shadow-2xl shadow-black/50"
        style={{
          maxWidth: "660px",
          gridTemplateColumns: "1fr 1fr",
          backgroundColor: "#111318",
        }}
      >
        <div
          className="relative overflow-hidden p-7"
          style={{
            minHeight: "360px",
            backgroundColor: "#0B0D10",
          }}
        >
          <div className="absolute inset-0">
            <div
              className="adi-gradient-orb absolute rounded-full blur-3xl"
              style={{
                left: "-90px",
                bottom: "-95px",
                width: "280px",
                height: "280px",
                background:
                  "linear-gradient(135deg, #f8fafc 0%, #3b82f6 30%, #7c3aed 62%, #0B0D10 100%)",
              }}
            />

            <div
              className="adi-gradient-orb absolute rounded-full blur-3xl"
              style={{
                left: "70px",
                bottom: "25px",
                width: "150px",
                height: "210px",
                background:
                  "linear-gradient(180deg, #ffffff 0%, #2563eb 42%, #111318 100%)",
              }}
            />

            <div
              className="adi-glow-layer absolute inset-0"
              style={{
                background:
                  "radial-gradient(circle at bottom left, rgba(59,130,246,0.2), transparent 48%)",
              }}
            />

            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(120deg, rgba(139,92,246,0.1), transparent 42%, rgba(59,130,246,0.07))",
              }}
            />

            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage:
                  "linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(180deg, rgba(255,255,255,0.022) 1px, transparent 1px)",
                backgroundSize: "28px 28px",
              }}
            />
          </div>

          <div className="relative z-10 flex h-full flex-col justify-between">
            <p
              className="bg-gradient-to-b from-white via-slate-200 to-slate-500 bg-clip-text font-black text-transparent"
              style={{
                fontSize: "27px",
                letterSpacing: "-0.055em",
                filter: "drop-shadow(0 0 20px rgba(255,255,255,0.08))",
              }}
            >
              ADI Studios
            </p>

            <div style={{ maxWidth: "270px" }}>
              <p
                className="mb-3 font-black uppercase text-blue-300/80"
                style={{
                  fontSize: "10px",
                  letterSpacing: "0.2em",
                }}
              >
                Production Workspace
              </p>

              <h1
                className="font-black text-white"
                style={{
                  fontSize: "24px",
                  lineHeight: "1.1",
                  letterSpacing: "-0.045em",
                }}
              >
                Content production, managed in one place.
              </h1>

              <p
                className="mt-4 font-medium text-slate-400"
                style={{
                  fontSize: "12px",
                  lineHeight: "1.85",
                }}
              >
                A secure dashboard for Adi Studios to organize brand pages,
                team tasks, submissions, assets, and uploaded content.
              </p>
            </div>

            <p className="text-[10px] font-semibold text-slate-600">
              Internal access only
            </p>
          </div>
        </div>

        <div
          className="flex flex-col justify-center p-7"
          style={{
            minHeight: "360px",
            backgroundColor: "#111318",
          }}
        >
          <div className="mb-6">
            <p
              className="font-black uppercase text-blue-300/70"
              style={{
                fontSize: "10px",
                letterSpacing: "0.2em",
              }}
            >
              Secure Access
            </p>

            <h2
              className="mt-3 font-black text-white"
              style={{
                fontSize: "23px",
                letterSpacing: "-0.035em",
              }}
            >
              Sign in
            </h2>

            <p className="mt-2 text-xs font-medium leading-5 text-slate-500">
              Enter your credentials to continue.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
            <label className="block">
              <span className="mb-2 block text-[11px] font-bold text-slate-400">
                Email
              </span>

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
                placeholder="you@example.com"
                className="w-full rounded-lg border border-white/10 bg-[#0B0D10] px-3.5 py-2.5 text-xs font-semibold text-white outline-none transition placeholder:text-slate-700 hover:border-white/15 focus:border-blue-500/70 disabled:cursor-not-allowed disabled:opacity-60"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-[11px] font-bold text-slate-400">
                Password
              </span>

              <div className="flex items-center rounded-lg border border-white/10 bg-[#0B0D10] transition hover:border-white/15 focus-within:border-blue-500/70">
                <input
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    resetErrors();
                  }}
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  disabled={loggingIn}
                  placeholder="Enter password"
                  className="min-w-0 flex-1 bg-transparent px-3.5 py-2.5 text-xs font-semibold text-white outline-none placeholder:text-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  disabled={loggingIn}
                  className="flex h-10 w-10 shrink-0 items-center justify-center text-slate-500 transition hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </label>

            {visibleError && (
              <div
                role="alert"
                className="flex gap-2 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-xs font-semibold leading-5 text-red-300"
              >
                <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>{visibleError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={!canSubmit}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-500 px-4 py-2.5 text-xs font-black text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loggingIn && <LoaderCircle className="h-3.5 w-3.5 animate-spin" />}
              {loggingIn ? "Signing in..." : "Sign In"}
            </button>

            <p className="pt-1 text-center text-[10px] font-semibold text-slate-600">
              Authorized Adi Studios accounts only.
            </p>
          </form>
        </div>
      </section>
    </main>
  );
}