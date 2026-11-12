<?php

namespace App\Providers;

use App\Models\User;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Prijava: najvise 5 pokusaja u minuti za isti email sa iste IP adrese (zastita od pogadjanja lozinke).
        // Sesti pokusaj vraca 429 Too Many Requests.
        RateLimiter::for('login', function (Request $request) {
            return Limit::perMinute(5)->by(mb_strtolower((string) $request->input('email')).'|'.$request->ip());
        });

        // Registracija: najvise 3 pokusaja u minuti sa iste IP adrese (zastita od botova koji prave naloge).
        RateLimiter::for('register', function (Request $request) {
            return Limit::perMinute(3)->by($request->ip());
        });

        // Zaboravljena lozinka: najvise 5 zahteva u minuti sa iste IP adrese (da niko ne zatrpa nekoga emailovima
        // i ne pogadja token). Laravel uz to dozvoljava novi link za isti nalog tek posle 60 sekundi (config/auth.php).
        RateLimiter::for('password-reset', function (Request $request) {
            return Limit::perMinute(5)->by($request->ip());
        });

        // Link iz emaila vodi na React stranicu (FRONTEND_URL iz .env), a ne na Laravel.
        $reset_url = function (User $user, string $token): string {
            return config('app.frontend_url').'/reset-password?'.http_build_query([
                'token' => $token,
                'email' => $user->getEmailForPasswordReset(),
            ]);
        };
        ResetPassword::createUrlUsing($reset_url);

        // Tekst emaila na srpskom (kao i aplikacija).
        ResetPassword::toMailUsing(function (User $user, string $token) use ($reset_url) {
            $url = $reset_url($user, $token);

            return (new MailMessage)
                ->subject('Nova lozinka')
                ->greeting('Zdravo, '.$user->first_name.'!')
                ->line('Dobili ste ovaj email jer je zatražena nova lozinka za vaš nalog.')
                ->action('Postavi novu lozinku', $url)
                ->line('Link važi '.config('auth.passwords.users.expire').' minuta i može se iskoristiti samo jednom.')
                ->line('Ako niste vi tražili novu lozinku, samo ignorišite ovaj email.')
                ->salutation('Company Projects');
        });
    }
}
