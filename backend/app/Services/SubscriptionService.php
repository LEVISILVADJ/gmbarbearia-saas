<?php

namespace App\Services;

use App\Models\Payment;
use App\Models\Subscription;
use App\Models\Tenant;
use Illuminate\Support\Facades\Log;
use MercadoPago\Client\Payment\PaymentClient;
use MercadoPago\Client\Preference\PreferenceClient;
use MercadoPago\Exceptions\MPApiException;
use MercadoPago\MercadoPagoConfig;

class SubscriptionService
{
    protected $mercadoPagoClient;
    protected $tenantService;

    public function __construct(TenantService $tenantService)
    {
        $this->tenantService = $tenantService;
        
        // Configurar MercadoPago
        if (config('services.mercadopago.access_token')) {
            MercadoPagoConfig::setAccessToken(config('services.mercadopago.access_token'));
            $this->mercadoPagoClient = new PreferenceClient();
        }
    }

    /**
     * Criar uma nova assinatura
     */
    public function createSubscription(Tenant $tenant, string $plan, string $paymentMethod): Subscription
    {
        // Obter preço do plano
        $amount = $this->getPlanPrice($plan);
        
        // Criar assinatura no banco de dados
        $subscription = Subscription::create([
            'tenant_id' => $tenant->id,
            'provider' => 'mercadopago',
            'status' => 'pending',
            'plan' => $plan,
            'amount' => $amount,
            'currency' => 'BRL',
            'billing_cycle' => 'monthly',
            'trial_ends_at' => $tenant->trial_ends_at,
            'payment_method' => $paymentMethod,
        ]);
        
        // Atualizar tenant
        $tenant->update([
            'subscription_id' => $subscription->id,
            'subscription_status' => 'pending',
            'subscription_plan' => $plan,
            'subscription_price' => $amount,
        ]);
        
        return $subscription;
    }

    /**
     * Criar preferência de pagamento no MercadoPago
     */
    public function createPaymentPreference(Tenant $tenant, Subscription $subscription): array
    {
        try {
            $preferenceData = [
                'items' => [
                    [
                        'id' => $subscription->id,
                        'title' => "Assinatura {$subscription->plan} - {$tenant->name}",
                        'quantity' => 1,
                        'unit_price' => $subscription->amount,
                        'currency_id' => 'BRL',
                    ]
                ],
                'back_urls' => [
                    'success' => route('subscription.callback.success'),
                    'failure' => route('subscription.callback.failure'),
                    'pending' => route('subscription.callback.pending'),
                ],
                'auto_return' => 'approved',
                'notification_url' => route('webhooks.mercadopago'),
                'external_reference' => $subscription->id,
                'metadata' => [
                    'tenant_id' => $tenant->id,
                    'subscription_id' => $subscription->id,
                    'plan' => $subscription->plan,
                ]
            ];
            
            $preference = $this->mercadoPagoClient->create($preferenceData);
            
            return [
                'success' => true,
                'preference_id' => $preference->id,
                'init_point' => $preference->init_point,
                'sandbox_init_point' => $preference->sandbox_init_point,
            ];
        } catch (MPApiException $e) {
            Log::error('Erro ao criar preferência no MercadoPago', [
                'error' => $e->getMessage(),
                'tenant_id' => $tenant->id,
                'subscription_id' => $subscription->id,
            ]);
            
            return [
                'success' => false,
                'message' => 'Erro ao criar preferência de pagamento',
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Processar pagamento recebido
     */
    public function processPayment(array $paymentData): void
    {
        $paymentId = $paymentData['id'] ?? null;
        
        if (!$paymentId) {
            Log::error('ID de pagamento não fornecido', $paymentData);
            return;
        }
        
        try {
            // Obter detalhes do pagamento no MercadoPago
            $paymentClient = new PaymentClient();
            $payment = $paymentClient->get($paymentId);
            
            // Verificar se o pagamento está relacionado a uma assinatura
            $externalReference = $payment->external_reference;
            $subscription = Subscription::find($externalReference);
            
            if (!$subscription) {
                Log::error('Assinatura não encontrada', [
                    'payment_id' => $paymentId,
                    'external_reference' => $externalReference,
                ]);
                return;
            }
            
            // Registrar o pagamento
            $paymentRecord = Payment::create([
                'tenant_id' => $subscription->tenant_id,
                'subscription_id' => $subscription->id,
                'provider' => 'mercadopago',
                'provider_payment_id' => $paymentId,
                'amount' => $payment->transaction_amount,
                'currency' => $payment->currency_id,
                'status' => $payment->status,
                'payment_method' => $payment->payment_method_id,
                'payment_date' => now(),
                'metadata' => json_encode($payment),
            ]);
            
            // Atualizar status da assinatura
            if ($payment->status === 'approved') {
                $this->activateSubscription($subscription);
            } else if (in_array($payment->status, ['rejected', 'cancelled'])) {
                $this->cancelSubscription($subscription, 'payment_failed');
            }
        } catch (\Exception $e) {
            Log::error('Erro ao processar pagamento', [
                'payment_id' => $paymentId,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Ativar assinatura
     */
    public function activateSubscription(Subscription $subscription): void
    {
        // Atualizar assinatura
        $subscription->update([
            'status' => 'active',
            'next_billing_at' => now()->addMonth(),
        ]);
        
        // Atualizar tenant
        $tenant = $subscription->tenant;
        $tenant->update([
            'status' => 'active',
            'subscription_status' => 'active',
            'next_payment_at' => now()->addMonth(),
            'last_payment_at' => now(),
        ]);
    }

    /**
     * Marcar assinatura como vencida
     */
    public function markAsPastDue(Subscription $subscription): void
    {
        // Atualizar assinatura
        $subscription->update([
            'status' => 'past_due',
        ]);
        
        // Atualizar tenant
        $tenant = $subscription->tenant;
        $tenant->update([
            'subscription_status' => 'past_due',
        ]);
        
        // Se o período de teste já expirou, desativar o tenant
        if ($tenant->hasExpiredTrial()) {
            $tenant->update([
                'status' => 'inactive',
            ]);
        }
    }

    /**
     * Cancelar assinatura
     */
    public function cancelSubscription(Subscription $subscription, string $reason = 'user_requested'): void
    {
        // Atualizar assinatura
        $subscription->update([
            'status' => 'canceled',
            'canceled_at' => now(),
            'metadata' => array_merge((array) $subscription->metadata, ['cancel_reason' => $reason]),
        ]);
        
        // Atualizar tenant
        $tenant = $subscription->tenant;
        $tenant->update([
            'subscription_status' => 'canceled',
        ]);
        
        // Se o período de teste já expirou, desativar o tenant
        if ($tenant->hasExpiredTrial()) {
            $tenant->update([
                'status' => 'inactive',
            ]);
        }
    }

    /**
     * Obter preço do plano
     */
    protected function getPlanPrice(string $plan): float
    {
        $prices = [
            'basic' => config('app.subscription_basic_price', 99.90),
            'premium' => config('app.subscription_premium_price', 149.90),
            'enterprise' => config('app.subscription_enterprise_price', 299.90),
        ];
        
        return $prices[$plan] ?? $prices['basic'];
    }
}