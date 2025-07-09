<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use App\Models\TenantUser;
use App\Models\User;
use App\Services\TenantService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class RegisterController extends Controller
{
    protected $tenantService;

    public function __construct(TenantService $tenantService)
    {
        $this->tenantService = $tenantService;
    }

    /**
     * Registrar um novo cliente com tenant
     */
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'business_name' => 'required|string|max:255',
            'subdomain' => 'required|string|max:50|unique:tenants,subdomain|alpha_dash',
            'phone' => 'nullable|string|max:20',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            DB::beginTransaction();

            // Criar usuário
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
            ]);

            // Criar tenant
            $tenant = $this->tenantService->createTenant([
                'name' => $request->business_name,
                'subdomain' => $request->subdomain,
                'owner_id' => $user->id,
                'status' => 'trial',
                'trial_ends_at' => now()->addDays(config('app.trial_days', 10)),
                'primary_color' => '#f59e0b',
                'secondary_color' => '#ea580c',
                'theme_mode' => 'dark',
            ]);

            // Associar usuário ao tenant como proprietário
            TenantUser::create([
                'tenant_id' => $tenant->id,
                'user_id' => $user->id,
                'role' => 'owner',
            ]);

            // Inicializar banco de dados do tenant
            $this->tenantService->initializeTenantDatabase($tenant);

            DB::commit();

            // Gerar token de acesso
            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'message' => 'Cadastro realizado com sucesso!',
                'user' => $user,
                'tenant' => $tenant,
                'access_token' => $token,
                'token_type' => 'Bearer',
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Erro ao criar conta',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}