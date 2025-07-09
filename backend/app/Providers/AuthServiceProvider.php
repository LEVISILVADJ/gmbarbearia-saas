<?php

namespace App\Providers;

use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Gate;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The model to policy mappings for the application.
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [
        //
    ];

    /**
     * Register any authentication / authorization services.
     */
    public function boot(): void
    {
        // Define gates para controle de acesso
        Gate::define('admin', function ($user) {
            return $user->isSystemAdmin();
        });

        Gate::define('tenant-admin', function ($user, $tenant) {
            return $user->isTenantAdmin($tenant);
        });

        Gate::define('tenant-owner', function ($user, $tenant) {
            return $user->isTenantOwner($tenant);
        });
    }
}