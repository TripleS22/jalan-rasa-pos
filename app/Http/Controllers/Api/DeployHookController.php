<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;

/**
 * Shared hosting (InfinityFree) has no SSH — nothing can run `artisan
 * migrate` on the server directly. This token-gated endpoint is the
 * standard workaround: CI hits it once over HTTPS right after each FTP
 * deploy, and it runs migrate (+ seed, once) through the already-deployed
 * app itself, using its own localhost DB connection.
 */
class DeployHookController extends Controller
{
    public function migrate(Request $request)
    {
        $expected = (string) config('app.deploy_hook_token');
        $given = (string) $request->input('token');

        abort_unless($expected !== '' && hash_equals($expected, $given), 403);

        Artisan::call('migrate', ['--force' => true]);
        $migrateOutput = Artisan::output();

        $seedOutput = 'skipped (already seeded)';

        if (! file_exists(storage_path('.seeded'))) {
            Artisan::call('db:seed', ['--force' => true]);
            $seedOutput = Artisan::output();
            file_put_contents(storage_path('.seeded'), now()->toDateTimeString());
        }

        Artisan::call('config:cache');
        Artisan::call('route:cache');
        Artisan::call('view:cache');

        return response()->json([
            'migrate' => $migrateOutput,
            'seed' => $seedOutput,
        ]);
    }
}
