---
paths:
  - 'app/{Models/Table*,Services/TableOrderService.php,Http/Controllers/Api/Table*,Http/Controllers/Api/Public/**}.php'
---

# Public

## QR self-order per meja: TableOrder is a pending request, not an Order
Each `Table` (table_no, capacity, outlet_id) has a unique random `code` used as its QR/barcode key — the QR image (SvgWriter via endroid/qr-code, GD isn't enabled so PNG is unavailable) encodes `config('app.self_order_url')."/{code}"`. Regenerate via TableController@regenerateCode to invalidate an old code.

Customers scan the code and hit unauthenticated routes under `api/public/tables/{code}` (App\Http\Controllers\Api\Public\TableMenuController, throttled `30,1`) to view the menu and submit items. This creates a `TableOrder` (status pending) — NOT a real `Order`. It intentionally skips stock consumption and journal posting, because nothing has been paid/attended yet.

A staff member must call `POST /api/table-orders/{id}/confirm` (TableOrderService::confirm) to turn it into a real `Order` via the existing `OrderService::create()` — this is what actually consumes stock (ProductBatchService, FEFO, can 422 on insufficient stock) and posts journal entries. `TableOrder::cancel()` just marks it cancelled, no financial side effects. Follow this two-step (request → staff-confirmed Order) pattern for any other unauthenticated/customer-submitted order flow; never call OrderService::create() directly from a public/unauthenticated controller.

Realtime: `TableOrderStatusUpdated` broadcasts on private channel `table-orders` (see [[events]] for the Reverb/Sanctum broadcasting setup) whenever a TableOrder is created, confirmed, or cancelled.
