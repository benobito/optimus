# OPTIMUS — Game Diamond/UC Top-up Shop

A full-stack Next.js website for selling in-game currency (Mobile Legends
diamonds, Free Fire diamonds, PUBG Mobile UC, Honor of Kings tokens): public
storefront, order tracking, and an admin dashboard for managing orders and
pricing.

## What's included

- **Storefront** (`/`) — pick a game, pick a package, checkout form
- **Order tracking** (`/order/[id]`) — customers check their order status
- **Admin dashboard** (`/staff-7q2f9k`) — view/update orders, mark paid/fulfilled
- **Package manager** (`/staff-7q2f9k/products`) — add/edit/remove packages & prices
- **API** — `app/api/**` routes for orders, products, and admin auth
- Data is stored in `data/db.json` (via `lowdb`) — no external database needed
  to get started.

## 1. Local setup

```bash
npm install
cp .env.example .env.local
```

Edit `.env.local`:
- `ADMIN_PASSWORD` — the password for the admin dashboard. Change it from the default.
- `SESSION_SECRET` — any long random string (`openssl rand -hex 32`).

Run it:
```bash
npm run dev
```
Visit http://localhost:3000.

### Admin access

The admin dashboard is **not linked anywhere on the public site**, and it
does not live at the obvious `/admin` path — it's at:

```
http://localhost:3000/staff-7q2f9k/login
```

**Bookmark that URL** — there's no link to it in the storefront on purpose,
so casual visitors can't stumble onto the login screen or brute-force-guess
`/admin`. This is on top of, not instead of, the password login — always
also set a strong, unique `ADMIN_PASSWORD`.

Want to change the secret slug to something of your own choosing? Rename
the `app/staff-7q2f9k` and `app/api/staff-7q2f9k` folders, and update the
matching path in `middleware.js` (`ADMIN_BASE`) to match. Pick something
short but not guessable — avoid real words like `/admin`, `/backend`, `/cms`.

## 2. Making it take REAL payments

Right now the shop runs in **manual-confirm mode**: a customer places an
order, sees payment instructions, pays you directly (bank transfer / KHQR
you show them / Telegram), and an admin clicks "សម្គាល់ថាបានទូទាត់" in the
dashboard once the money has actually arrived. This is a completely normal
way to run a top-up shop and is how many small Cambodian shops operate.

To make payment automatic, open **`lib/payment.js`** — it has step-by-step
comments for three real options:
- **ABA PayWay** (https://pay.ababank.com) — needs an ABA merchant account
- **Bakong KHQR** (https://bakong.nbc.gov.kh) — needs an NBC Bakong merchant ID
- **Wing Business API** — needs a Wing merchant agreement

You'll implement `createPaymentRequest()` (generates the QR/payment link
shown to the customer) and `verifyPaymentWebhook()` (receives the
gateway's "payment succeeded" callback at `POST /api/webhook/payment`).
Put your API keys in `.env.local`, never in the code.

## 3. Making diamond delivery automatic

Open **`lib/supplier.js`**. Right now `deliverDiamonds()` is a stub — orders
marked "paid" stay in "paid_awaiting_fulfillment" until an admin manually
tops up the player's account and marks the order fulfilled.

To automate it, sign up with a reseller/supplier (e.g. Smile One, UniPin, or
any Telegram-bot supplier with an HTTP API), and fill in the real API call in
that function using your supplier's docs. Once wired up, marking an order
"paid" in the dashboard will automatically call the supplier and deliver the
diamonds.

## 4. Get a Telegram ping the moment someone orders

Every new order (and every status change — paid, fulfilled, cancelled) can
instantly ping your Telegram. Setup takes about 5 minutes:

1. In Telegram, message **@BotFather** → `/newbot` → follow the steps. You'll
   get a token like `123456789:AAExxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`.
2. Send your new bot any message (e.g. "hi") so it's allowed to reply to you.
   (Want notifications in a group instead? Add the bot to that group.)
3. Get your chat id — message **@userinfobot** on Telegram and it replies
   with your numeric id.
4. Add both to `.env.local`:
   ```
   TELEGRAM_BOT_TOKEN=123456789:AAExxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   TELEGRAM_CHAT_ID=123456789
   ```
5. Restart the app. Done — place a test order and you'll get a message
   within a second or two.

Leave those two vars empty/unset and the shop just skips Telegram silently —
nothing breaks. See `lib/telegram.js` for the full logic and message format.

## 5. Deploying

**Important:** `data/db.json` is a plain file on disk. That works great on a
regular VPS but **not** on serverless hosts like Vercel, where the
filesystem resets on every deploy/request. Pick one:

### Option A — VPS / your own server (simplest, works as-is)
```bash
npm run build
npm run start   # runs on port 3000 by default
```
Put it behind Nginx/Caddy with HTTPS, keep it running with `pm2` or a
systemd service. `data/db.json` will persist normally on disk.

### Option B — Vercel / serverless (recommended for scale)
Swap `lib/db.js` for a real database (Postgres via Vercel Postgres/Neon +
Prisma, or Supabase). The rest of the app (API routes, pages) doesn't need
to change — just replace the `getDb()`/`saveDb()` functions with equivalent
Prisma/SQL calls. This is the right move once you have real order volume.

## 6. Before going live — checklist

- [ ] Change `ADMIN_PASSWORD` and `SESSION_SECRET` in `.env.local`
- [ ] Connect a real payment method (`lib/payment.js`)
- [ ] Connect a real diamond supplier, or commit to fulfilling manually
- [ ] Set `TELEGRAM_BOT_TOKEN` / `TELEGRAM_CHAT_ID` so you get pinged on orders
- [ ] Move `data/db.json` to a real database if deploying to Vercel/serverless
- [ ] Add your real support Telegram/phone in `data/db.json` → `settings`
- [ ] Run `npm audit fix` and keep dependencies patched before launch
- [ ] Get an SSL certificate (any VPS host + Caddy/Let's Encrypt does this free)

## Project structure

```
app/
  page.js                 storefront
  order/[id]/page.js       order status page
  admin/
    login/page.js
    page.js                dashboard
    products/page.js        inventory/pricing
  api/
    orders/route.js         create + list orders
    orders/[id]/route.js    get + update one order
    products/route.js       list + add packages
    products/[id]/route.js  edit + delete a package
    admin/login/route.js
    admin/logout/route.js
    webhook/payment/route.js   <- your payment gateway calls this
lib/
  db.js        JSON file "database"
  auth.js      admin session cookie logic
  payment.js   <- fill in real payment gateway here
  supplier.js  <- fill in real diamond supplier here
  telegram.js  order notifications sent to your Telegram
data/db.json   games, packages, and all orders
```
