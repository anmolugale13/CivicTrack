import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowUp, MapPin, ShieldAlert } from "lucide-react";
import client, { API_BASE } from "../api/client";
import { PriorityBadge, StatusBadge } from "../components/Badge";
import { useAuth } from "../context/AuthContext";

const NEXT_STATUSES = {
  pending: ["acknowledged", "rejected"],
  acknowledged: ["in_progress", "rejected"],
  in_progress: ["resolved", "rejected"],
  resolved: [],
  rejected: [],
};

export default function ReportDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [complaint, setComplaint] = useState(null);
  const [error, setError] = useState("");
  const [note, setNote] = useState("");
  const isStaff = user?.role === "staff" || user?.role === "admin";

  const load = () => {
    client.get(`/api/complaints/${id}`).then((r) => setComplaint(r.data)).catch(() => setError("Report not found."));
  };

  useEffect(() => { load(); }, [id]);

  const upvote = async () => {
    try {
      await client.post(`/api/complaints/${id}/upvote`);
      load();
    } catch (err) {
      alert(err.response?.data?.detail || "Couldn't register vote");
    }
  };

  const changeStatus = async (newStatus) => {
    try {
      await client.patch(`/api/complaints/${id}/status`, { status: newStatus, message: note || undefined });
      setNote("");
      load();
    } catch (err) {
      alert(err.response?.data?.detail || "Couldn't update status");
    }
  };

  if (error) {
    return <div className="mx-auto max-w-3xl px-5 py-24 text-center">
      <p className="font-display text-2xl text-ink-900">{error}</p>
      <Link to="/reports" className="mt-4 inline-block text-sm text-amber-600 underline">Back to the public log</Link>
    </div>;
  }

  if (!complaint) {
    return <div className="mx-auto max-w-3xl px-5 py-24">
      <div className="h-6 w-1/2 animate-pulse rounded-sm bg-ink-100" />
      <div className="mt-4 h-40 animate-pulse rounded-sm bg-ink-100" />
    </div>;
  }

  return (
    <div className="mx-auto max-w-4xl px-5 py-12 md:px-8">
      <Link to="/reports" className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-ink-900">
        <ArrowLeft size={14} /> Back to public log
      </Link>

      <div className="mt-6 border-b border-ink-100 pb-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-xs text-slate-400">{complaint.reference_code}</span>
          <PriorityBadge priority={complaint.priority} />
          <StatusBadge status={complaint.status} />
        </div>
        <h1 className="mt-3 font-display text-3xl font-semibold text-ink-900">{complaint.title}</h1>
        <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-slate-400">
          <span>{complaint.category?.name}</span>
          {complaint.location_text && (
            <span className="flex items-center gap-1"><MapPin size={13} /> {complaint.location_text}</span>
          )}
          <span>Filed by {complaint.is_anonymous ? "an anonymous citizen" : complaint.reporter_name}</span>
        </div>
      </div>

      <div className="grid gap-8 py-8 md:grid-cols-[1.4fr_1fr]">
        <div>
          {complaint.image_path && (
            <img src={`${API_BASE}${complaint.image_path}`} alt="" className="mb-6 max-h-96 w-full rounded-sm object-cover" />
          )}
          <p className="whitespace-pre-line text-sm leading-relaxed text-ink-900">{complaint.description}</p>

          {complaint.possible_duplicate_of && (
            <div className="mt-5 flex items-start gap-2 rounded-sm border border-amber-600/30 bg-amber-100 p-3 text-xs text-amber-600">
              <ShieldAlert size={16} className="mt-0.5 shrink-0" />
              <p>Flagged as a possible duplicate of report #{complaint.possible_duplicate_of} by the similarity engine, so staff can merge effort instead of working it twice.</p>
            </div>
          )}

          <button
            onClick={upvote}
            className="mt-6 flex items-center gap-2 rounded-sm border border-ink-100 px-4 py-2 text-sm font-semibold text-ink-900 hover:border-amber-600 hover:text-amber-600"
          >
            <ArrowUp size={14} /> Back this report ({complaint.upvotes})
          </button>

          {isStaff && (
            <div className="mt-8 rounded-sm border border-ink-100 bg-mist-100 p-4">
              <p className="font-display text-sm font-semibold text-ink-900">Staff actions</p>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add a note for this status change (optional)"
                className="mt-3 w-full rounded-sm border border-ink-100 bg-mist-100 p-2 text-sm outline-none focus:border-ink-300"
                rows={2}
              />
              <div className="mt-3 flex flex-wrap gap-2">
                {NEXT_STATUSES[complaint.status]?.map((s) => (
                  <button
                    key={s}
                    onClick={() => changeStatus(s)}
                    className="rounded-sm bg-ink-900 px-3 py-1.5 text-xs font-semibold capitalize text-mist-100 hover:bg-ink-700"
                  >
                    Mark {s.replace("_", " ")}
                  </button>
                ))}
                {NEXT_STATUSES[complaint.status]?.length === 0 && (
                  <p className="text-xs text-slate-400">This case is closed.</p>
                )}
              </div>
            </div>
          )}
        </div>

        <aside>
          <div className="rounded-sm border border-ink-100 bg-mist-100 p-4">
            <p className="font-display text-sm font-semibold text-ink-900">Priority score</p>
            <div className="mt-2 flex items-end gap-2">
              <span className="font-display text-3xl font-semibold text-ink-900">{complaint.priority_score}</span>
              <span className="mb-1 text-xs text-slate-400">/ 100</span>
            </div>
            <div className="mt-2 h-1.5 w-full rounded-full bg-ink-100">
              <div className="h-1.5 rounded-full bg-amber-600" style={{ width: `${complaint.priority_score}%` }} />
            </div>
            <p className="mt-2 text-xs text-slate-400">
              Assigned to <span className="font-medium text-ink-900">{complaint.assigned_department}</span>
            </p>
          </div>

          <div className="mt-6">
            <p className="font-display text-sm font-semibold text-ink-900">Case timeline</p>
            <ol className="mt-4 space-y-5 border-l border-ink-100 pl-4">
              {complaint.updates.map((u) => (
                <li key={u.id} className="relative">
                  <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full border-2 border-mist-100 bg-ink-900" />
                  <p className="text-xs font-mono text-slate-400">{new Date(u.created_at).toLocaleString()}</p>
                  <p className="mt-1 text-sm font-medium text-ink-900">{u.author_name}</p>
                  <p className="mt-0.5 text-sm text-slate-600">{u.message}</p>
                </li>
              ))}
            </ol>
          </div>
        </aside>
      </div>
    </div>
  );
}
