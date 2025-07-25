<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "web" middleware group. Make something great!
|
*/

Route::get('/', function () {
    return response()->json([
        'message' => 'GM Barbearia SaaS API',
        'version' => '1.0.0',
        'status' => 'online'
    ]);
});

// Redirecionar para a documentação da API
Route::get('/docs', function () {
    return redirect('/api/documentation');
});