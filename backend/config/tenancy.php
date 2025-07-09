<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Tenant Database Connection
    |--------------------------------------------------------------------------
    |
    | This is the connection that will be used for tenant databases.
    |
    */
    'database' => [
        'connection' => 'tenant',
        'prefix' => env('TENANT_DATABASE_PREFIX', 'tenant_'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Tenant Routes
    |--------------------------------------------------------------------------
    |
    | Here you can configure how tenant routes are identified and handled.
    |
    */
    'routes' => [
        'prefix' => 'tenant',
        'middleware' => ['web', 'tenant'],
    ],

    /*
    |--------------------------------------------------------------------------
    | Tenant Identification
    |--------------------------------------------------------------------------
    |
    | Here you can configure how tenants are identified.
    |
    */
    'identification' => [
        'domain' => [
            'enabled' => true,
        ],
        'subdomain' => [
            'enabled' => true,
        ],
        'path' => [
            'enabled' => true,
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Tenant Storage
    |--------------------------------------------------------------------------
    |
    | Here you can configure how tenant storage is handled.
    |
    */
    'storage' => [
        'disk' => 'tenant',
        'suffix' => 'tenant',
    ],

    /*
    |--------------------------------------------------------------------------
    | Tenant Cache
    |--------------------------------------------------------------------------
    |
    | Here you can configure how tenant cache is handled.
    |
    */
    'cache' => [
        'prefix' => 'tenant',
    ],

    /*
    |--------------------------------------------------------------------------
    | Tenant Bootstrappers
    |--------------------------------------------------------------------------
    |
    | Here you can configure the bootstrappers that will be run when a tenant
    | is initialized.
    |
    */
    'bootstrappers' => [
        // Database bootstrapper
        \Stancl\Tenancy\Bootstrappers\DatabaseTenancyBootstrapper::class,
        
        // Cache bootstrapper
        \Stancl\Tenancy\Bootstrappers\CacheTenancyBootstrapper::class,
        
        // Filesystem bootstrapper
        \Stancl\Tenancy\Bootstrappers\FilesystemTenancyBootstrapper::class,
    ],
];