<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Password;
use Tests\TestCase;

// Zaboravljena lozinka: POST /api/forgot-password i POST /api/reset-password.
class PasswordResetTest extends TestCase
{
    use RefreshDatabase;

    // Rute su javne: test NE sme biti automatski prijavljen (vidi TestCase).
    protected bool $acting_as_api_user = false;

    private const GENERIC_MESSAGE = 'If an account with that email exists, we have sent a password reset link.';

    protected function setUp(): void
    {
        parent::setUp();
        // Emailovi se ne salju, samo se pamti sta bi bilo poslato.
        Notification::fake();
    }

    private function resetData(User $user, string $token, array $overrides = []): array
    {
        return array_merge([
            'token' => $token,
            'email' => $user->email,
            'password' => 'novalozinka1',
            'password_confirmation' => 'novalozinka1',
        ], $overrides);
    }

    public function test_forgot_password_sends_link_to_frontend(): void
    {
        config(['app.frontend_url' => 'http://frontend.test']);
        $user = User::factory()->create(['email' => 'pera@example.com']);

        $this->postJson('/api/forgot-password', ['email' => 'pera@example.com'])
            ->assertOk()
            ->assertJsonPath('message', self::GENERIC_MESSAGE);

        Notification::assertSentTo($user, ResetPassword::class, function (ResetPassword $notification) use ($user) {
            $mail = $notification->toMail($user);

            // Link vodi na React stranicu, sa tokenom i emailom.
            return $mail->actionUrl === 'http://frontend.test/reset-password?token='.$notification->token.'&email=pera%40example.com'
                && $mail->subject === 'Nova lozinka';
        });
    }

    public function test_unknown_email_gets_same_answer_and_no_email(): void
    {
        $this->postJson('/api/forgot-password', ['email' => 'nepostoji@example.com'])
            ->assertOk()
            ->assertJsonPath('message', self::GENERIC_MESSAGE);

        Notification::assertNothingSent();
    }

    public function test_forgot_password_validates_email(): void
    {
        $this->postJson('/api/forgot-password', ['email' => 'nije-email'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['email']);
    }

    public function test_reset_changes_password_and_logs_out_everywhere(): void
    {
        $user = User::factory()->create(['password' => 'staralozinka']);
        $user->createToken('react');
        $user->createToken('telefon');
        $token = Password::createToken($user);

        $this->postJson('/api/reset-password', $this->resetData($user, $token))
            ->assertOk()
            ->assertJsonPath('message', 'Your password has been reset.');

        $user->refresh();
        $this->assertTrue(Hash::check('novalozinka1', $user->password));
        $this->assertSame(0, $user->tokens()->count(), 'svi stari tokeni moraju biti obrisani');

        // Prijava radi samo sa novom lozinkom.
        $this->postJson('/api/login', ['email' => $user->email, 'password' => 'novalozinka1'])->assertOk();
        $this->postJson('/api/login', ['email' => $user->email, 'password' => 'staralozinka'])->assertUnprocessable();

        // Link moze da se iskoristi samo jednom.
        $this->postJson('/api/reset-password', $this->resetData($user, $token, [
            'password' => 'trecalozinka',
            'password_confirmation' => 'trecalozinka',
        ]))->assertUnprocessable();
    }

    public function test_wrong_token_or_email_is_rejected(): void
    {
        $user = User::factory()->create(['password' => 'staralozinka']);
        $other = User::factory()->create();
        $token = Password::createToken($user);
        $message = 'This password reset link is invalid or has expired.';

        // Pogresan token.
        $this->postJson('/api/reset-password', $this->resetData($user, 'pogresan-token'))
            ->assertUnprocessable()
            ->assertJsonPath('errors.email.0', $message);

        // Ispravan token, ali tudji email.
        $this->postJson('/api/reset-password', $this->resetData($other, $token))
            ->assertUnprocessable()
            ->assertJsonPath('errors.email.0', $message);

        $this->assertTrue(Hash::check('staralozinka', $user->refresh()->password), 'lozinka se ne sme promeniti');
    }

    public function test_expired_token_is_rejected(): void
    {
        $user = User::factory()->create();
        $token = Password::createToken($user);

        // Link vazi 60 minuta (config/auth.php).
        $this->travel(61)->minutes();

        $this->postJson('/api/reset-password', $this->resetData($user, $token))
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['email']);
    }

    public function test_reset_validates_password(): void
    {
        $user = User::factory()->create();
        $token = Password::createToken($user);

        $this->postJson('/api/reset-password', $this->resetData($user, $token, [
            'password' => 'kratka',
            'password_confirmation' => 'druga',
        ]))
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['password']);
    }

    public function test_too_many_requests_are_limited(): void
    {
        for ($i = 0; $i < 5; $i++) {
            $this->postJson('/api/forgot-password', ['email' => "osoba{$i}@example.com"])->assertOk();
        }

        $this->postJson('/api/forgot-password', ['email' => 'osoba6@example.com'])->assertTooManyRequests();
    }
}
