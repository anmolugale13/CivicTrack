import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t border-ink-100 bg-mist-100">
      <div className="mx-auto max-w-7xl px-5 py-10 md:px-8">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-sm bg-ink-900 font-display text-sm font-semibold text-amber-400">C</span>
              <span className="font-display text-base font-semibold text-ink-900">CivicTrack</span>
            </div>
            <p className="mt-3 max-w-xs text-sm text-slate-400">
              A public ledger for civic issues — reported by residents, triaged automatically, resolved by the departments responsible.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-10 text-sm sm:grid-cols-3">
            <div>
              <p className="font-semibold text-ink-900">Platform</p>
              <ul className="mt-3 space-y-2 text-slate-400">
                <li><Link to="/reports" className="hover:text-ink-900">Public Log</Link></li>
                <li><Link to="/submit" className="hover:text-ink-900">File a Report</Link></li>
                <li><Link to="/about" className="hover:text-ink-900">How It Works</Link></li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-ink-900">Access</p>
              <ul className="mt-3 space-y-2 text-slate-400">
                <li><Link to="/login" className="hover:text-ink-900">Staff Login</Link></li>
                <li><Link to="/register" className="hover:text-ink-900">Create Account</Link></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-10 flex flex-col gap-2 border-t border-ink-100 pt-6 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p>Built for the Smart Complaint & Public Issue Management hackathon track.</p>
          <p className="font-mono">v1.0.0 · demo dataset</p>
        </div>
      </div>
    </footer>
  );
}
