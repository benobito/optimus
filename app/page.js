"use client";

import { useEffect, useState } from "react";

const ACCENTS = {
  gem: { text: "text-gem", bg: "bg-gem", border: "border-gem", ring: "ring-gem" },
  magenta: { text: "text-magenta", bg: "bg-magenta", border: "border-magenta", ring: "ring-magenta" },
  gold: { text: "text-gold", bg: "bg-gold", border: "border-gold", ring: "ring-gold" },
  violet: { text: "text-violet", bg: "bg-violet", border: "border-violet", ring: "ring-violet" },
};

export default function StorefrontPage() {
  const [games, setGames] = useState([]);
  const [step, setStep] = useState("pick-game"); // pick-game -> pick-package -> checkout -> done
  const [selectedGame, setSelectedGame] = useState(null);
  const [selectedPkg, setSelectedPkg] = useState(null);
  const [form, setForm] = useState({ gameUserId: "", gameServerId: "", contact: "" });
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [orderStatus, setOrderStatus] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((data) => setGames(data.games || []));
  }, []);

  // Poll the order while it's still waiting on payment, so the screen
  // flips to "successful" on its own the moment an admin confirms it —
  // no manual refresh needed.
  useEffect(() => {
    if (step !== "done" || !result || orderStatus !== "pending_payment") return;
    const timer = setInterval(async () => {
      try {
        const res = await fetch(`/api/orders/${result.order.id}`);
        const data = await res.json();
        if (data.order) setOrderStatus(data.order.status);
      } catch {
        // ignore transient network errors, next poll will retry
      }
    }, 4000);
    return () => clearInterval(timer);
  }, [step, result, orderStatus]);

  function pickGame(game) {
    setSelectedGame(game);
    setStep("pick-package");
  }

  function pickPackage(pkg) {
    setSelectedPkg(pkg);
    setStep("checkout");
  }

  async function submitOrder(e) {
    e.preventDefault();
    setError("");
    if (!form.gameUserId || !form.contact) {
      setError("សូមបំពេញព័ត៌មានទាំងអស់");
      return;
    }
    if (selectedGame.needsServerId && !form.gameServerId) {
      setError("សូមបញ្ចូល Server ID");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameId: selectedGame.id,
          packageId: selectedPkg.id,
          gameUserId: form.gameUserId,
          gameServerId: form.gameServerId,
          contact: form.contact,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "មានបញ្ហា");
      setResult(data);
      setOrderStatus(data.order.status);
      setStep("done");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  function reset() {
    setSelectedGame(null);
    setSelectedPkg(null);
    setForm({ gameUserId: "", gameServerId: "", contact: "" });
    setResult(null);
    setOrderStatus(null);
    setError("");
    setStep("pick-game");
  }

  return (
    <main className="min-h-screen bg-tech">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-5 md:px-12 border-b border-line">
        <div className="flex items-center gap-2">
          <img
            src="/images/optimus-logo.jpg"
            alt="OPTIMUS"
            className="h-10 w-10 facet-card object-cover border border-gem/40"
          />
          <span className="font-display text-xl font-bold tracking-wide">OPTIMUS</span>
        </div>
        <a href="/admin/login" className="text-sm text-ash hover:text-white transition">
          Admin
        </a>
      </header>

      {/* Hero */}
      <section className="px-6 md:px-12 pt-14 pb-10 text-center">
        <p className="font-display tracking-[0.3em] text-gold text-xs mb-3">TOP UP · INSTANT · SECURE</p>
        <h1 className="font-display text-4xl md:text-6xl font-bold leading-tight">
          បញ្ចូល Diamond ក្នុងរយៈ<br className="hidden md:block" /> ប៉ុន្មាននាទី
        </h1>
        <p className="text-ash mt-4 max-w-xl mx-auto">
          ទិញ Diamond សម្រាប់ Mobile Legends: Bang Bang និង Free Fire ដោយផ្ទាល់ គ្មានប្រាក់លាក់កំបាំង
          បង់ថ្លៃតាម ABA / Wing / Bakong KHQR។
        </p>
      </section>

      <div className="px-6 md:px-12 pb-24 max-w-3xl mx-auto">
        {/* Step: pick game */}
        {step === "pick-game" && (
          <div className="grid sm:grid-cols-2 gap-5">
            {games.map((game) => {
              const a = ACCENTS[game.color] || ACCENTS.gem;
              return (
                <button
                  key={game.id}
                  onClick={() => pickGame(game)}
                  className={`facet-card bg-panel border ${a.border}/30 hover:${a.border} hover:ring-1 ${a.ring} transition p-6 text-left group`}
                >
                  <img
                    src={`/images/games/${game.id}.png`}
                    alt={game.shortName}
                    className="h-12 w-12 mb-3"
                    onError={(e) => { e.currentTarget.style.display = "none"; }}
                  />
                  <div className={`text-xs font-display tracking-widest ${a.text} mb-2`}>
                    {game.shortName}
                  </div>
                  <div className="font-display text-2xl font-bold mb-1">{game.name}</div>
                  <div className="text-ash text-sm">
                    {game.packages.length} កញ្ចប់ ចាប់ពី ${Math.min(...game.packages.map((p) => p.price)).toFixed(2)}
                  </div>
                  <div className={`mt-4 text-sm ${a.text} opacity-0 group-hover:opacity-100 transition`}>
                    ជ្រើសរើស →
                  </div>
                </button>
              );
            })}
            {games.length === 0 && (
              <p className="text-ash col-span-2 text-center py-10">កំពុងផ្ទុកទិន្នន័យ...</p>
            )}
          </div>
        )}

        {/* Step: pick package */}
        {step === "pick-package" && selectedGame && (
          <div>
            <button onClick={() => setStep("pick-game")} className="text-ash text-sm mb-5 hover:text-white">
              ← ត្រឡប់ក្រោយ
            </button>
            <h2 className="font-display text-2xl font-bold mb-5">{selectedGame.name}</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {selectedGame.packages.map((pkg) => (
                <button
                  key={pkg.id}
                  onClick={() => pickPackage(pkg)}
                  className="facet-card bg-panel border border-line hover:border-gold hover:ring-1 ring-gold transition p-5 text-left flex items-center justify-between"
                >
                  <div>
                    <div className="font-display font-bold text-lg">{pkg.label}</div>
                    {pkg.diamonds > 0 && <div className="text-ash text-xs">Diamonds</div>}
                  </div>
                  <div className="font-display font-bold text-gold text-lg">${pkg.price.toFixed(2)}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step: checkout form */}
        {step === "checkout" && selectedGame && selectedPkg && (
          <div>
            <button onClick={() => setStep("pick-package")} className="text-ash text-sm mb-5 hover:text-white">
              ← ត្រឡប់ក្រោយ
            </button>
            <div className="facet-card bg-panel2 border border-line p-4 mb-6 flex items-center justify-between">
              <div>
                <div className="font-display font-bold">{selectedGame.name}</div>
                <div className="text-ash text-sm">{selectedPkg.label}</div>
              </div>
              <div className="font-display font-bold text-gold text-xl">${selectedPkg.price.toFixed(2)}</div>
            </div>

            <form onSubmit={submitOrder} className="space-y-4">
              <div>
                <label className="block text-sm text-ash mb-1">
                  {selectedGame.needsServerId ? "User ID (MLBB)" : "Player ID (Free Fire)"}
                </label>
                <input
                  value={form.gameUserId}
                  onChange={(e) => setForm({ ...form, gameUserId: e.target.value })}
                  className="w-full bg-panel border border-line focus:border-gem rounded px-4 py-3 outline-none"
                  placeholder="12345678"
                />
              </div>
              {selectedGame.needsServerId && (
                <div>
                  <label className="block text-sm text-ash mb-1">Server ID</label>
                  <input
                    value={form.gameServerId}
                    onChange={(e) => setForm({ ...form, gameServerId: e.target.value })}
                    className="w-full bg-panel border border-line focus:border-gem rounded px-4 py-3 outline-none"
                    placeholder="1234"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm text-ash mb-1">លេខទូរស័ព្ទ ឬ Telegram សម្រាប់ទំនាក់ទំនង</label>
                <input
                  value={form.contact}
                  onChange={(e) => setForm({ ...form, contact: e.target.value })}
                  className="w-full bg-panel border border-line focus:border-gem rounded px-4 py-3 outline-none"
                  placeholder="0xx xxx xxx ឬ @username"
                />
              </div>
              {error && <p className="text-magenta text-sm">{error}</p>}
              <button
                type="submit"
                disabled={submitting}
                className="w-full facet-card bg-gem text-ink font-display font-bold text-lg py-3 hover:opacity-90 transition disabled:opacity-50"
              >
                {submitting ? "កំពុងបញ្ជាទិញ..." : `បញ្ជាទិញ · $${selectedPkg.price.toFixed(2)}`}
              </button>
            </form>
          </div>
        )}

        {/* Step: done — waiting for payment confirmation, then success */}
        {step === "done" && result && orderStatus === "pending_payment" && (
          <div className="facet-card bg-panel border border-gold p-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="h-2.5 w-2.5 rounded-full bg-gold animate-pulse" />
              <div className="text-gold font-display text-xl font-bold">កំពុងរង់ចាំការទូទាត់...</div>
            </div>
            <p className="text-ash mb-4">លេខការបញ្ជាទិញ #{result.order.id}</p>
            <p className="text-sm mb-6">{result.payment.instructions}</p>

            {result.payment.qrImageUrl && (
              <div className="facet-card bg-white p-4 mb-6 max-w-[260px] mx-auto">
                <img
                  src={result.payment.qrImageUrl}
                  alt="ABA KHQR"
                  className="w-full h-auto"
                />
              </div>
            )}
            {(result.payment.accountKhr || result.payment.accountUsd) && (
              <div className="facet-card bg-panel2 border border-line p-4 mb-6 text-sm text-left space-y-2">
                {result.payment.payeeName && (
                  <div className="flex justify-between">
                    <span className="text-ash">ឈ្មោះ</span>
                    <span className="font-medium">{result.payment.payeeName}</span>
                  </div>
                )}
                {result.payment.accountKhr && (
                  <div className="flex justify-between">
                    <span className="text-ash">គណនី KHR</span>
                    <span className="font-medium">{result.payment.accountKhr}</span>
                  </div>
                )}
                {result.payment.accountUsd && (
                  <div className="flex justify-between">
                    <span className="text-ash">គណនី USD</span>
                    <span className="font-medium">{result.payment.accountUsd}</span>
                  </div>
                )}
              </div>
            )}
            <p className="text-ash text-xs mb-6">ទំព័រនេះនឹងផ្លាស់ប្ដូរដោយស្វ័យប្រវត្តិ ភ្លាមៗពេលទូទាត់ត្រូវបានបញ្ជាក់។</p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href={`/order/${result.order.id}`}
                className="facet-card bg-gold text-ink font-display font-bold px-6 py-3"
              >
                តាមដានស្ថានភាព
              </a>
              <button onClick={reset} className="facet-card border border-line px-6 py-3 hover:border-gem">
                បញ្ជាទិញផ្សេងទៀត
              </button>
            </div>
          </div>
        )}

        {step === "done" && result && orderStatus && orderStatus !== "pending_payment" && (
          <div className="facet-card bg-panel border border-gem p-6 text-center">
            <div className="text-gem font-display text-xl font-bold mb-2">បញ្ជាទិញជោគជ័យ!</div>
            <p className="text-ash mb-2">លេខការបញ្ជាទិញ #{result.order.id}</p>
            <p className="text-sm mb-6">
              ការទូទាត់ត្រូវបានបញ្ជាក់ ✅ Diamond/Token របស់អ្នកកំពុង ឬបានផ្ញើទៅគណនីហ្គេមរបស់អ្នកហើយ។
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href={`/order/${result.order.id}`}
                className="facet-card bg-gold text-ink font-display font-bold px-6 py-3"
              >
                មើលលម្អិត
              </a>
              <button onClick={reset} className="facet-card border border-line px-6 py-3 hover:border-gem">
                បញ្ជាទិញផ្សេងទៀត
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
