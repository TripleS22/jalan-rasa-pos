---
paths:
  - 'app/Events/**'
---

# Events

## Real-time broadcasting via Reverb (Sanctum-auth, not session)
This app is API/mobile-only (Sanctum bearer tokens, no SPA/session). Broadcasting is set up via `->withBroadcasting()` in bootstrap/app.php with `['prefix' => 'api', 'middleware' => ['api', 'auth:sanctum']]` — NOT the default `channels:` param in `withRouting()`, which assumes web/session auth. Auth endpoint lives at `POST /api/broadcasting/auth`.

Broadcast driver: `laravel/reverb` (BROADCAST_CONNECTION=reverb). Events implementing ShouldBroadcast auto-queue (QUEUE_CONNECTION=database), so a queue worker (`php artisan queue:work`) must run for broadcasts to actually fire. Run the Reverb server with `php artisan reverb:start`.

Channel authorization rules live in routes/channels.php. Example: `App\Events\OrderStatusUpdated` broadcasts on the private `orders` channel whenever an order is created or its status changes (see OrderController@store/@update) — any authenticated staff member (cashier/kitchen) can subscribe. Follow this pattern (dispatch a `ShouldBroadcast` event on the relevant private channel) for other realtime-worthy domain changes.
