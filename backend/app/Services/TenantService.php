<?php

namespace App\Services;

use App\Models\Tenant;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class TenantService
{
    /**
     * Criar um novo tenant
     */
    public function createTenant(array $data): Tenant
    {
        // Gerar ID único para o tenant
        $data['id'] = $data['id'] ?? Str::uuid()->toString();
        
        // Criar o tenant
        $tenant = Tenant::create($data);
        
        return $tenant;
    }

    /**
     * Inicializar o banco de dados do tenant
     */
    public function initializeTenantDatabase(Tenant $tenant): void
    {
        // Configurar conexão para o tenant
        config([
            'database.connections.tenant.database' => $tenant->getDatabaseName(),
        ]);

        // Criar banco de dados do tenant
        $this->createTenantDatabase($tenant);
        
        // Executar migrações para o tenant
        $this->runTenantMigrations($tenant);
        
        // Executar seeders para o tenant
        $this->runTenantSeeders($tenant);
    }

    /**
     * Criar o banco de dados do tenant
     */
    protected function createTenantDatabase(Tenant $tenant): void
    {
        $databaseName = $tenant->getDatabaseName();
        
        // Verificar se o banco já existe
        $databaseExists = DB::select(
            "SELECT 1 FROM pg_database WHERE datname = ?",
            [$databaseName]
        );
        
        if (empty($databaseExists)) {
            // Criar o banco de dados
            DB::statement("CREATE DATABASE {$databaseName}");
        }
    }

    /**
     * Executar migrações para o tenant
     */
    protected function runTenantMigrations(Tenant $tenant): void
    {
        // Configurar conexão para o tenant
        $this->configureTenantConnection($tenant);
        
        // Executar migrações
        Artisan::call('migrate', [
            '--database' => 'tenant',
            '--path' => 'database/migrations/tenant',
            '--force' => true,
        ]);
    }

    /**
     * Executar seeders para o tenant
     */
    protected function runTenantSeeders(Tenant $tenant): void
    {
        // Configurar conexão para o tenant
        $this->configureTenantConnection($tenant);
        
        // Executar seeders
        Artisan::call('db:seed', [
            '--database' => 'tenant',
            '--class' => 'TenantDatabaseSeeder',
            '--force' => true,
        ]);
    }

    /**
     * Configurar conexão para o tenant
     */
    protected function configureTenantConnection(Tenant $tenant): void
    {
        config([
            'database.connections.tenant.database' => $tenant->getDatabaseName(),
        ]);
        
        DB::purge('tenant');
        DB::reconnect('tenant');
    }

    /**
     * Verificar se o tenant está ativo
     */
    public function isTenantActive(Tenant $tenant): bool
    {
        // Verificar se está em período de teste
        if ($tenant->status === 'trial' && $tenant->trial_ends_at->isFuture()) {
            return true;
        }
        
        // Verificar se tem assinatura ativa
        if ($tenant->subscription && $tenant->subscription->isActive()) {
            return true;
        }
        
        return false;
    }

    /**
     * Atualizar configurações do tenant
     */
    public function updateTenantSettings(Tenant $tenant, array $settings): Tenant
    {
        $tenant->update($settings);
        return $tenant;
    }

    /**
     * Desativar tenant
     */
    public function deactivateTenant(Tenant $tenant): Tenant
    {
        $tenant->update([
            'status' => 'inactive',
        ]);
        
        return $tenant;
    }

    /**
     * Reativar tenant
     */
    public function reactivateTenant(Tenant $tenant): Tenant
    {
        $tenant->update([
            'status' => 'active',
        ]);
        
        return $tenant;
    }
}