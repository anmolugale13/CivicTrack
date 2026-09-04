import { useEffect, useState, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowUp, Search, SlidersHorizontal } from "lucide-react";
import client, { API_BASE } from "../api/client";
import { PriorityBadge, StatusBadge } from "../components/Badge";

const STATUSES = ["pending", "acknowledged", "in_progress", "resolved", "rejected"];
const PRIORITIES = ["critical", "high", "medium", "low"];

export default function Reports() {
  const [params, setParams] = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [data, setData] = useState({ total: 0, items: [] });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(params.get("search") || "");

  const status = params.get("status") || "";
  const categoryId = params.get("category_id") || "";
  const priority = params.get("priority") || "";
  const sort = params.get("sort") || "priority";
  const page = parseInt(params.get("page") || "1", 10);

  useEffect(() => {
    client.get("/api/complaints/categories").then((r) => setCategories(r.data));
  }, []);

  const fetchData = useCallback(() => {
    setLoading(true);
    const q = {};
    if (status) q.status = status;
    if (categoryId) q.category_id = categoryId;
    if (priority) q.priority = priority;
    if (params.get("search")) q.search = params.get("search");
    q.sort = sort;
    q.page = page;
    q.page_size = 9;
    client.get("/api/complaints", { params: q }).then((r) => {
      setData(r.data);
      setLoading(false);
    });
  }, [status, categoryId, priority, sort, page, params]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value); else next.delete(key);
    next.set("page", "1");
    setParams(next);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    updateParam("search", search);
  };

  const upvote = async (id) => {
    try {
      await client.post(`/api/complaints/${id}/upvote`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.detail || "Couldn't register vote");
    }
  };

  const totalPages = Math.max(1, Math.ceil(data.total / 9));

  return (
    <div className="mx-auto max-w-7xl px-5 py-12 md:px-8">
      <div className="flex flex-col gap-2 border-b border-ink-100 pb-6">
        <p className="font-mono text-xs uppercase tracking-widest text-slate-400">Public Log</p>
        <h1 className="font-display text-3xl font-semibold text-ink-900">
          {data.total} reports on record
        </h1>
      </div>

      {/* Filters */}
      <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <form onSubmit={handleSearch} className="flex w-full max-w-md items-center gap-2 rounded-sm border border-ink-100 bg-mist-100 px-3 py-2">
          <Search size={16} className="text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, reference code, keyword…"
            className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
          />
        </form>

        <div className="flex flex-wrap items-center gap-3 text-sm">
          <SlidersHorizontal size={15} className="text-slate-400" />
          <select value={status} onChange={(e) => updateParam("status", e.target.value)} className="rounded-sm border border-ink-100 bg-mist-100 px-2 py-1.5">
            <option value="">All statuses</option>
            {STATUSES.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
          </select>
          <select value={priority} onChange={(e) => updateParam("priority", e.target.value)} className="rounded-sm border border-ink-100 bg-mist-100 px-2 py-1.5">
            <option value="">All priorities</option>
            {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
          <select value={categoryId} onChange={(e) => updateParam("category_id", e.target.value)} className="rounded-sm border border-ink-100 bg-mist-100 px-2 py-1.5">
            <option value="">All categories</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select value={sort} onChange={(e) => updateParam("sort", e.target.value)} className="rounded-sm border border-ink-100 bg-mist-100 px-2 py-1.5">
            <option value="priority">Sort: Priority</option>
            <option value="newest">Sort: Newest</option>
            <option value="oldest">Sort: Oldest</option>
            <option value="upvotes">Sort: Most backed</option>
          </select>
        </div>
      </div>

      {/* List */}
      <div className="mt-8 divide-y divide-ink-100 border-y border-ink-100">
        {loading ? (
          Array(5).fill(0).map((_, i) => (
            <div key={i} className="h-24 animate-pulse bg-mist-200/40" />
          ))
        ) : data.items.length === 0 ? (
          <div className="py-16 text-center">
            <p className="font-display text-lg text-ink-900">No reports match these filters.</p>
            <p className="mt-1 text-sm text-slate-400">Try widening the search or clearing a filter.</p>
          </div>
        ) : (
          data.items.map((c) => (
            <div key={c.id} className="flex flex-col gap-3 py-5 sm:flex-row sm:items-center sm:justify-between">
              <Link to={`/reports/${c.id}`} className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs text-slate-400">{c.reference_code}</span>
                  <PriorityBadge priority={c.priority} />
                  <StatusBadge status={c.status} />
                </div>
                <p className="mt-1.5 truncate font-display text-lg font-medium text-ink-900">{c.title}</p>
                <p className="mt-1 line-clamp-1 text-sm text-slate-400">
                  {c.category?.name} · {c.location_text || "Location not specified"}
                </p>
              </Link>
              <div className="flex items-center gap-4 sm:flex-col sm:items-end">
                {c.image_path && (
                  <img src={`${API_BASE}${c.image_path}`} alt="" className="hidden h-14 w-20 rounded-sm object-cover sm:block" />
                )}
                <button
                  onClick={() => upvote(c.id)}
                  className="flex items-center gap-1.5 rounded-sm border border-ink-100 px-3 py-1.5 text-xs font-semibold text-ink-900 hover:border-amber-600 hover:text-amber-600"
                >
                  <ArrowUp size={13} /> {c.upvotes}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => updateParam("page", String(p))}
              className={`h-8 w-8 rounded-sm text-sm font-medium ${
                p === page ? "bg-ink-900 text-mist-100" : "border border-ink-100 text-ink-900 hover:border-ink-300"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
