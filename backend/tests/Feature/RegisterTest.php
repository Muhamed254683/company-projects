<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

// Otvorena registracija: POST /api/register.
class RegisterTest extends TestCase
{
    use RefreshDatabase;

    // Registracija je javna: test NE sme biti automatski prijavljen (vidi TestCase).
    protected bool $acting_as_api_user = false;

    private function data(array $overrides = []): array
    {
        return array_merge([
            'first_name' => 'Nova',
            'last_name' => 'Korisnica',
            'email' => 'nova@example.com',
            'password' => 'tajna1234',
            'password_confirmation' => 'tajna1234',
        ], $overrides);
    }

    public function test_register_creates_user_and_returns_token(): void
    {
        $response = $this->postJson('/api/register', $this->data());

        $response->assertCreated()
            ->assertJsonStructure(['token', 'user' => ['id', 'full_name', 'email']])
            ->assertJsonPath('user.full_name', 'Nova Korisnica')
            ->assertJsonPath('user.company_id', null)
            ->assertJsonMissingPath('user.password');

        $user = User::where('email', 'nova@example.com')->first();
        $this->assertTrue(Hash::check('tajna1234', $user->password), 'lozinka mora biti hesirana');
        $this->assertNotSame('tajna1234', $user->password);

        // Token odmah radi.
        $this->withToken($response->json('token'))->getJson('/api/me')->assertOk()->assertJsonPath('data.email', 'nova@example.com');
    }

    public function test_new_user_can_log_in_afterwards(): void
    {
        $this->postJson('/api/register', $this->data())->assertCreated();

        $this->postJson('/api/login', ['email' => 'nova@example.com', 'password' => 'tajna1234'])->assertOk();
    }

    public function test_validation_errors(): void
    {
        $this->postJson('/api/register', [
            'first_name' => '',
            'last_name' => '',
            'email' => 'nije-email',
            'password' => '123',
            'password_confirmation' => '456',
        ])->assertUnprocessable()->assertJsonValidationErrors(['first_name', 'last_name', 'email', 'password']);
    }

    public function test_passwords_must_match(): void
    {
        $this->postJson('/api/register', $this->data(['password_confirmation' => 'drugacija1']))
            ->assertUnprocessable()
            ->assertJsonPath('errors.password.0', 'The password field confirmation does not match.');
    }

    public function test_email_must_be_unique(): void
    {
        User::factory()->create(['email' => 'nova@example.com']);

        $this->postJson('/api/register', $this->data())
            ->assertUnprocessable()
            ->assertJsonPath('errors.email.0', 'The email has already been taken.');
    }

    public function test_registration_is_limited_to_3_attempts_per_minute(): void
    {
        for ($i = 1; $i <= 3; $i++) {
            $this->postJson('/api/register', $this->data(['email' => "nova{$i}@example.com"]))->assertCreated();
        }

        $this->postJson('/api/register', $this->data(['email' => 'nova4@example.com']))->assertTooManyRequests();
        $this->assertDatabaseMissing('users', ['email' => 'nova4@example.com']);
    }
}
