<?php
/**
 * Verificador de Compatibilidade do GM Barbearia SaaS com aPanel
 * 
 * Este script verifica se o ambiente do aPanel atende aos requisitos
 * para executar o sistema GM Barbearia SaaS.
 * 
 * Uso: php check_aapanel_compatibility.php
 */

echo "=======================================================\n";
echo "  Verificador de Compatibilidade - GM Barbearia SaaS   \n";
echo "=======================================================\n\n";

// Verificar versão do PHP
$phpVersion = phpversion();
$phpRequired = '8.1.0';
$phpOk = version_compare($phpVersion, $phpRequired, '>=');

echo "Versão do PHP: $phpVersion " . ($phpOk ? "[OK]" : "[FALHA - Requer $phpRequired ou superior]") . "\n";

// Verificar extensões do PHP
$requiredExtensions = [
    'pdo_mysql',
    'mbstring',
    'openssl',
    'tokenizer',
    'xml',
    'ctype',
    'json',
    'bcmath',
    'fileinfo'
];

$missingExtensions = [];
foreach ($requiredExtensions as $ext) {
    if (!extension_loaded($ext)) {
        $missingExtensions[] = $ext;
    }
}

echo "Extensões do PHP: " . (empty($missingExtensions) ? "[OK]" : "[FALHA - Faltando: " . implode(', ', $missingExtensions) . "]") . "\n";

// Verificar MySQL
$mysqlOk = extension_loaded('pdo_mysql');
$mysqlVersion = null;

if ($mysqlOk) {
    try {
        $pdo = new PDO('mysql:host=localhost', 'root', '');
        $mysqlVersion = $pdo->query('SELECT VERSION()')->fetchColumn();
        $mysqlOk = version_compare($mysqlVersion, '5.7.0', '>=');
    } catch (PDOException $e) {
        $mysqlOk = false;
        $mysqlVersion = "Não foi possível conectar ao MySQL";
    }
}

echo "MySQL: " . ($mysqlVersion ?? 'Não detectado') . " " . ($mysqlOk ? "[OK]" : "[FALHA - Requer MySQL 5.7 ou superior]") . "\n";

// Verificar Composer
$composerVersion = null;
$composerOk = false;

exec('composer --version 2>&1', $composerOutput, $composerReturnVar);
if ($composerReturnVar === 0) {
    $composerVersion = trim(implode("\n", $composerOutput));
    $composerOk = true;
}

echo "Composer: " . ($composerVersion ?? 'Não detectado') . " " . ($composerOk ? "[OK]" : "[FALHA - Composer não encontrado]") . "\n";

// Verificar Node.js
$nodeVersion = null;
$nodeOk = false;

exec('node --version 2>&1', $nodeOutput, $nodeReturnVar);
if ($nodeReturnVar === 0) {
    $nodeVersion = trim(implode("\n", $nodeOutput));
    $nodeOk = version_compare(str_replace('v', '', $nodeVersion), '16.0.0', '>=');
}

echo "Node.js: " . ($nodeVersion ?? 'Não detectado') . " " . ($nodeOk ? "[OK]" : "[FALHA - Requer Node.js 16 ou superior]") . "\n";

// Verificar npm
$npmVersion = null;
$npmOk = false;

exec('npm --version 2>&1', $npmOutput, $npmReturnVar);
if ($npmReturnVar === 0) {
    $npmVersion = trim(implode("\n", $npmOutput));
    $npmOk = version_compare($npmVersion, '8.0.0', '>=');
}

echo "npm: " . ($npmVersion ?? 'Não detectado') . " " . ($npmOk ? "[OK]" : "[FALHA - Requer npm 8 ou superior]") . "\n";

// Verificar permissões de diretório
$webRoot = '/www/wwwroot';
$webRootOk = is_dir($webRoot) && is_writable($webRoot);

echo "Diretório web root ($webRoot): " . ($webRootOk ? "[OK]" : "[FALHA - Diretório não existe ou não tem permissão de escrita]") . "\n";

// Verificar se o aPanel está instalado
$aaPanelOk = is_dir('/www/server/panel');

echo "aPanel: " . ($aaPanelOk ? "[OK]" : "[FALHA - aPanel não detectado]") . "\n";

// Resumo
echo "\n=======================================================\n";
echo "                      RESUMO                           \n";
echo "=======================================================\n\n";

$allOk = $phpOk && empty($missingExtensions) && $mysqlOk && $composerOk && $nodeOk && $npmOk && $webRootOk && $aaPanelOk;

if ($allOk) {
    echo "✅ COMPATÍVEL: Seu ambiente atende a todos os requisitos!\n";
} else {
    echo "❌ INCOMPATÍVEL: Seu ambiente não atende a todos os requisitos.\n";
    echo "   Por favor, resolva os problemas indicados acima antes de prosseguir.\n";
}

echo "\nPara qualquer dúvida ou suporte, entre em contato com a Green Sistemas:\n";
echo "- WhatsApp: (11) 95161-2874\n";
echo "- Email: contato@greensistemas.com\n";