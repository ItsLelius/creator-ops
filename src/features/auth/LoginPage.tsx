import { useNavigate } from "react-router-dom";

export function LoginPage() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-white">
      <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">
        <h1 className="text-3xl font-bold">Welcome to Adi Studios</h1>
        <p className="mt-2 text-slate-400">
          Choose a role for now. We will connect real login later.
        </p>

        <div className="mt-8 space-y-3">
          <button
            onClick={() => navigate("/admin/dashboard")}
            className="w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-500"
          >
            Continue as Admin
          </button>

          <button
            onClick={() => navigate("/employee/dashboard")}
            className="w-full rounded-xl border border-slate-700 px-4 py-3 font-semibold text-slate-200 transition hover:bg-slate-800"
          >
            Continue as Employee
          </button>
        </div>
      </div>
    </div>
  );
}