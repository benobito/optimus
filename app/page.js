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
  const [settings, setSettings] = useState(null);
  const [step, setStep] = useState("pick-game"); // pick-game -> pick-package -> checkout -> done
  const [selectedGame, setSelectedGame] = useState(null);
  const [selectedPkg, setSelectedPkg] = useState(null);
  const [form, setForm] = useState({ gameUserId: "", gameServerId: "", contact: "" });
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [orderStatus, setOrderStatus] = useState(null);
  const [error, setError] = useState("");
  const [nickCheck, setNickCheck] = useState({ loading: false, nickname: null, note: null });

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((data) => setGames(data.games || []));
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => setSettings(data.settings || null));
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
    setNickCheck({ loading: false, nickname: null, note: null });
    setStep("checkout");
  }

  async function checkId() {
    if (!form.gameUserId) {
      setNickCheck({ loading: false, nickname: null, note: "សូមបញ្ចូល ID សិន" });
      return;
    }
    if (selectedGame.needsServerId && !form.gameServerId) {
      setNickCheck({ loading: false, nickname: null, note: "សូមបញ្ចូល Server ID ផងដែរ" });
      return;
    }
    setNickCheck({ loading: true, nickname: null, note: null });
    try {
      const res = await fetch("/api/check-nickname", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameId: selectedGame.id,
          gameUserId: form.gameUserId,
          gameServerId: form.gameServerId,
        }),
      });
      const data = await res.json();
      if (data.verified) {
        setNickCheck({ loading: false, nickname: data.nickname, note: null });
      } else {
        setNickCheck({ loading: false, nickname: null, note: data.note || data.error || "មិនអាចត្រួតពិនិត្យបានទេ" });
      }
    } catch {
      setNickCheck({ loading: false, nickname: null, note: "មានបញ្ហាបណ្ដាញ សូមព្យាយាមម្តងទៀត" });
    }
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
    setNickCheck({ loading: false, nickname: null, note: null });
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
      </header>

      {/* Hero */}
      <section className="px-6 md:px-12 pt-14 pb-10 text-center">
        <p className="font-display tracking-[0.3em] text-gold text-xs mb-3">TOP UP · INSTANT · SECURE</p>
        <h1 className="font-display text-4xl md:text-6xl font-bold leading-tight text-gradient-tech">
          សូមស្វាគមន៍មកកាន់ OPTIMUS
        </h1>
        <p className="text-ash mt-4 max-w-xl mx-auto">
          លោកអ្នកអាចបញ្ជាទិញលឿនរហ័សទាន់ចិត្ត មានសម្រាប់ Game ជាច្រើនប្រភេទ
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
                  {selectedGame.idLabel || "Player ID"}
                </label>
                <div className="flex gap-2">
                  <input
                    value={form.gameUserId}
                    onChange={(e) => {
                      setForm({ ...form, gameUserId: e.target.value });
                      setNickCheck({ loading: false, nickname: null, note: null });
                    }}
                    className="flex-1 bg-panel border border-line focus:border-gem rounded px-4 py-3 outline-none"
                    placeholder={selectedGame.idPlaceholder || "12345678"}
                  />
                  <button
                    type="button"
                    onClick={checkId}
                    disabled={nickCheck.loading}
                    className="shrink-0 facet-card border border-gem text-gem px-4 font-display font-bold text-sm hover:bg-gem hover:text-ink transition disabled:opacity-50"
                  >
                    {nickCheck.loading ? "..." : "ត្រួតពិនិត្យ"}
                  </button>
                </div>
                {nickCheck.nickname && (
                  <p className="text-gem text-sm mt-2 flex items-center gap-1">
                    ✅ ឈ្មោះក្នុងហ្គេម៖ <span className="font-bold">{nickCheck.nickname}</span>
                  </p>
                )}
                {nickCheck.note && (
                  <p className="text-ash text-sm mt-2">{nickCheck.note}</p>
                )}
              </div>
              {selectedGame.needsServerId && (
                <div>
                  <label className="block text-sm text-ash mb-1">Server ID</label>
                  <input
                    value={form.gameServerId}
                    onChange={(e) => {
                      setForm({ ...form, gameServerId: e.target.value });
                      setNickCheck({ loading: false, nickname: null, note: null });
                    }}
                    className="w-full bg-panel border border-line focus:border-gem rounded px-4 py-3 outline-none"
                    placeholder={selectedGame.serverPlaceholder || "1234"}
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

      {/* Footer: contact links */}
      <footer className="border-t border-line px-6 md:px-12 py-10 mt-6">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-ash text-sm mb-5">មានសំណួរ ឬត្រូវការជំនួយ? ទាក់ទងមកយើងខ្ញុំ</p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            {settings?.supportTelegram && (
              <a
                href={settings.supportTelegram}
                target="_blank"
                rel="noopener noreferrer"
                className="facet-card bg-panel border border-line hover:border-gem hover:text-gem transition flex items-center gap-2 px-5 py-3 text-sm font-medium"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
                  <path d="M21.94 4.6 18.6 20.36c-.25 1.1-.9 1.37-1.83.86l-5.06-3.73-2.44 2.35c-.27.27-.5.5-1.02.5l.36-5.16 9.4-8.5c.41-.36-.09-.56-.63-.2L6.7 12.9l-5.03-1.58c-1.1-.34-1.11-1.1.23-1.62L20.6 3.16c.9-.33 1.7.2 1.34 1.44Z" />
                </svg>
                Telegram
              </a>
            )}
            {settings?.supportFacebook && (
              <a
                href={settings.supportFacebook}
                target="_blank"
                rel="noopener noreferrer"
                className="facet-card bg-panel border border-line hover:border-violet hover:text-violet transition flex items-center gap-2 px-5 py-3 text-sm font-medium"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
                  <path d="M13.5 21v-7.5H16l.5-3H13.5V8.5c0-.87.24-1.46 1.5-1.46H16.6V4.35C16.31 4.31 15.32 4.22 14.17 4.22c-2.4 0-4.04 1.46-4.04 4.15v2.13H7.6v3H10.13V21h3.37Z" />
                </svg>
                Facebook
              </a>
            )}
            {settings?.supportEmail && (
              <a
                href={`mailto:${settings.supportEmail}`}
                className="facet-card bg-panel border border-line hover:border-gold hover:text-gold transition flex items-center gap-2 px-5 py-3 text-sm font-medium"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth="1.8" aria-hidden="true">
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <path d="m4 7 8 6 8-6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {settings.supportEmail}
              </a>
            )}
            {settings?.supportPhone && settings.supportPhone !== "0" && (
              <a
                href={`tel:${settings.supportPhone}`}
                className="facet-card bg-panel border border-line hover:border-magenta hover:text-magenta transition flex items-center gap-2 px-5 py-3 text-sm font-medium"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth="1.8" aria-hidden="true">
                  <path d="M6.6 10.8c1.4 2.8 3.8 5.2 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.4c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.4 0 .8-.2 1L6.6 10.8Z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {settings.supportPhone}
              </a>
            )}
          </div>
          <p className="text-ash/60 text-xs mt-8">
            © {new Date().getFullYear()} {settings?.shopName || "OPTIMUS"}. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}
