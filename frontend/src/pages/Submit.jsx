import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UploadCloud, CheckCircle2 } from "lucide-react";
import client from "../api/client";
import { previewPriority } from "../utils/priorityPreview";
import { useAuth } from "../context/AuthContext";

export default function Submit() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    category_id: "",
    location_text: "",
    is_anonymous: !user,
    reporter_name: "",
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    client.get("/api/complaints/categories").then((r) => {
      setCategories(r.data);
      if (r.data.length) setForm((f) => ({ ...f, category_id: r.data[0].id }));
    });
  }, []);

  const selectedCategory = categories.find((c) => c.id === Number(form.category_id));
  const preview = previewPriority(`${form.title} ${form.description}`, selectedCategory?.base_weight || 30);

  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const handleImage = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.title.trim() || !form.description.trim() || !form.category_id) {
      setError("Please fill in a title, description, and category.");
      return;
    }
    setSubmitting(true);
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (image) fd.append("image", image);

    try {
      const res = await client.post("/api/complaints", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || "Something went wrong submitting your report.");
    } finally {
      setSubmitting(false);
    }
  };

  if (result) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-24 text-center">
        <CheckCircle2 className="mx-auto text-moss-600" size={44} />
        <h1 className="mt-4 font-display text-3xl font-semibold text-ink-900">Report filed.</h1>
        <p className="mt-2 text-slate-600">
          Reference <span className="font-mono font-semibold text-ink-900">{result.reference_code}</span> — scored
          as <span className="font-semibold capitalize text-ink-900">{result.priority}</span> priority ({result.priority_score}/100)
          and routed to {result.assigned_department}.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <button onClick={() => navigate(`/reports/${result.id}`)} className="rounded-sm bg-ink-900 px-5 py-2.5 text-sm font-semibold text-mist-100 hover:bg-ink-700">
            View this report
          </button>
          <button onClick={() => { setResult(null); setForm({ ...form, title: "", description: "", location_text: "" }); setImage(null); setImagePreview(null); }} className="rounded-sm border border-ink-100 px-5 py-2.5 text-sm font-semibold text-ink-900 hover:border-ink-300">
            File another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-5 py-12 md:px-8">
      <p className="font-mono text-xs uppercase tracking-widest text-slate-400">New Report</p>
      <h1 className="mt-2 font-display text-3xl font-semibold text-ink-900">Tell us what's wrong.</h1>
      <p className="mt-2 max-w-xl text-sm text-slate-600">
        Be specific about location and severity — the more detail you give, the more accurately this gets triaged.
      </p>

      <div className="mt-10 grid gap-10 md:grid-cols-[1.5fr_1fr]">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-sm font-medium text-ink-900">Title</label>
            <input
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
              placeholder="e.g. Deep pothole near the market junction"
              className="mt-1.5 w-full rounded-sm border border-ink-100 bg-mist-100 px-3 py-2.5 text-sm outline-none focus:border-ink-300"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-ink-900">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              rows={6}
              placeholder="What's happening, since when, and who or what is affected?"
              className="mt-1.5 w-full rounded-sm border border-ink-100 bg-mist-100 px-3 py-2.5 text-sm outline-none focus:border-ink-300"
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-ink-900">Category</label>
              <select
                value={form.category_id}
                onChange={(e) => update("category_id", e.target.value)}
                className="mt-1.5 w-full rounded-sm border border-ink-100 bg-mist-100 px-3 py-2.5 text-sm outline-none focus:border-ink-300"
              >
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-ink-900">Location</label>
              <input
                value={form.location_text}
                onChange={(e) => update("location_text", e.target.value)}
                placeholder="Street, landmark, or ward"
                className="mt-1.5 w-full rounded-sm border border-ink-100 bg-mist-100 px-3 py-2.5 text-sm outline-none focus:border-ink-300"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-ink-900">Photo (optional)</label>
            <label className="mt-1.5 flex cursor-pointer items-center gap-3 rounded-sm border border-dashed border-ink-300 bg-mist-100 px-4 py-4 text-sm text-slate-400 hover:border-ink-900">
              <UploadCloud size={18} />
              {image ? image.name : "Click to attach a photo of the issue"}
              <input type="file" accept="image/*" onChange={handleImage} className="hidden" />
            </label>
            {imagePreview && <img src={imagePreview} alt="" className="mt-3 h-32 w-full rounded-sm object-cover" />}
          </div>

          {!user && (
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="flex items-center gap-2 pt-6">
                <input
                  id="anon"
                  type="checkbox"
                  checked={form.is_anonymous}
                  onChange={(e) => update("is_anonymous", e.target.checked)}
                />
                <label htmlFor="anon" className="text-sm text-ink-900">File anonymously</label>
              </div>
              {!form.is_anonymous && (
                <div>
                  <label className="text-sm font-medium text-ink-900">Your name</label>
                  <input
                    value={form.reporter_name}
                    onChange={(e) => update("reporter_name", e.target.value)}
                    className="mt-1.5 w-full rounded-sm border border-ink-100 bg-mist-100 px-3 py-2.5 text-sm outline-none focus:border-ink-300"
                  />
                </div>
              )}
            </div>
          )}

          {error && <p className="text-sm text-brick-600">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-sm bg-ink-900 px-5 py-3 text-sm font-semibold text-mist-100 hover:bg-ink-700 disabled:opacity-60"
          >
            {submitting ? "Filing report…" : "Submit report"}
          </button>
        </form>

        {/* Live priority preview */}
        <aside className="h-fit rounded-sm border border-ink-100 bg-mist-100 p-5">
          <p className="font-mono text-xs uppercase tracking-widest text-slate-400">Live triage preview</p>
          <p className="mt-1 text-xs text-slate-400">Updates as you type — the server recalculates this on submit.</p>
          <div className="mt-5 flex items-end gap-2">
            <span className="font-display text-4xl font-semibold text-ink-900">{preview.score}</span>
            <span className="mb-1.5 text-sm text-slate-400">/ 100</span>
          </div>
          <div className="mt-3 h-1.5 w-full rounded-full bg-ink-100">
            <div
              className={`h-1.5 rounded-full transition-all ${
                preview.label === "critical" ? "bg-brick" : preview.label === "high" ? "bg-amber-600" : preview.label === "medium" ? "bg-ink-500" : "bg-moss"
              }`}
              style={{ width: `${preview.score}%` }}
            />
          </div>
          <p className="mt-3 text-sm font-semibold capitalize text-ink-900">{preview.label} priority</p>
          <p className="mt-2 text-xs leading-relaxed text-slate-400">
            {preview.matched
              ? <>Weighted up because the text mentions "<span className="text-ink-900">{preview.matched}</span>", plus the base risk for {selectedCategory?.name || "this category"}.</>
              : `Based on the base risk level for ${selectedCategory?.name || "this category"}. Add more detail on severity or safety impact to refine this.`}
          </p>
        </aside>
      </div>
    </div>
  );
}
