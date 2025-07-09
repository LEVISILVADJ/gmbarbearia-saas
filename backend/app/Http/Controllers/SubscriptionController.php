<?php

namespace App\Http\Controllers;

use App\Models\Tenant;
use App\Services\SubscriptionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class SubscriptionController extends Controller
{
    protected $subscriptionService;

    public function __construct(SubscriptionService $subscriptionService)
    {
        $this->subscriptionService = $subscriptionService;
        $this->middleware('auth:sanctum');
    }

    /**
     * Iniciar processo de assinatura
     */
    public function subscribe(Request $request, $subdomain)
    {
        $tenant = Tenant::where('subdomain', $subdomain)->firstOrFail();
        
        // Verificar se o usuário tem acesso ao tenant
        $user = $request->user();
        if (!$user->isSystemAdmin() && !$tenant->users()->where('user_id', $user->id)->exists()) {
            return response()->json(['message' => 'Acesso não autorizado'], 403);
        }
        
        $validator = Validator::make($request->all(), [
            'plan' => 'required|string|in:basic,premium,enterprise',
            'payment_method' => 'required|string|in:credit_card,boleto,pix',
        ]);
        
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        
        // Criar assinatura
        $subscription = $this->subscriptionService->createSubscription(
            $tenant,
            $request->plan,
            $request->payment_method
        );
        
        // Criar preferência de pagamento no MercadoPago
        $preferenceResult = $this->subscriptionService->createPaymentPreference($tenant, $subscription);
        
        if (!$preferenceResult['success']) {
            return response()->json([
                'message' => 'Erro ao criar preferência de pagamento',
                'error' => $preferenceResult['message'] ?? 'Erro desconhecido',
            ], 500);
        }
        
        return response()->json([
            'message' => 'Assinatura iniciada com sucesso',
            'subscription' => $subscription,
            'payment' => [
                'preference_id' => $preferenceResult['preference_id'],
                'init_point' => $preferenceResult['init_point'],
                'sandbox_init_point' => $preferenceResult['sandbox_init_point'],
            ],
        ]);
    }

    /**
     * Cancelar assinatura
     */
    public function cancel(Request $request, $subdomain)
    {
        $tenant = Tenant::where('subdomain', $subdomain)->firstOrFail();
        
        // Verificar se o usuário tem acesso ao tenant
        $user = $request->user();
        if (!$user->isSystemAdmin() && !$tenant->users()->where('user_id', $user->id)->where('role', 'admin')->exists()) {
            return response()->json(['message' => 'Acesso não autorizado'], 403);
        }
        
        // Verificar se o tenant tem assinatura
        if (!$tenant->subscription) {
            return response()->json(['message' => 'Este tenant não possui assinatura'], 404);
        }
        
        // Cancelar assinatura
        $this->subscriptionService->cancelSubscription($tenant->subscription, 'user_requested');
        
        return response()->json([
            'message' => 'Assinatura cancelada com sucesso',
        ]);
    }

    /**
     * Callback de sucesso do pagamento
     */
    public function callbackSuccess(Request $request)
    {
        // Redirecionar para o frontend com status de sucesso
        return redirect(config('app.frontend_url') . '/payment/success');
    }

    /**
     * Callback de falha do pagamento
     */
    public function callbackFailure(Request $request)
    {
        // Redirecionar para o frontend com status de falha
        return redirect(config('app.frontend_url') . '/payment/failure');
    }

    /**
     * Callback de pagamento pendente
     */
    public function callbackPending(Request $request)
    {
        // Redirecionar para o frontend com status pendente
        return redirect(config('app.frontend_url') . '/payment/pending');
    }
}