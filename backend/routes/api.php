<?php

use App\Http\Controllers\Admin\AdminTenantController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\SubscriptionController;
use App\Http\Controllers\TenantController;
use App\Http\Controllers\WebhookController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Rotas públicas
Route::post('/register', [RegisterController::class, 'register']);
Route::post('/login', [LoginController::class, 'login']);
Route::post('/check-subdomain', [TenantController::class, 'checkSubdomain']);

// Webhooks
Route::post('/webhooks/mercadopago', [WebhookController::class, 'mercadoPago'])->name('webhooks.mercadopago');

// Callbacks de pagamento
Route::get('/subscription/callback/success', [SubscriptionController::class, 'callbackSuccess'])->name('subscription.callback.success');
Route::get('/subscription/callback/failure', [SubscriptionController::class, 'callbackFailure'])->name('subscription.callback.failure');
Route::get('/subscription/callback/pending', [SubscriptionController::class, 'callbackPending'])->name('subscription.callback.pending');

// Rotas protegidas
Route::middleware('auth:sanctum')->group(function () {
    // Logout
    Route::post('/logout', [LoginController::class, 'logout']);
    
    // Tenant
    Route::prefix('tenant/{subdomain}')->middleware('tenant.access')->group(function () {
        Route::get('/', [TenantController::class, 'show']);
        Route::put('/', [TenantController::class, 'update']);
        
        // Assinaturas
        Route::post('/subscribe', [SubscriptionController::class, 'subscribe']);
        Route::post('/cancel-subscription', [SubscriptionController::class, 'cancel']);
    });
    
    // Rotas de admin
    Route::prefix('admin')->middleware('admin')->group(function () {
        // Tenants
        Route::get('/tenants', [AdminTenantController::class, 'index']);
        Route::get('/tenants/{id}', [AdminTenantController::class, 'show']);
        Route::put('/tenants/{id}', [AdminTenantController::class, 'update']);
        Route::post('/tenants/{id}/extend-trial', [AdminTenantController::class, 'extendTrial']);
        Route::post('/tenants/{id}/toggle-active', [AdminTenantController::class, 'toggleActive']);
        Route::get('/stats', [AdminTenantController::class, 'stats']);
    });
});