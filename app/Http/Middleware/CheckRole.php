<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (!$user) {
            return redirect()->route('login');
        }

        if ($user->hasRole('super_admin')) {
            return $next($request);
        }

        $allowedRoles = collect($roles)
            ->flatMap(fn ($r) => explode(',', $r))
            ->flatMap(fn ($r) => explode('|', $r))
            ->filter()
            ->values()
            ->all();

        if (!$user->hasRole($allowedRoles)) {
            abort(403, 'Unauthorized portal access for your role.');
        }

        return $next($request);
    }
}
