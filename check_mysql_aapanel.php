<?php
/**
 * Verificador de Compatibilidade do MySQL no aPanel para GM Barbearia SaaS
 * 
 * Este script verifica se o MySQL no aPanel está configurado corretamente
 * para suportar o sistema GM Barbearia SaaS.
 * 
 * Uso: php check_mysql_aapanel.php
 */

echo "=======================================================\n";
echo "  Verificador de Compatibilidade MySQL - GM Barbearia SaaS   \n";
echo "=======================================================\n\n";

// Verificar versão do MySQL
$mysqlVersion = null;
$mysqlOk = false;

try {
    $pdo = new PDO('mysql:host=localhost', 'root', '');
    $mysqlVersion = $pdo->query('SELECT VERSION()')->fetchColumn();
    $mysqlOk = version_compare($mysqlVersion, '5.7.0', '>=');
} catch (PDOException $e) {
    $mysqlVersion = "Não foi possível conectar ao MySQL: " . $e->getMessage();
}

echo "MySQL: " . ($mysqlVersion ?? 'Não detectado') . " " . ($mysqlOk ? "[OK]" : "[FALHA - Requer MySQL 5.7 ou superior]") . "\n";

// Verificar suporte a JSON
$jsonSupport = false;
if ($mysqlOk) {
    try {
        $pdo->query("SELECT JSON_EXTRACT('{\"a\": 1}', '$.a')");
        $jsonSupport = true;
    } catch (PDOException $e) {
        $jsonSupport = false;
    }
}

echo "Suporte a JSON: " . ($jsonSupport ? "[OK]" : "[FALHA - MySQL não suporta JSON]") . "\n";

// Verificar suporte a UTF8MB4
$utf8mb4Support = false;
if ($mysqlOk) {
    try {
        $charsets = $pdo->query("SHOW CHARACTER SET LIKE 'utf8mb4'")->fetchAll();
        $utf8mb4Support = count($charsets) > 0;
    } catch (PDOException $e) {
        $utf8mb4Support = false;
    }
}

echo "Suporte a UTF8MB4: " . ($utf8mb4Support ? "[OK]" : "[FALHA - MySQL não suporta UTF8MB4]") . "\n";

// Verificar permissões para criar bancos de dados
$createDbPermission = false;
if ($mysqlOk) {
    try {
        $pdo->exec("CREATE DATABASE IF NOT EXISTS test_permission");
        $pdo->exec("DROP DATABASE test_permission");
        $createDbPermission = true;
    } catch (PDOException $e) {
        $createDbPermission = false;
    }
}

echo "Permissão para criar bancos: " . ($createDbPermission ? "[OK]" : "[FALHA - Usuário não tem permissão para criar bancos]") . "\n";

// Verificar tamanho máximo de pacote
$maxAllowedPacket = null;
if ($mysqlOk) {
    try {
        $maxAllowedPacket = $pdo->query("SHOW VARIABLES LIKE 'max_allowed_packet'")->fetch(PDO::FETCH_ASSOC)['Value'];
        $maxAllowedPacketMb = round($maxAllowedPacket / (1024 * 1024), 2);
    } catch (PDOException $e) {
        $maxAllowedPacket = "Não foi possível verificar";
    }
}

echo "Tamanho máximo de pacote: " . ($maxAllowedPacket ? $maxAllowedPacketMb . " MB" : "Não detectado") . " " . 
     ($maxAllowedPacket >= 16 * 1024 * 1024 ? "[OK]" : "[AVISO - Recomendado pelo menos 16MB]") . "\n";

// Resumo
echo "\n=======================================================\n";
echo "                      RESUMO                           \n";
echo "=======================================================\n\n";

$allOk = $mysqlOk && $jsonSupport && $utf8mb4Support && $createDbPermission;

if ($allOk) {
    echo "✅ COMPATÍVEL: Seu MySQL atende a todos os requisitos!\n";
} else {
    echo "❌ INCOMPATÍVEL: Seu MySQL não atende a todos os requisitos.\n";
    echo "   Por favor, resolva os problemas indicados acima antes de prosseguir.\n";
}

echo "\nPara qualquer dúvida ou suporte, entre em contato com a Green Sistemas:\n";
echo "- WhatsApp: (11) 95161-2874\n";
echo "- Email: contato@greensistemas.com\n";