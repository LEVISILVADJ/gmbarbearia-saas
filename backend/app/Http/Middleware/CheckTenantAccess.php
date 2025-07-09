<?php

namespace App\Http\Middleware;

use App\Models\Tenant;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckTenantAccess
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $subdomain = $request->route('subdomain');
        
        if (!$subdomain) {
            return response()->json(['message' => 'Subdomínio não fornecido'], 400);
        }
        
        $tenant = Tenant::where('subdomain', $subdomain)->first();
        
        if (!$tenant) {
            return response()->json(['message' => 'Barbearia não encontrada'], 404);
        }
        
        // Verificar se o usuário tem acesso ao tenant
        $user = $request->user();
        if (!$user->isSystemAdmin() && !$tenant->users()->where('user_id', $user->id)->exists()) {
            return response()->json(['message' => 'Acesso não autorizado'], 403);
        }
        
        // Verificar se o tenant está ativo ou em período de teste
        if (!$tenant->isActive() && !$user->isSystemAdmin()) {
            if ($tenant->hasExpiredTrial()) {
                return response()->json([
                    'message' => 'O período de teste expirou. Por favor, assine um plano para continuar.',
                    'code' => 'trial_expired',
                    'tenant' => $tenant
                ], 403);
            } else {
                return response()->json([
                    'message' => 'Esta barbearia está inativa',
                    'code' => 'tenant_inactive',
                    'tenant' => $tenant
                ], 403);
            }
        }
        
        // Adicionar tenant à requisição
        $request->attributes->add(['tenant' => $tenant]);
        
        return $next($request);
    }
}