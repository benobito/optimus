"use client";

import { useEffect, useState } from "react";
import { ABA_PAYMENT } from "@/lib/payment";

const STATUS_MAP = {
  pending_payment: { label: "រង់ចាំការទូទាត់", color: "text-gold" },
  paid_awaiting_fulfillment: { label: "បានទូទាត់ · កំពុងបញ្ជូន Diamond", color: "text-gem" },
  fulfilled: { label: "ជោគជ័យ · បានទទួល Diamond", color: "text-gem" },
  cancelled: { label: "បានលុបចោល", color: "text-magenta" },
};

export default function OrderStatusPage({ params }) {
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/orders/${params.id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setOrder(data.order);
      });
  }, [params.id]);

  return (
    <main className="min-h-screen bg-ink px-6 py-16 flex items-center justify-center">
      <div className="facet-card bg-panel border border-line p-8 max-w-md w-full">
        <a href="/" className="text-ash text-sm hover:text-white">← ទំព័រដើម</a>
        <h1 className="font-display text-2xl font-bold mt-4 mb-6">ស្ថានភាពការបញ្ជាទិញ</h1>
        {error && <p className="text-magenta">{error}</p>}
        {order && (
          <div className="space-y-3 text-sm">
            <Row label="លេខការបញ្ជាទិញ" value={`#${order.id}`} />
            <Row label="ហ្គេម" value={order.gameName} />
            <Row label="កញ្ចប់" value={order.packageLabel} />
            <Row label="តម្លៃ" value={`$${order.priceUsd.toFixed(2)}`} />
            <Row label="User ID" value={order.gameUserId} />
            {order.gameServerId && <Row label="Server ID" value={order.gameServerId} />}
            <div className="pt-3 border-t border-line">
              <span className={`font-display font-bold ${STATUS_MAP[order.status]?.color}`}>
                {STATUS_MAP[order.status]?.label || order.status}
              </span>
            </div>

            {order.status === "pending_payment" && (
              <div className="pt-4 border-t border-line space-y-4">
                <p className="text-ash text-xs">
                  ស្កេន KHQR ឬផ្ទេរប្រាក់តាមលេខគណនីខាងក្រោម រួចផ្ញើ Screenshot ទៅ Telegram/Admin ដើម្បីបញ្ជាក់។
                </p>
                <div className="facet-card bg-white p-4 max-w-[220px] mx-auto">
                  <img src={ABA_PAYMENT.qrImageUrl} alt="ABA KHQR" className="w-full h-auto" />
                </div>
                <Row label="ឈ្មោះ" value={ABA_PAYMENT.payeeName} />
                <Row label="គណនី KHR" value={ABA_PAYMENT.accountKhr} />
                <Row label="គណនី USD" value={ABA_PAYMENT.accountUsd} />
              </div>
            )}
          </div>
        )}
        {!order && !error && <p className="text-ash">កំពុងផ្ទុក...</p>}
      </div>
    </main>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between">
      <span className="text-ash">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
