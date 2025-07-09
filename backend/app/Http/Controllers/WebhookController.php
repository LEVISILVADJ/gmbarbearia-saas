<?php

namespace App\Http\Controllers;

use App\Services\SubscriptionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class WebhookController extends Controller
{
    protected $subscriptionService;

    public function __construct(SubscriptionService $subscriptionService)
    {
        $this->subscriptionService = $subscriptionService;
    }

    /**
     * Webhook do MercadoPago
     */
    public function mercadoPago(Request $request)
    {
        Log::info('Webhook do MercadoPago recebido', $request->all());
        
        $type = $request->input('type');
        $data = $request->input('data');
        
        if ($type === 'payment') {
            $paymentId = $data['id'] ?? null;
            
            if ($paymentId) {
                // Processar pagamento
                $this->subscriptionService->processPayment([
                    'id' => $paymentId,
                ]);
                
                return response()->json(['message' => 'Webhook processado com sucesso']);
            }
        }
        
        return response()->json(['message' => 'Webhook recebido, mas não processado']);
    }
}