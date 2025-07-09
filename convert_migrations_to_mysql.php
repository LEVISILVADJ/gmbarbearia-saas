<?php
/**
 * Script para converter migrations do Supabase (PostgreSQL) para MySQL
 * 
 * Este script lê os arquivos SQL de migration do Supabase e os converte para sintaxe MySQL
 * compatível com Laravel.
 * 
 * Uso: php convert_migrations_to_mysql.php
 */

// Diretório de origem (migrations do Supabase)
$sourceDir = __DIR__ . '/supabase/migrations';

// Diretório de destino (migrations do Laravel)
$destDir = __DIR__ . '/backend/database/migrations';

// Garantir que o diretório de destino existe
if (!is_dir($destDir)) {
    mkdir($destDir, 0755, true);
}

// Obter todos os arquivos SQL do diretório de origem
$files = glob($sourceDir . '/*.sql');

// Ordenar arquivos por nome
sort($files);

// Processar cada arquivo
foreach ($files as $file) {
    $filename = basename($file);
    $timestamp = date('Y_m_d_His', filemtime($file));
    
    // Extrair nome descritivo do arquivo
    preg_match('/\d+_(.+)\.sql$/', $filename, $matches);
    $descriptiveName = $matches[1] ?? 'migration';
    
    // Nome do arquivo de destino no formato Laravel
    $destFilename = $timestamp . '_' . $descriptiveName . '.php';
    
    // Ler conteúdo do arquivo
    $content = file_get_contents($file);
    
    // Converter sintaxe PostgreSQL para MySQL
    $mysqlContent = convertToMysql($content);
    
    // Criar conteúdo do arquivo de migração Laravel
    $laravelMigration = createLaravelMigration($descriptiveName, $mysqlContent);
    
    // Salvar arquivo de migração
    file_put_contents($destDir . '/' . $destFilename, $laravelMigration);
    
    echo "Convertido: $filename -> $destFilename\n";
}

echo "Conversão concluída! Arquivos salvos em: $destDir\n";

/**
 * Converte sintaxe PostgreSQL para MySQL
 */
function convertToMysql($content) {
    // Remover comentários
    $content = preg_replace('/\/\*.*?\*\//s', '', $content);
    $content = preg_replace('/--.*$/m', '', $content);
    
    // Substituir tipos de dados
    $content = str_replace('uuid', 'char(36)', $content);
    $content = str_replace('timestamptz', 'timestamp', $content);
    $content = str_replace('text[]', 'json', $content);
    $content = str_replace('jsonb', 'json', $content);
    
    // Substituir funções
    $content = str_replace('gen_random_uuid()', 'UUID()', $content);
    $content = str_replace('now()', 'CURRENT_TIMESTAMP', $content);
    
    // Substituir sintaxe de constraint
    $content = preg_replace('/CONSTRAINT\s+(\w+)\s+CHECK\s+\(\((.*?)\)\)/', 'CONSTRAINT $1 CHECK ($2)', $content);
    
    // Substituir sintaxe de array
    $content = preg_replace('/= ANY \(ARRAY\[(.*?)\]\)/', 'IN ($1)', $content);
    
    // Remover RLS (Row Level Security) - não suportado no MySQL
    $content = preg_replace('/ALTER TABLE .* ENABLE ROW LEVEL SECURITY;/', '', $content);
    $content = preg_replace('/CREATE POLICY.*?;/s', '', $content);
    
    // Remover funções específicas do PostgreSQL
    $content = preg_replace('/CREATE OR REPLACE FUNCTION.*?END;.*?\$\$/s', '', $content);
    
    // Remover triggers específicos do PostgreSQL
    $content = preg_replace('/CREATE TRIGGER.*?;/s', '', $content);
    
    // Limpar linhas em branco extras
    $content = preg_replace('/\n\s*\n/', "\n\n", $content);
    
    return $content;
}

/**
 * Cria o conteúdo de um arquivo de migração Laravel
 */
function createLaravelMigration($name, $sqlContent) {
    $className = 'Create' . str_replace(' ', '', ucwords(str_replace('_', ' ', $name)));
    
    return <<<PHP
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Executar SQL convertido do Supabase
        DB::unprepared("
$sqlContent
        ");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Implementar rollback se necessário
    }
};
PHP;
}