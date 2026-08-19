---
paths:
  - '{app/Http/Controllers/KasirController.php,app/Http/Controllers/{PesananMeja,Reservasi,PreOrder}Controller.php,resources/js/Pages/Kasir/**}'
---

# Kasir

## Kasir is one tabbed page — POS, Pesanan Meja, Reservasi, Pre-Order are panels, not routes
`/kasir` (KasirController@index) renders a single page with 4 client-side tabs (Kasir POS, Pesanan Meja, Reservasi, Pre-Order) — there are no separate `pesanan-meja.index` / `reservasi.index` / `pre-order.index` pages/routes anymore. `KasirController@index` fetches data for ALL four panels every load; `resources/js/Pages/Kasir/Index.jsx` is the shell (header + tab bar + `useState('pos')` activeTab) that conditionally renders `Kasir/Panels/{Pos,PesananMeja,Reservasi,PreOrder}Panel.jsx`.

`PesananMejaController`, `ReservasiController`, `PreOrderController` only keep their mutating actions (store/update/destroy/confirm/cancel) — no `index()`. Every one of those actions redirects to `route('kasir.index')`, and every panel-side `router.get/post/put/delete` call passes `preserveState: true` so the Inertia visit reuses the same `Kasir/Index` component instance and the user's `activeTab` (and any open modal) survives the round trip.

Each panel's own filters use a panel-prefixed query param to avoid collisions on the shared `/kasir` URL: `pm_status` (Pesanan Meja), `reservasi_status`/`reservasi_date` (Reservasi), `preorder_status` (Pre-Order). Paginators are also given distinct page-name params (`pm_page`, `reservasi_page`, `preorder_page`) via `paginate(..., ['*'], 'xxx_page')` so paginating one panel doesn't reset another.

The POS panel's "No. Meja" field is a `<select>` sourced from `Table::where('outlet_id', ...)->where('is_active', true)->get()` (the `tables` prop) — not a free-text input. Follow this pattern (panel + prefixed query params + preserveState redirects) for any other domain that should live inside the Kasir screen instead of its own page.
