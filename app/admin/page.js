"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const STATUS_LABEL = {
  pending_payment: "រង់ចាំទូទាត់",
  paid_awaiting_fulfillment: "បានទូទាត់",
  fulfilled: "ជោគជ័យ",
  cancelled: "បានលុប",
};

const STATUS_COLOR = {
  pending_payment: "bg-gold/20 text-gold",
  paid_awaiting_fulfillment: "bg-gem/20 text-gem",
  fulfilled: "bg-gem/30 text-gem",
  cancelled: "bg-magenta/20 text-magenta",
};

export default function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  async function load() {
    setLoading(true);
    const res = await fetch("/api/orders");
    if (res.status === 401) {
      router.push("/admin/login");
      return;
    }
    const data = await res.json();
    setOrders(data.orders || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function updateStatus(id, status) {
    await fetch(`/api/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    load();
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  }

  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === "pending_payment").length,
    awaiting: orders.filter((o) => o.status === "paid_awaiting_fulfillment").length,
    fulfilled: orders.filter((o) => o.status === "fulfilled").length,
  };

  return (
    <main className="min-h-screen bg-ink px-6 py-10 md:px-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl font-bold">Admin Dashboard</h1>
        <div className="flex items-center gap-4">
          <a href="/admin/products" className="text-gem hover:underline text-sm">
            គ្រប់គ្រងកញ្ចប់
          </a>
          <button onClick={logout} className="text-ash hover:text-white text-sm">
            ចាកចេញ
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="ការបញ្ជាទិញសរុប" value={stats.total} />
        <StatCard label="រង់ចាំទូទាត់" value={stats.pending} accent="text-gold" />
        <StatCard label="ត្រូវបញ្ជូន" value={stats.awaiting} accent="text-gem" />
        <StatCard label="ជោគជ័យ" value={stats.fulfilled} accent="text-gem" />
      </div>

      {loading && <p className="text-ash">កំពុងផ្ទុក...</p>}

      <div className="space-y-3">
        {orders.map((o) => (
          <div
            key={o.id}
            className="facet-card bg-panel border border-line p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
          >
            <div>
              <div className="font-display font-bold">
                #{o.id} · {o.gameName} · {o.packageLabel}
              </div>
              <div className="text-ash text-sm">
                User: {o.gameUserId} {o.gameServerId ? `(${o.gameServerId})` : ""} · ទាក់ទង: {o.contact} · ${o.priceUsd.toFixed(2)}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs px-3 py-1 rounded-full font-medium ${STATUS_COLOR[o.status]}`}>
                {STATUS_LABEL[o.status]}
              </span>
              {o.status === "pending_payment" && (
                <button
                  onClick={() => updateStatus(o.id, "paid_awaiting_fulfillment")}
                  className="text-xs bg-gem text-ink font-bold px-3 py-2 rounded"
                >
                  សម្គាល់ថាបានទូទាត់
                </button>
              )}
              {o.status === "paid_awaiting_fulfillment" && (
                <button
                  onClick={() => updateStatus(o.id, "fulfilled")}
                  className="text-xs bg-gold text-ink font-bold px-3 py-2 rounded"
                >
                  សម្គាល់ថាបានបញ្ជូន
                </button>
              )}
              {o.status !== "fulfilled" && o.status !== "cancelled" && (
                <button
                  onClick={() => updateStatus(o.id, "cancelled")}
                  className="text-xs border border-line px-3 py-2 rounded hover:border-magenta"
                >
                  លុប
                </button>
              )}
            </div>
          </div>
        ))}
        {!loading && orders.length === 0 && <p className="text-ash">មិនទាន់មានការបញ្ជាទិញ</p>}
      </div>
    </main>
  );
}

function StatCard({ label, value, accent = "text-white" }) {
  return (
    <div className="facet-card bg-panel border border-line p-4">
      <div className={`font-display text-3xl font-bold ${accent}`}>{value}</div>
      <div className="text-ash text-xs mt-1">{label}</div>
    </div>
  );
}
