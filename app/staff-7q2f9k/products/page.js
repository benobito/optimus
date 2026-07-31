"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminProductsPage() {
  const [games, setGames] = useState([]);
  const [newPkg, setNewPkg] = useState({ gameId: "", label: "", diamonds: "", price: "" });
  const router = useRouter();

  async function load() {
    const res = await fetch("/api/products");
    const data = await res.json();
    setGames(data.games || []);
    if (data.games?.[0]) setNewPkg((p) => ({ ...p, gameId: p.gameId || data.games[0].id }));
  }

  useEffect(() => {
    load();
  }, []);

  async function addPackage(e) {
    e.preventDefault();
    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newPkg),
    });
    if (res.status === 401) return router.push("/staff-7q2f9k/login");
    setNewPkg({ ...newPkg, label: "", diamonds: "", price: "" });
    load();
  }

  async function updatePrice(id, price) {
    await fetch(`/api/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ price }),
    });
    load();
  }

  async function removePackage(id) {
    await fetch(`/api/products/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <main className="min-h-screen bg-ink px-6 py-10 md:px-12">
      <a href="/staff-7q2f9k" className="text-ash text-sm hover:text-white">← Dashboard</a>
      <h1 className="font-display text-3xl font-bold mt-4 mb-8">គ្រប់គ្រងកញ្ចប់ (Inventory)</h1>

      {games.map((game) => (
        <div key={game.id} className="mb-10">
          <h2 className="font-display text-xl font-bold mb-3">{game.name}</h2>
          <div className="space-y-2">
            {game.packages.map((pkg) => (
              <div
                key={pkg.id}
                className="facet-card bg-panel border border-line p-3 flex items-center justify-between gap-3"
              >
                <div>
                  <div className="font-medium">{pkg.label}</div>
                  {pkg.diamonds > 0 && <div className="text-ash text-xs">{pkg.diamonds} diamonds</div>}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-ash">$</span>
                  <input
                    type="number"
                    step="0.01"
                    defaultValue={pkg.price}
                    onBlur={(e) => updatePrice(pkg.id, e.target.value)}
                    className="w-24 bg-panel2 border border-line rounded px-2 py-1"
                  />
                  <button
                    onClick={() => removePackage(pkg.id)}
                    className="text-xs border border-line px-3 py-2 rounded hover:border-magenta"
                  >
                    លុប
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <form onSubmit={addPackage} className="facet-card bg-panel border border-gem p-5 max-w-lg space-y-3">
        <h3 className="font-display font-bold text-gem">បន្ថែមកញ្ចប់ថ្មី</h3>
        <select
          value={newPkg.gameId}
          onChange={(e) => setNewPkg({ ...newPkg, gameId: e.target.value })}
          className="w-full bg-panel2 border border-line rounded px-3 py-2"
        >
          {games.map((g) => (
            <option key={g.id} value={g.id}>{g.name}</option>
          ))}
        </select>
        <input
          placeholder="ឈ្មោះកញ្ចប់ (e.g. 100 Diamonds)"
          value={newPkg.label}
          onChange={(e) => setNewPkg({ ...newPkg, label: e.target.value })}
          className="w-full bg-panel2 border border-line rounded px-3 py-2"
        />
        <input
          type="number"
          placeholder="ចំនួន Diamond"
          value={newPkg.diamonds}
          onChange={(e) => setNewPkg({ ...newPkg, diamonds: e.target.value })}
          className="w-full bg-panel2 border border-line rounded px-3 py-2"
        />
        <input
          type="number"
          step="0.01"
          placeholder="តម្លៃ (USD)"
          value={newPkg.price}
          onChange={(e) => setNewPkg({ ...newPkg, price: e.target.value })}
          className="w-full bg-panel2 border border-line rounded px-3 py-2"
        />
        <button className="w-full bg-gem text-ink font-display font-bold py-2 rounded">
          បន្ថែម
        </button>
      </form>
    </main>
  );
}
