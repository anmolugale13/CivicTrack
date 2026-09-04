import { Link, NavLink, useNavigate } from "react-router-dom";
import { FileWarning, LayoutDashboard, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

const navLinkClass = ({ isActive }) =>
  `text-sm font-medium transition-colors ${
    isActive ? "text-ink-900" : "text-slate-400 hover:text-ink-900"
  }`;

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-ink-100 bg-mist-100/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-8">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-sm bg-ink-900 text-amber font-display text-lg font-semibold text-amber-400">
            C
          </span>
          <span className="font-display text-lg font-semibold tracking-tight text-ink-900">
            CivicTrack
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <NavLink to="/reports" className={navLinkClass}>Public Log</NavLink>
          <NavLink to="/submit" className={navLinkClass}>File a Report</NavLink>
          <NavLink to="/about" className={navLinkClass}>How It Works</NavLink>
          {(user?.role === "staff" || user?.role === "admin") && (
            <NavLink to="/dashboard" className={navLinkClass}>Dashboard</NavLink>
          )}
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          {user ? (
            <>
              <Link
                to="/my-reports"
                className="text-sm font-medium text-slate-400 hover:text-ink-900"
              >
                {user.name.split(" ")[0]}'s reports
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 rounded-sm border border-ink-100 px-3 py-1.5 text-sm font-medium text-ink-900 hover:border-ink-300"
              >
                <LogOut size={14} /> Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium text-slate-400 hover:text-ink-900">
                Log in
              </Link>
              <Link
                to="/submit"
                className="flex items-center gap-1.5 rounded-sm bg-ink-900 px-4 py-2 text-sm font-semibold text-mist-100 hover:bg-ink-700"
              >
                <FileWarning size={15} /> File a report
              </Link>
            </>
          )}
        </div>

        <button className="md:hidden" onClick={() => setOpen((o) => !o)} aria-label="Toggle menu">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-ink-100 bg-mist-100 px-5 py-4 md:hidden">
          <div className="flex flex-col gap-4">
            <NavLink onClick={() => setOpen(false)} to="/reports" className={navLinkClass}>Public Log</NavLink>
            <NavLink onClick={() => setOpen(false)} to="/submit" className={navLinkClass}>File a Report</NavLink>
            <NavLink onClick={() => setOpen(false)} to="/about" className={navLinkClass}>How It Works</NavLink>
            {(user?.role === "staff" || user?.role === "admin") && (
              <NavLink onClick={() => setOpen(false)} to="/dashboard" className={navLinkClass}>
                <span className="flex items-center gap-1.5"><LayoutDashboard size={14} /> Dashboard</span>
              </NavLink>
            )}
            {user ? (
              <>
                <NavLink onClick={() => setOpen(false)} to="/my-reports" className={navLinkClass}>My reports</NavLink>
                <button onClick={() => { setOpen(false); handleLogout(); }} className="text-left text-sm font-medium text-brick-600">
                  Log out
                </button>
              </>
            ) : (
              <NavLink onClick={() => setOpen(false)} to="/login" className={navLinkClass}>Log in</NavLink>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
