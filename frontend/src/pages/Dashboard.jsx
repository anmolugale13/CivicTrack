import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis,
  LineChart, Line, CartesianGrid, Legend,
} from "recharts";
import { AlertTriangle, Clock, ListChecks, TrendingUp } from "lucide-react";
import client from "../api/client";
import { PriorityBadge, StatusBadge } from "../components/Badge";

const STATUS_COLORS = {
  pending: "#7C88AC",
  acknowledged: "#EFB94F",
  in_progress: "#E8A93C",
  resolved: "#1F7A5C",
  rejected: "#B33F3F",
};
const PRIORITY_COLORS = { critical: "#B33F3F", high: "#E8A93C", medium: "#7C88AC", low: "#1F7A5C" };

export default function Dashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");

  const loadAnalytics = () => client.get("/api/analytics").then((r) => setAnalytics(r.data));
  const loadComplaints = (status) =>
    client.get("/api/complaints", { params: { sort: "priority", page_size: 100, ...(status ? { status } : {}) } })
      .then((r) => setComplaints(r.data.items));

  useEffect(() => { loadAnalytics(); }, []);
  useEffect(() => { loadComplaints(statusFilter); }, [statusFilter]);

  const changeStatus = async (id, status) => {
    await client.patch(`/api/complaints/${id}/status`, { status });
    loadComplaints(statusFilter);
    loadAnalytics();
  };

  if (!analytics) {
    return <div className="mx-auto max-w-7xl px-5 py-16"><div className="h-40 animate-pulse rounded-sm bg-ink-100" /></div>;
  }

  const statusData = Object.entries(analytics.by_status).map(([k, v]) => ({ name: k.replace("_", " "), value: v, key: k }));
  const priorityData = Object.entries(analytics.by_priority).map(([k, v]) => ({ name: k, value: v }));
  const categoryData = Object.entries(analytics.by_category).map(([k, v]) => ({ name: k, value: v })).sort((a, b) => b.value - a.value);

  return (
    <div className="mx-auto max-w-7xl px-5 py-12 md:px-8">
      <p className="font-mono text-xs uppercase tracking-widest text-slate-400">Operations</p>
      <h1 className="mt-2 font-display text-3xl font-semibold text-ink-900">Department dashboard</h1>

      {/* KPI row */}
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Total reports", value: analytics.total_complaints, icon: ListChecks },
          { label: "Resolved", value: analytics.resolved, icon: TrendingUp },
          { label: "Avg. resolution", value: analytics.avg_resolution_hours ? `${Math.round(analytics.avg_resolution_hours)}h` : "—", icon: Clock },
          { label: "SLA breaches", value: analytics.sla_breaches, icon: AlertTriangle, alert: analytics.sla_breaches > 0 },
        ].map((k) => (
          <div key={k.label} className={`rounded-sm border p-4 ${k.alert ? "border-brick-600/40 bg-brick-100" : "border-ink-100 bg-mist-100"}`}>
            <div className="flex items-center justify-between">
              <k.icon size={16} className={k.alert ? "text-brick-600" : "text-slate-400"} />
            </div>
            <p className="mt-3 font-display text-2xl font-semibold text-ink-900">{k.value}</p>
            <p className="text-xs text-slate-400">{k.label}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="mt-8 grid gap-5 lg:grid-cols-3">
        <div className="rounded-sm border border-ink-100 bg-mist-100 p-4 lg:col-span-1">
          <p className="font-display text-sm font-semibold text-ink-900">By status</p>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={45} outerRadius={75} paddingAngle={2}>
                {statusData.map((d) => <Cell key={d.key} fill={STATUS_COLORS[d.key] || "#7C88AC"} />)}
              </Pie>
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-sm border border-ink-100 bg-mist-100 p-4 lg:col-span-1">
          <p className="font-display text-sm font-semibold text-ink-900">By priority</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={priorityData}>
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="value" radius={[3, 3, 0, 0]}>
                {priorityData.map((d) => <Cell key={d.name} fill={PRIORITY_COLORS[d.name] || "#7C88AC"} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-sm border border-ink-100 bg-mist-100 p-4 lg:col-span-1">
          <p className="font-display text-sm font-semibold text-ink-900">By category</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={categoryData} layout="vertical" margin={{ left: 10 }}>
              <XAxis type="number" allowDecimals={false} tick={{ fontSize: 10 }} />
              <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 10 }} />
              <Tooltip />
              <Bar dataKey="value" fill="#16213E" radius={[0, 3, 3, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-5 rounded-sm border border-ink-100 bg-mist-100 p-4">
        <p className="font-display text-sm font-semibold text-ink-900">14-day trend: filed vs resolved</p>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={analytics.trend_last_14_days}>
            <CartesianGrid strokeDasharray="3 3" stroke="#DDE2D9" />
            <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(d) => d.slice(5)} />
            <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Line type="monotone" dataKey="filed" stroke="#E8A93C" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="resolved" stroke="#1F7A5C" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Case table */}
      <div className="mt-10">
        <div className="flex items-center justify-between">
          <p className="font-display text-lg font-semibold text-ink-900">Case queue</p>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-sm border border-ink-100 bg-mist-100 px-2 py-1.5 text-sm">
            <option value="">All statuses</option>
            {["pending", "acknowledged", "in_progress", "resolved", "rejected"].map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
          </select>
        </div>

        <div className="mt-4 overflow-x-auto rounded-sm border border-ink-100">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-ink-100 bg-mist-200/60 text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-3 py-2.5">Reference</th>
                <th className="px-3 py-2.5">Title</th>
                <th className="px-3 py-2.5">Priority</th>
                <th className="px-3 py-2.5">Status</th>
                <th className="px-3 py-2.5">Filed</th>
                <th className="px-3 py-2.5">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100 bg-mist-100">
              {complaints.map((c) => (
                <tr key={c.id}>
                  <td className="px-3 py-2.5 font-mono text-xs text-slate-400">
                    <Link to={`/reports/${c.id}`} className="hover:text-ink-900">{c.reference_code}</Link>
                  </td>
                  <td className="max-w-xs truncate px-3 py-2.5 font-medium text-ink-900">{c.title}</td>
                  <td className="px-3 py-2.5"><PriorityBadge priority={c.priority} /></td>
                  <td className="px-3 py-2.5"><StatusBadge status={c.status} /></td>
                  <td className="px-3 py-2.5 text-xs text-slate-400">{new Date(c.created_at).toLocaleDateString()}</td>
                  <td className="px-3 py-2.5">
                    <select
                      value={c.status}
                      onChange={(e) => changeStatus(c.id, e.target.value)}
                      className="rounded-sm border border-ink-100 bg-mist-100 px-1.5 py-1 text-xs"
                    >
                      {["pending", "acknowledged", "in_progress", "resolved", "rejected"].map((s) => (
                        <option key={s} value={s}>{s.replace("_", " ")}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
