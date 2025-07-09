<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use App\Services\TenantService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AdminTenantController extends Controller
{
    protected $tenantService;

    public function __construct(TenantService $tenantService)
    {
        $this->tenantService = $tenantService;
        $this->middleware('auth:sanctum');
        $this->middleware('admin');
    }

    /**
     * Listar todos os tenants
     */
    public function index(Request $request)
    {
        $query = Tenant::query();
        
        // Filtros
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('subdomain', 'like', "%{$search}%");
            });
        }
        
        // Ordenação
        $sortBy = $request->input('sort_by', 'created_at');
        $sortDir = $request->input('sort_dir', 'desc');
        $query->orderBy($sortBy, $sortDir);
        
        // Paginação
        $perPage = $request->input('per_page', 15);
        $tenants = $query->paginate($perPage);
        
        return response()->json($tenants);
    }

    /**
     * Obter detalhes de um tenant
     */
    public function show($id)
    {
        $tenant = Tenant::with(['owner', 'subscription', 'payments'])->findOrFail($id);
        
        return response()->json([
            'tenant' => $tenant,
            'is_active' => $tenant->isActive(),
            'trial_remaining_days' => $tenant->getRemainingTrialDays(),
        ]);
    }

    /**
     * Atualizar um tenant
     */
    public function update(Request $request, $id)
    {
        $tenant = Tenant::findOrFail($id);
        
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'subdomain' => 'sometimes|string|max:50|alpha_dash|unique:tenants,subdomain,' . $tenant->id,
            'status' => 'sometimes|string|in:trial,active,inactive',
            'trial_ends_at' => 'sometimes|date',
            'subscription_status' => 'sometimes|string|in:pending,active,canceled,expired',
        ]);
        
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        
        // Atualizar tenant
        $tenant = $this->tenantService->updateTenantSettings($tenant, $request->all());
        
        return response()->json([
            'message' => 'Tenant atualizado com sucesso',
            'tenant' => $tenant,
        ]);
    }

    /**
     * Estender período de teste
     */
    public function extendTrial(Request $request, $id)
    {
        $tenant = Tenant::findOrFail($id);
        
        $validator = Validator::make($request->all(), [
            'days' => 'required|integer|min:1',
        ]);
        
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        
        // Estender período de teste
        $currentTrialEnd = $tenant->trial_ends_at ?? now();
        $newTrialEnd = $currentTrialEnd->addDays($request->days);
        
        $tenant->update([
            'trial_ends_at' => $newTrialEnd,
            'status' => 'trial',
        ]);
        
        return response()->json([
            'message' => 'Período de teste estendido com sucesso',
            'tenant' => $tenant,
        ]);
    }

    /**
     * Ativar/desativar tenant
     */
    public function toggleActive(Request $request, $id)
    {
        $tenant = Tenant::findOrFail($id);
        
        if ($tenant->status === 'inactive') {
            $tenant = $this->tenantService->reactivateTenant($tenant);
            $message = 'Tenant ativado com sucesso';
        } else {
            $tenant = $this->tenantService->deactivateTenant($tenant);
            $message = 'Tenant desativado com sucesso';
        }
        
        return response()->json([
            'message' => $message,
            'tenant' => $tenant,
        ]);
    }

    /**
     * Obter estatísticas dos tenants
     */
    public function stats()
    {
        $totalTenants = Tenant::count();
        $activeTenants = Tenant::where('status', 'active')->count();
        $trialTenants = Tenant::where('status', 'trial')->count();
        $inactiveTenants = Tenant::where('status', 'inactive')->count();
        
        $recentTenants = Tenant::orderBy('created_at', 'desc')
            ->limit(5)
            ->get();
        
        $expiringTrials = Tenant::where('status', 'trial')
            ->where('trial_ends_at', '<=', now()->addDays(3))
            ->where('trial_ends_at', '>', now())
            ->orderBy('trial_ends_at')
            ->limit(5)
            ->get();
        
        return response()->json([
            'total_tenants' => $totalTenants,
            'active_tenants' => $activeTenants,
            'trial_tenants' => $trialTenants,
            'inactive_tenants' => $inactiveTenants,
            'recent_tenants' => $recentTenants,
            'expiring_trials' => $expiringTrials,
        ]);
    }
}