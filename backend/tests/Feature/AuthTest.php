<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

// Prijava preko Sanctum tokena: login, me, logout, zastita API-ja, ogranicenje pokusaja.
class AuthTest extends TestCase
{
    use RefreshDatabase;

    // Ovde NE zelimo automatsku prijavu iz TestCase: proveravamo bas prijavu.
    protected bool $acting_as_api_user = false;

    private function makeUser(): User
    {
        return User::factory()->create(['email' => 'ana@example.com', 'password' => 'tajna1234']);
    }

    private function login(string $email, string $password)
    {
        return $this->postJson('/api/login', ['email' => $email, 'password' => $password]);
    }

    public function test_login_returns_token_and_user(): void
    {
        $user = $this->makeUser();

        $response = $this->login('ana@example.com', 'tajna1234');

        $response->assertOk()
            ->assertJsonStructure(['token', 'user' => ['id', 'full_name', 'email']])
            ->assertJsonPath('user.id', $user->id)
            ->assertJsonMissingPath('user.password');
        $this->assertDatabaseCount('personal_access_tokens', 1);
    }

    public function test_wrong_password_and_unknown_email_give_the_same_error(): void
    {
        $this->makeUser();

        foreach ([['ana@example.com', 'pogresna'], ['nema@example.com', 'tajna1234']] as [$email, $password]) {
            $this->login($email, $password)
                ->assertUnprocessable()
                ->assertJsonPath('errors.email.0', 'The email or password is incorrect.');
        }
        $this->assertDatabaseCount('personal_access_tokens', 0);
    }

    public function test_api_requires_token(): void
    {
        $this->getJson('/api/companies')->assertUnauthorized();
        $this->getJson('/api/me')->assertUnauthorized();
        $this->postJson('/api/projects', [])->assertUnauthorized();
    }

    public function test_token_gives_access_and_me_returns_the_user(): void
    {
        $user = $this->makeUser();
        $token = $this->login('ana@example.com', 'tajna1234')->json('token');

        $this->withToken($token)->getJson('/api/companies')->assertOk();
        $this->withToken($token)->getJson('/api/me')->assertOk()->assertJsonPath('data.id', $user->id);
    }

    public function test_logout_revokes_only_the_current_token(): void
    {
        $this->makeUser();
        $first = $this->login('ana@example.com', 'tajna1234')->json('token');
        $second = $this->login('ana@example.com', 'tajna1234')->json('token');

        $this->withToken($first)->postJson('/api/logout')->assertNoContent();

        // Laravel u testu pamti prijavljenog korisnika izmedju zahteva; "zaboravljamo" ga kao da je nov zahtev.
        $this->app['auth']->forgetGuards();
        $this->withToken($first)->getJson('/api/me')->assertUnauthorized();

        $this->app['auth']->forgetGuards();
        $this->withToken($second)->getJson('/api/me')->assertOk();
    }

    public function test_user_cannot_delete_own_account(): void
    {
        $user = $this->makeUser();
        $other = User::factory()->create();
        $token = $this->login('ana@example.com', 'tajna1234')->json('token');

        $this->withToken($token)->deleteJson("/api/users/{$user->id}")
            ->assertForbidden()
            ->assertJsonPath('message', 'You cannot delete your own account.');
        $this->withToken($token)->deleteJson("/api/users/{$other->id}")->assertNoContent();
    }

    public function test_login_is_limited_to_5_attempts_per_minute(): void
    {
        $this->makeUser();

        for ($i = 1; $i <= 5; $i++) {
            $this->login('ana@example.com', 'pogresna')->assertUnprocessable();
        }

        // Sesti pokusaj (cak i sa tacnom lozinkom) je blokiran.
        $this->login('ana@example.com', 'tajna1234')->assertTooManyRequests();
    }
}
