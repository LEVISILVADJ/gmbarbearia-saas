<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class LoginController extends Controller
{
    /**
     * Login de usuário
     */
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
            'subdomain' => 'nullable|string',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['As credenciais fornecidas estão incorretas.'],
            ]);
        }

        // Se for um login de tenant específico, verificar acesso
        if ($request->subdomain) {
            $tenant = Tenant::where('subdomain', $request->subdomain)->first();
            
            if (!$tenant) {
                return response()->json([
                    'message' => 'Barbearia não encontrada'
                ], 404);
            }

            // Verificar se o usuário tem acesso a este tenant
            $hasAccess = $tenant->users()->where('user_id', $user->id)->exists() || $user->isSystemAdmin();
            
            if (!$hasAccess) {
                return response()->json([
                    'message' => 'Você não tem acesso a esta barbearia'
                ], 403);
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
        }

        // Gerar token de acesso
        $token = $user->createToken('auth_token')->plainTextToken;

        // Obter tenants do usuário
        $tenants = [];
        if (!$user->isSystemAdmin()) {
            $tenants = $user->tenantUsers()->with('tenant')->get()->map(function ($tenantUser) {
                return [
                    'id' => $tenantUser->tenant->id,
                    'name' => $tenantUser->tenant->name,
                    'subdomain' => $tenantUser->tenant->subdomain,
                    'role' => $tenantUser->role,
                    'status' => $tenantUser->tenant->status,
                    'is_active' => $tenantUser->tenant->isActive(),
                    'trial_ends_at' => $tenantUser->tenant->trial_ends_at,
                ];
            });
        } else {
            // Admin vê todos os tenants
            $tenants = Tenant::select('id', 'name', 'subdomain', 'status', 'trial_ends_at')->get()->map(function ($tenant) {
                return [
                    'id' => $tenant->id,
                    'name' => $tenant->name,
                    'subdomain' => $tenant->subdomain,
                    'role' => 'admin',
                    'status' => $tenant->status,
                    'is_active' => $tenant->isActive(),
                    'trial_ends_at' => $tenant->trial_ends_at,
                ];
            });
        }

        return response()->json([
            'message' => 'Login realizado com sucesso',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'is_admin' => $user->isSystemAdmin(),
            ],
            'tenants' => $tenants,
            'access_token' => $token,
            'token_type' => 'Bearer',
        ]);
    }

    /**
     * Logout de usuário
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logout realizado com sucesso'
        ]);
    }
}