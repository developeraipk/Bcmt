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

        if (!$user->hasRole($roles)) {
            abort(403, 'Unauthorized portal access for your role.');
        }

        return $next($request);
    }
}
