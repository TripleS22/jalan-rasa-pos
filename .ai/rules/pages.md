---
paths:
  - '{app/Http/Controllers/*.php,routes/web.php,resources/js/Pages/**}'
---

# Pages

## Web dashboard is a separate controller layer, not an API consumer
`App\Http\Controllers\*` (root namespace, e.g. `OutletController`, `MejaController`) is a PARALLEL set of controllers to `App\Http\Controllers\Api\*` — they do NOT call the JSON API. They use `auth` session middleware (routes/web.php), validate/touch Eloquent models or Services directly, and `redirect()->route(...)->with('success', ...)` instead of returning JSON. Inertia pages live at `resources/js/Pages/{Domain}/Index.jsx` (React), rendered via `Inertia::render()`.

Route names and URIs are Indonesian (`meja.index`, `/meja`, not `/tables`), matching the domain's Indonesian label already used elsewhere (Produk, Kategori, Pelanggan, Outlet, ...). Nav links live in `resources/js/Layouts/AuthenticatedLayout.jsx`'s `NAV_GROUPS`.

Standard page shape (see `Outlet/Index.jsx` or `Meja/Index.jsx`): single `Index.jsx` with inline create/edit `<Modal>` driven by `useForm`, a search/filter form using `router.get(..., {preserveState:true, replace:true})`, a table with Edit/Hapus actions, and Laravel pagination links rendered from `{resource}.links`. Flash messages read from `usePage().props.flash.success`.

Because these routes are session-authenticated (not Sanctum bearer), any endpoint the web dashboard needs — including binary responses like the QR image in `MejaController@qr` — must be implemented on this web layer too; it cannot reuse an `auth:sanctum`-protected `Api\*` route directly (no token). Some logic (e.g. QR building, code generation) is intentionally duplicated between `Api\TableController` and `MejaController`, matching how `Api\OutletController` and `OutletController` already duplicate their validation rules — don't try to "DRY" this into a shared trait/base without checking with the user, it's the established pattern here.
