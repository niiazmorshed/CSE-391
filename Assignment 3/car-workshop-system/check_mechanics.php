<?php
// Simple mechanic ID checker
header('Content-Type: application/json');
require_once 'config.php';

try {
    $client = new MongoDB\Client($mongoUri);
    $database = $client->selectDatabase($databaseName);
    $mechanicsCollection = $database->selectCollection('mechanics');
    
    $mechanics = $mechanicsCollection->find()->toArray();
    
    $mechanicInfo = [];
    foreach ($mechanics as $mechanic) {
        $mechanicInfo[] = [
            'name' => $mechanic->name,
            'id' => (string)$mechanic->_id,
            'id_type' => gettype($mechanic->_id),
            'id_class' => get_class($mechanic->_id),
            'specialization' => $mechanic->specialization ?? 'Unknown'
        ];
    }
    
    echo json_encode([
        'success' => true,
        'mechanics' => $mechanicInfo,
        'count' => count($mechanicInfo)
    ], JSON_PRETTY_PRINT);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>