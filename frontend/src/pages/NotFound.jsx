import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg px-5 py-32 text-center">
      <p className="font-mono text-sm text-slate-400">404</p>
      <h1 className="mt-2 font-display text-3xl font-semibold text-ink-900">This case doesn't exist.</h1>
      <Link to="/" className="mt-6 inline-block rounded-sm bg-ink-900 px-5 py-2.5 text-sm font-semibold text-mist-100 hover:bg-ink-700">
        Back home
      </Link>
    </div>
  );
}
