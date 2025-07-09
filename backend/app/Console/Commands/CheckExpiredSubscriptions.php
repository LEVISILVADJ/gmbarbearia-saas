<?php

namespace App\Console\Commands;

use App\Models\Subscription;
use App\Models\Tenant;
use App\Services\SubscriptionService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class CheckExpiredSubscriptions extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'subscriptions:check-expired';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Verifica assinaturas expiradas e atualiza status';

    /**
     * Execute the console command.
     */
    public function handle(SubscriptionService $subscriptionService)
    {
        $this->info('Verificando assinaturas expiradas...');
        
        // Buscar assinaturas ativas com próximo pagamento vencido
        $expiredSubscriptions = Subscription::where('status', 'active')
            ->whereNotNull('next_billing_at')
            ->where('next_billing_at', '<', now())
            ->get();
        
        $this->info("Encontradas {$expiredSubscriptions->count()} assinaturas vencidas.");
        
        foreach ($expiredSubscriptions as $subscription) {
            $this->info("Processando assinatura {$subscription->id} do tenant {$subscription->tenant_id}");
            
            try {
                // Marcar como vencida
                $subscriptionService->markAsPastDue($subscription);
                
                $this->info("Assinatura {$subscription->id} marcada como vencida.");
            } catch (\Exception $e) {
                $this->error("Erro ao processar assinatura {$subscription->id}: {$e->getMessage()}");
                Log::error("Erro ao processar assinatura expirada", [
                    'subscription_id' => $subscription->id,
                    'error' => $e->getMessage()
                ]);
            }
        }
        
        // Verificar tenants com período de teste expirado
        $expiredTrials = Tenant::where('status', 'trial')
            ->whereNotNull('trial_ends_at')
            ->where('trial_ends_at', '<', now())
            ->get();
        
        $this->info("Encontrados {$expiredTrials->count()} períodos de teste expirados.");
        
        foreach ($expiredTrials as $tenant) {
            $this->info("Processando tenant {$tenant->id} com período de teste expirado");
            
            try {
                // Se não tiver assinatura ativa, desativar
                if (!$tenant->subscription || !$tenant->subscription->isActive()) {
                    $tenant->update([
                        'status' => 'inactive',
                        'subscription_status' => 'expired'
                    ]);
                    
                    $this->info("Tenant {$tenant->id} desativado por período de teste expirado.");
                }
            } catch (\Exception $e) {
                $this->error("Erro ao processar tenant {$tenant->id}: {$e->getMessage()}");
                Log::error("Erro ao processar tenant com período de teste expirado", [
                    'tenant_id' => $tenant->id,
                    'error' => $e->getMessage()
                ]);
            }
        }
        
        $this->info('Verificação de assinaturas concluída.');
        
        return 0;
    }
}