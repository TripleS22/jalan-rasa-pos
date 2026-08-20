<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\File;
use Tests\TestCase;

class DeployHookControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_refuses_when_no_token_is_configured(): void
    {
        Config::set('app.deploy_hook_token', null);

        $response = $this->postJson('/api/_deploy/migrate', ['token' => 'anything']);

        $response->assertForbidden();
    }

    public function test_it_refuses_an_incorrect_token(): void
    {
        Config::set('app.deploy_hook_token', 'correct-token');

        $response = $this->postJson('/api/_deploy/migrate', ['token' => 'wrong-token']);

        $response->assertForbidden();
    }

    public function test_it_migrates_and_seeds_once_with_the_correct_token(): void
    {
        Config::set('app.deploy_hook_token', 'correct-token');
        File::delete(storage_path('.seeded'));

        $response = $this->postJson('/api/_deploy/migrate', ['token' => 'correct-token']);

        $response->assertOk();
        $this->assertTrue(File::exists(storage_path('.seeded')));
        $this->assertDatabaseHas('users', ['email' => 'owner@jalanrasa.test']);

        File::delete(storage_path('.seeded'));
    }

    public function test_it_skips_seeding_on_subsequent_calls(): void
    {
        Config::set('app.deploy_hook_token', 'correct-token');
        File::put(storage_path('.seeded'), now()->toDateTimeString());

        $response = $this->postJson('/api/_deploy/migrate', ['token' => 'correct-token']);

        $response->assertOk()
            ->assertJson(['seed' => 'skipped (already seeded)']);

        File::delete(storage_path('.seeded'));
    }
}
