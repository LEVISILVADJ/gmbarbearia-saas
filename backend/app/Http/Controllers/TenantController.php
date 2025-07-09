<?php

namespace App\Http\Controllers;

use App\Models\Tenant;
use App\Services\TenantService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class TenantController extends Controller
{
    protected $tenantService;

    public function __construct(TenantService $tenantService)
    {
        $this->tenantService = $tenantService;
        $this->middleware('auth:sanctum');
    }

    /**
     * Obter informações do tenant atual
     */
    public function show(Request $request, $subdomain)
    {
        $tenant = Tenant::where('subdomain', $subdomain)->firstOrFail();
        
        // Verificar se o usuário tem acesso ao tenant
        $user = $request->user();
        if (!$user->isSystemAdmin() && !$tenant->users()->where('user_id', $user->id)->exists()) {
            return response()->json(['message' => 'Acesso não autorizado'], 403);
        }
        
        return response()->json([
            'tenant' => $tenant,
            'is_active' => $tenant->isActive(),
            'trial_remaining_days' => $tenant->getRemainingTrialDays(),
            'subscription' => $tenant->subscription,
        ]);
    }

    /**
     * Atualizar configurações do tenant
     */
    public function update(Request $request, $subdomain)
    {
        $tenant = Tenant::where('subdomain', $subdomain)->firstOrFail();
        
        // Verificar se o usuário tem acesso ao tenant
        $user = $request->user();
        if (!$user->isSystemAdmin() && !$tenant->users()->where('user_id', $user->id)->where('role', 'admin')->exists()) {
            return response()->json(['message' => 'Acesso não autorizado'], 403);
        }
        
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'logo_url' => 'sometimes|nullable|string',
            'primary_color' => 'sometimes|string|max:20',
            'secondary_color' => 'sometimes|string|max:20',
            'theme_mode' => 'sometimes|string|in:dark,light',
        ]);
        
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        
        // Processar upload de logo se enviado
        if ($request->hasFile('logo')) {
            $file = $request->file('logo');
            $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();
            $path = $file->storeAs('logos', $filename, 'public');
            $request->merge(['logo_url' => Storage::url($path)]);
        }
        
        // Atualizar tenant
        $tenant = $this->tenantService->updateTenantSettings($tenant, $request->all());
        
        return response()->json([
            'message' => 'Configurações atualizadas com sucesso',
            'tenant' => $tenant,
        ]);
    }

    /**
     * Verificar disponibilidade de subdomínio
     */
    public function checkSubdomain(Request $request)
    {
        $subdomain = $request->input('subdomain');
        
        $validator = Validator::make(['subdomain' => $subdomain], [
            'subdomain' => 'required|string|max:50|alpha_dash',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'available' => false,
                'message' => 'Subdomínio inválido. Use apenas letras, números e traços.',
            ]);
        }
        
        $exists = Tenant::where('subdomain', $subdomain)->exists();
        
        return response()->json([
            'available' => !$exists,
            'message' => $exists ? 'Este subdomínio já está em uso' : 'Subdomínio disponível',
        ]);
    }
}