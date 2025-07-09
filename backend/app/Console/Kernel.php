<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    /**
     * Define the application's command schedule.
     */
    protected function schedule(Schedule $schedule): void
    {
        // Verificar assinaturas expiradas diariamente
        $schedule->command('subscriptions:check-expired')->daily();
        
        // Enviar lembretes de período de teste próximo do fim
        $schedule->command('trials:send-reminders')->daily();
        
        // Enviar mensagens de aniversário
        $schedule->command('clients:send-birthday-messages')->dailyAt('08:00');
        
        // Enviar mensagens de retenção para clientes inativos
        $schedule->command('clients:send-retention-messages')->weekly();
        
        // Backup do banco de dados
        $schedule->command('backup:run')->daily()->at('03:00');
    }

    /**
     * Register the commands for the application.
     */
    protected function commands(): void
    {
        $this->load(__DIR__.'/Commands');

        require base_path('routes/console.php');
    }
}