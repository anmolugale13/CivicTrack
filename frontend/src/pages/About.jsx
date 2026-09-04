import { Sparkles, Users, Building2, Timer } from "lucide-react";

const POINTS = [
  { icon: Sparkles, title: "Automatic triage", body: "Every report is scored 0–100 the moment it's filed, using category risk, urgency language, and community backing — no dispatcher has to read every case first." },
  { icon: Building2, title: "Right department, first try", body: "Categories map directly to the department responsible, so reports land in the correct queue instead of bouncing between desks." },
  { icon: Timer, title: "SLA clocks per priority", body: "Critical issues carry a 24-hour resolution target, low priority ones two weeks — so nothing quietly ages out of view." },
  { icon: Users, title: "Duplicate-aware", body: "Similar reports in the same category are flagged against each other, so five reports of the same pothole become one case with five backers." },
];

export default function About() {
  return (
    <div className="mx-auto max-w-4xl px-5 py-16 md:px-8">
      <p className="font-mono text-xs uppercase tracking-widest text-slate-400">How It Works</p>
      <h1 className="mt-2 font-display text-3xl font-semibold text-ink-900 md:text-4xl">
        A public ledger, not a black box.
      </h1>
      <p className="mt-4 max-w-2xl text-base text-slate-600">
        CivicTrack exists so that a reported problem is never just an email in a shared inbox. Every case is timestamped,
        scored, assigned, and closed out in the open — residents can see exactly where their report stands.
      </p>

      <div className="mt-12 grid gap-8 sm:grid-cols-2">
        {POINTS.map((p) => (
          <div key={p.title} className="border-t-2 border-ink-900 pt-4">
            <p.icon size={18} className="text-amber-600" />
            <h3 className="mt-3 font-display text-lg font-semibold text-ink-900">{p.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{p.body}</p>
          </div>
        ))}
      </div>

      <div className="mt-14 rounded-sm border border-ink-100 bg-mist-100 p-6">
        <h3 className="font-display text-lg font-semibold text-ink-900">The scoring model, plainly</h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          Each category carries a base risk weight (a sewage leak starts higher than a noise complaint). The system then
          scans the report text for urgency language across three tiers — critical, high, and medium signal words — and
          adds community upvotes as a capped bonus. The total is clamped to 0–100 and mapped to a priority band. It's a
          transparent heuristic by design: staff can see exactly why a case was scored the way it was, and citizens can
          see it too.
        </p>
      </div>
    </div>
  );
}
