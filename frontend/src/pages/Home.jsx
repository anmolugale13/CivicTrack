import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, ClipboardList, Gauge, ShieldCheck, Sparkles } from "lucide-react";
import client from "../api/client";
import { PriorityBadge, StatusBadge } from "../components/Badge";

const STEPS = [
  {
    n: "01",
    title: "Report",
    body: "A resident files an issue with a photo, location, and description — in under a minute, no login required.",
    icon: ClipboardList,
  },
  {
    n: "02",
    title: "Triage",
    body: "The scoring engine reads the report, weighs it against category risk and duplicate reports, and assigns a priority automatically.",
    icon: Sparkles,
  },
  {
    n: "03",
    title: "Resolve",
    body: "The right department is notified, works the case against its SLA clock, and the resident is updated at every step.",
    icon: ShieldCheck,
  },
];

export default function Home() {
  const [analytics, setAnalytics] = useState(null);
  const [recent, setRecent] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    client.get("/api/analytics").then((r) => setAnalytics(r.data)).catch(() => {});
    client.get("/api/complaints?sort=priority&page_size=4").then((r) => setRecent(r.data.items)).catch(() => {});
    client.get("/api/complaints/categories").then((r) => setCategories(r.data)).catch(() => {});
  }, []);

  const stats = analytics
    ? [
        { label: "Reports logged", value: analytics.total_complaints },
        { label: "Resolved", value: analytics.resolved },
        { label: "Avg. resolution", value: analytics.avg_resolution_hours ? `${Math.round(analytics.avg_resolution_hours)}h` : "—" },
        { label: "SLA breaches", value: analytics.sla_breaches },
      ]
    : [];

  return (
    <div>
      {/* HERO */}
      <section className="border-b border-ink-100 bg-mist-100">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 md:grid-cols-[1.1fr_0.9fr] md:px-8 md:py-24">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <p className="font-mono text-xs uppercase tracking-widest text-slate-400">
              Public Issue Register
            </p>
            <h1 className="mt-4 max-w-xl font-display text-4xl font-semibold leading-[1.1] text-ink-900 md:text-6xl">
              Every civic complaint, logged, scored, and followed through.
            </h1>
            <p className="mt-6 max-w-lg text-base text-slate-600 md:text-lg">
              CivicTrack gives residents a single place to report problems and gives departments
              a working queue — automatically prioritized, deduplicated, and timed against a
              resolution clock.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                to="/submit"
                className="flex items-center gap-2 rounded-sm bg-ink-900 px-5 py-3 text-sm font-semibold text-mist-100 transition hover:bg-ink-700"
              >
                File a report <ArrowRight size={16} />
              </Link>
              <Link
                to="/reports"
                className="flex items-center gap-2 rounded-sm border border-ink-300/60 px-5 py-3 text-sm font-semibold text-ink-900 transition hover:border-ink-900"
              >
                Browse the public log
              </Link>
            </div>

            <div className="mt-12 grid grid-cols-2 gap-6 sm:grid-cols-4">
              {(stats.length ? stats : Array(4).fill({ label: "—", value: "—" })).map((s, i) => (
                <div key={i} className="border-l-2 border-amber pl-3">
                  <p className="font-display text-2xl font-semibold text-ink-900">{s.value}</p>
                  <p className="text-xs text-slate-400">{s.label}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
            className="rounded-sm border border-ink-100 bg-mist-100/60 p-5 shadow-panel"
          >
            <div className="flex items-center justify-between border-b border-ink-100 pb-3">
              <p className="font-display text-sm font-semibold text-ink-900">Latest on the log</p>
              <span className="flex items-center gap-1 font-mono text-[11px] text-moss-600">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-moss" /> live
              </span>
            </div>
            <div className="divide-y divide-ink-100">
              {(recent.length ? recent : Array(4).fill(null)).map((c, i) =>
                c ? (
                  <Link
                    to={`/reports/${c.id}`}
                    key={c.id}
                    className="block py-3 transition hover:bg-mist-200/60"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="line-clamp-1 text-sm font-medium text-ink-900">{c.title}</p>
                      <PriorityBadge priority={c.priority} />
                    </div>
                    <div className="mt-1.5 flex items-center gap-3 text-xs text-slate-400">
                      <span className="font-mono">{c.reference_code}</span>
                      <StatusBadge status={c.status} />
                    </div>
                  </Link>
                ) : (
                  <div key={i} className="py-3">
                    <div className="h-4 w-3/4 animate-pulse rounded-sm bg-ink-100" />
                  </div>
                )
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-24">
        <div className="flex items-end justify-between">
          <h2 className="font-display text-2xl font-semibold text-ink-900 md:text-3xl">
            From report to resolution
          </h2>
          <Gauge className="hidden text-slate-400 sm:block" size={28} />
        </div>
        <div className="mt-10 grid gap-8 md:grid-cols-3">
          {STEPS.map((step) => (
            <div key={step.n} className="border-t-2 border-ink-900 pt-5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-slate-400">{step.n}</span>
                <step.icon size={18} className="text-amber-600" />
              </div>
              <h3 className="mt-3 font-display text-xl font-semibold text-ink-900">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="border-t border-ink-100 bg-mist-200/50">
        <div className="mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-24">
          <h2 className="font-display text-2xl font-semibold text-ink-900 md:text-3xl">
            What gets reported
          </h2>
          <p className="mt-2 max-w-xl text-sm text-slate-600">
            Every category carries its own baseline risk weight, so a sewage leak is never queued behind a parking complaint.
          </p>
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/reports?category_id=${cat.id}`}
                className="group rounded-sm border border-ink-100 bg-mist-100 p-4 transition hover:border-ink-900"
              >
                <p className="text-sm font-medium text-ink-900">{cat.name}</p>
                <p className="mt-1 text-xs text-slate-400">{cat.department}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
