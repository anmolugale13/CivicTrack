import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(email, password);
      navigate(user.role === "citizen" ? "/my-reports" : "/dashboard");
    } catch (err) {
      setError(err.response?.data?.detail || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role) => {
    if (role === "admin") { setEmail("admin@civictrack.gov"); setPassword("admin123"); }
    if (role === "staff") { setEmail("staff@civictrack.gov"); setPassword("staff123"); }
    if (role === "citizen") { setEmail("citizen@example.com"); setPassword("citizen123"); }
  };

  return (
    <div className="mx-auto flex max-w-md flex-col px-5 py-20 md:px-8">
      <p className="font-mono text-xs uppercase tracking-widest text-slate-400">Access</p>
      <h1 className="mt-2 font-display text-3xl font-semibold text-ink-900">Log in</h1>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
          <label className="text-sm font-medium text-ink-900">Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
            className="mt-1.5 w-full rounded-sm border border-ink-100 bg-mist-100 px-3 py-2.5 text-sm outline-none focus:border-ink-300" />
        </div>
        <div>
          <label className="text-sm font-medium text-ink-900">Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
            className="mt-1.5 w-full rounded-sm border border-ink-100 bg-mist-100 px-3 py-2.5 text-sm outline-none focus:border-ink-300" />
        </div>
        {error && <p className="text-sm text-brick-600">{error}</p>}
        <button type="submit" disabled={loading} className="w-full rounded-sm bg-ink-900 px-5 py-3 text-sm font-semibold text-mist-100 hover:bg-ink-700 disabled:opacity-60">
          {loading ? "Signing in…" : "Log in"}
        </button>
      </form>

      <div className="mt-6 rounded-sm border border-ink-100 bg-mist-100 p-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Demo accounts</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button onClick={() => fillDemo("admin")} className="rounded-sm border border-ink-100 px-3 py-1.5 text-xs font-medium hover:border-ink-900">Admin</button>
          <button onClick={() => fillDemo("staff")} className="rounded-sm border border-ink-100 px-3 py-1.5 text-xs font-medium hover:border-ink-900">Staff</button>
          <button onClick={() => fillDemo("citizen")} className="rounded-sm border border-ink-100 px-3 py-1.5 text-xs font-medium hover:border-ink-900">Citizen</button>
        </div>
      </div>

      <p className="mt-6 text-sm text-slate-400">
        No account? <Link to="/register" className="font-medium text-ink-900 underline">Register as a citizen</Link>
      </p>
    </div>
  );
}
