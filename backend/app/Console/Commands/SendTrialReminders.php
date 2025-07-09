<?php

namespace App\Console\Commands;

use App\Models\Tenant;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class SendTrialReminders extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'trials:send-reminders';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Envia lembretes para tenants com período de teste próximo do fim';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Enviando lembretes de período de teste...');
        
        // Buscar tenants com período de teste que expira em 3 dias
        $expiringTrials = Tenant::where('status', 'trial')
            ->whereNotNull('trial_ends_at')
            ->whereDate('trial_ends_at', '=', now()->addDays(3)->toDateString())
            ->get();
        
        $this->info("Encontrados {$expiringTrials->count()} tenants com período de teste expirando em 3 dias.");
        
        foreach ($expiringTrials as $tenant) {
            $this->info("Processando tenant {$tenant->id} ({$tenant->name})");
            
            try {
                // Enviar e-mail de lembrete
                // Aqui você implementaria o envio de e-mail
                
                $this->info("Lembrete enviado para tenant {$tenant->id}");
            } catch (\Exception $e) {
                $this->error("Erro ao enviar lembrete para tenant {$tenant->id}: {$e->getMessage()}");
                Log::error("Erro ao enviar lembrete de período de teste", [
                    'tenant_id' => $tenant->id,
                    'error' => $e->getMessage()
                ]);
            }
        }
        
        // Buscar tenants com período de teste que expira em 1 dia
        $urgentExpiringTrials = Tenant::where('status', 'trial')
            ->whereNotNull('trial_ends_at')
            ->whereDate('trial_ends_at', '=', now()->addDay()->toDateString())
            ->get();
        
        $this->info("Encontrados {$urgentExpiringTrials->count()} tenants com período de teste expirando em 1 dia.");
        
        foreach ($urgentExpiringTrials as $tenant) {
            $this->info("Processando tenant {$tenant->id} ({$tenant->name})");
            
            try {
                // Enviar e-mail de lembrete urgente
                // Aqui você implementaria o envio de e-mail
                
                $this->info("Lembrete urgente enviado para tenant {$tenant->id}");
            } catch (\Exception $e) {
                $this->error("Erro ao enviar lembrete urgente para tenant {$tenant->id}: {$e->getMessage()}");
                Log::error("Erro ao enviar lembrete urgente de período de teste", [
                    'tenant_id' => $tenant->id,
                    'error' => $e->getMessage()
                ]);
            }
        }
        
        $this->info('Envio de lembretes concluído.');
        
        return 0;
    }
}