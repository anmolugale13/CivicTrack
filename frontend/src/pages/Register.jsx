import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      navigate("/my-reports");
    } catch (err) {
      setError(err.response?.data?.detail || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-md flex-col px-5 py-20 md:px-8">
      <p className="font-mono text-xs uppercase tracking-widest text-slate-400">Access</p>
      <h1 className="mt-2 font-display text-3xl font-semibold text-ink-900">Create an account</h1>
      <p className="mt-2 text-sm text-slate-600">Track your own reports and get status updates over time.</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
          <label className="text-sm font-medium text-ink-900">Name</label>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required
            className="mt-1.5 w-full rounded-sm border border-ink-100 bg-mist-100 px-3 py-2.5 text-sm outline-none focus:border-ink-300" />
        </div>
        <div>
          <label className="text-sm font-medium text-ink-900">Email</label>
          <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required
            className="mt-1.5 w-full rounded-sm border border-ink-100 bg-mist-100 px-3 py-2.5 text-sm outline-none focus:border-ink-300" />
        </div>
        <div>
          <label className="text-sm font-medium text-ink-900">Password</label>
          <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={6}
            className="mt-1.5 w-full rounded-sm border border-ink-100 bg-mist-100 px-3 py-2.5 text-sm outline-none focus:border-ink-300" />
        </div>
        {error && <p className="text-sm text-brick-600">{error}</p>}
        <button type="submit" disabled={loading} className="w-full rounded-sm bg-ink-900 px-5 py-3 text-sm font-semibold text-mist-100 hover:bg-ink-700 disabled:opacity-60">
          {loading ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className="mt-6 text-sm text-slate-400">
        Already registered? <Link to="/login" className="font-medium text-ink-900 underline">Log in</Link>
      </p>
    </div>
  );
}
