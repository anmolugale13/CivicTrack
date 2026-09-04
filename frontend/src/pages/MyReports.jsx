import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import client from "../api/client";
import { PriorityBadge, StatusBadge } from "../components/Badge";
import { useAuth } from "../context/AuthContext";

export default function MyReports() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client.get("/api/complaints", { params: { page_size: 100, sort: "newest" } }).then((r) => {
      setItems(r.data.items.filter((c) => c.reporter_name === user?.name));
      setLoading(false);
    });
  }, [user]);

  return (
    <div className="mx-auto max-w-5xl px-5 py-12 md:px-8">
      <p className="font-mono text-xs uppercase tracking-widest text-slate-400">Your Activity</p>
      <h1 className="mt-2 font-display text-3xl font-semibold text-ink-900">Reports you've filed</h1>

      <div className="mt-8 divide-y divide-ink-100 border-y border-ink-100">
        {loading ? (
          <div className="h-24 animate-pulse bg-mist-200/40" />
        ) : items.length === 0 ? (
          <div className="py-16 text-center">
            <p className="font-display text-lg text-ink-900">You haven't filed any reports yet.</p>
            <Link to="/submit" className="mt-3 inline-block text-sm font-medium text-amber-600 underline">File your first report</Link>
          </div>
        ) : (
          items.map((c) => (
            <Link to={`/reports/${c.id}`} key={c.id} className="flex items-center justify-between gap-3 py-4 hover:bg-mist-200/40">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-slate-400">{c.reference_code}</span>
                  <PriorityBadge priority={c.priority} />
                </div>
                <p className="mt-1 truncate font-display text-base font-medium text-ink-900">{c.title}</p>
              </div>
              <StatusBadge status={c.status} />
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
