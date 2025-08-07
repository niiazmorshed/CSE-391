<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Cache-Control, Pragma');
header('Access-Control-Max-Age: 86400');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

try {
    require_once 'config.php';
} catch (Exception $configError) {
    echo json_encode([
        'success' => false,
        'message' => 'Configuration error: ' . $configError->getMessage()
    ]);
    exit;
}

function logMechanics($message, $data = null) {
    $timestamp = date('Y-m-d H:i:s');
    $log = "[$timestamp] GET_MECHANICS_CORS_FIXED: $message";
    if ($data) {
        $log .= " | Data: " . json_encode($data, JSON_PARTIAL_OUTPUT_ON_ERROR);
    }
    error_log($log);
}

try {
    logMechanics("Starting to fetch mechanics with CORS headers");
    
    // Connect to MongoDB
    $client = new MongoDB\Client($mongoUri, [
        'connectTimeoutMS' => 10000,
        'serverSelectionTimeoutMS' => 10000
    ]);
    
    $database = $client->selectDatabase($databaseName);
    $mechanicsCollection = $database->selectCollection('mechanics');
    
    logMechanics("Connected to database", ['database' => $databaseName]);
    
    // Test connection
    $database->command(['ping' => 1]);
    logMechanics("MongoDB ping successful");
    
    // Fetch all mechanics
    $cursor = $mechanicsCollection->find([], [
        'sort' => ['name' => 1],
        'limit' => 50
    ]);
    
    $mechanics = [];
    foreach ($cursor as $mechanic) {
        $mechanicArray = [
            '_id' => isset($mechanic->_id) ? (string)$mechanic->_id : '',
            'name' => isset($mechanic->name) ? (string)$mechanic->name : 'Unknown Mechanic',
            'email' => isset($mechanic->email) ? (string)$mechanic->email : '',
            'phone' => isset($mechanic->phone) ? (string)$mechanic->phone : '',
            'specialty' => isset($mechanic->specialty) ? (string)$mechanic->specialty : '',
            'available' => isset($mechanic->available) ? (bool)$mechanic->available : true
        ];
        
        // Handle created date safely
        if (isset($mechanic->createdAt) && is_object($mechanic->createdAt) && method_exists($mechanic->createdAt, 'toDateTime')) {
            $mechanicArray['createdAt'] = $mechanic->createdAt->toDateTime()->format('Y-m-d\TH:i:s\Z');
        } else {
            $mechanicArray['createdAt'] = '';
        }
        
        $mechanics[] = $mechanicArray;
    }
    
    logMechanics("Mechanics fetched successfully", ['count' => count($mechanics)]);
    
    // If no mechanics found, create default ones
    if (count($mechanics) === 0) {
        logMechanics("No mechanics found, creating default mechanics");
        
        $defaultMechanics = [
            [
                'name' => 'Mike Johnson',
                'email' => 'mike@autofix.com',
                'phone' => '555-0101',
                'specialty' => 'Engine Repair',
                'available' => true,
                'createdAt' => new MongoDB\BSON\UTCDateTime()
            ],
            [
                'name' => 'David Wilson',
                'email' => 'david@autofix.com',
                'phone' => '555-0102',
                'specialty' => 'Transmission',
                'available' => true,
                'createdAt' => new MongoDB\BSON\UTCDateTime()
            ],
            [
                'name' => 'Robert Brown',
                'email' => 'robert@autofix.com',
                'phone' => '555-0103',
                'specialty' => 'Brakes & Suspension',
                'available' => true,
                'createdAt' => new MongoDB\BSON\UTCDateTime()
            ],
            [
                'name' => 'James Davis',
                'email' => 'james@autofix.com',
                'phone' => '555-0104',
                'specialty' => 'Electrical Systems',
                'available' => true,
                'createdAt' => new MongoDB\BSON\UTCDateTime()
            ]
        ];
        
        $insertResult = $mechanicsCollection->insertMany($defaultMechanics);
        logMechanics("Default mechanics created", ['insertedCount' => $insertResult->getInsertedCount()]);
        
        // Re-fetch mechanics
        $cursor = $mechanicsCollection->find([], ['sort' => ['name' => 1]]);
        $mechanics = [];
        foreach ($cursor as $mechanic) {
            $mechanics[] = [
                '_id' => (string)$mechanic->_id,
                'name' => (string)$mechanic->name,
                'email' => isset($mechanic->email) ? (string)$mechanic->email : '',
                'phone' => isset($mechanic->phone) ? (string)$mechanic->phone : '',
                'specialty' => isset($mechanic->specialty) ? (string)$mechanic->specialty : '',
                'available' => isset($mechanic->available) ? (bool)$mechanic->available : true,
                'createdAt' => isset($mechanic->createdAt) && is_object($mechanic->createdAt) ? 
                    $mechanic->createdAt->toDateTime()->format('Y-m-d\TH:i:s\Z') : ''
            ];
        }
    }
    
    // Return response with CORS headers
    ob_clean();
    echo json_encode([
        'success' => true,
        'message' => 'Mechanics loaded successfully',
        'mechanics' => $mechanics,
        'count' => count($mechanics),
        'database' => $databaseName,
        'cors' => 'enabled',
        'server' => $_SERVER['HTTP_HOST'] ?? 'unknown'
    ], JSON_PARTIAL_OUTPUT_ON_ERROR);
    
} catch (MongoDB\Driver\Exception\Exception $e) {
    logMechanics("MongoDB error", [
        'error' => $e->getMessage(),
        'code' => $e->getCode()
    ]);
    
    ob_clean();
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage(),
        'error_type' => 'MongoDB Exception',
        'cors' => 'enabled'
    ]);
    
} catch (Exception $e) {
    logMechanics("General error", [
        'error' => $e->getMessage(),
        'file' => basename($e->getFile()),
        'line' => $e->getLine()
    ]);
    
    ob_clean();
    echo json_encode([
        'success' => false,
        'message' => 'Error loading mechanics: ' . $e->getMessage(),
        'error_type' => 'General Exception',
        'cors' => 'enabled'
    ]);
}
?>