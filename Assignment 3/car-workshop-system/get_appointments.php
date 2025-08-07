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

// Enable error reporting for debugging
ini_set('display_errors', 0);
error_reporting(E_ALL);

try {
    require_once 'config.php';
} catch (Exception $configError) {
    echo json_encode([
        'success' => false,
        'message' => 'Configuration error: ' . $configError->getMessage()
    ]);
    exit;
}

function logAppointments($message, $data = null) {
    $timestamp = date('Y-m-d H:i:s');
    $log = "[$timestamp] GET_APPOINTMENTS_CORS_FIXED: $message";
    if ($data) {
        $log .= " | Data: " . json_encode($data, JSON_PARTIAL_OUTPUT_ON_ERROR);
    }
    error_log($log);
}

try {
    logAppointments("Starting appointment fetch with CORS headers");
    
    // Validate MongoDB configuration
    if (empty($mongoUri) || empty($databaseName)) {
        throw new Exception('MongoDB configuration is missing');
    }
    
    logAppointments("Config validated", ['database' => $databaseName]);
    
    // Connect to MongoDB with timeout
    $client = new MongoDB\Client($mongoUri, [
        'connectTimeoutMS' => 10000,
        'serverSelectionTimeoutMS' => 10000
    ]);
    
    $database = $client->selectDatabase($databaseName);
    $collection = $database->selectCollection('appointments');
    
    logAppointments("MongoDB connection established");
    
    // Test connection
    $database->command(['ping' => 1]);
    logAppointments("MongoDB ping successful");
    
    // Build simple filter
    $filter = [];
    
    // Simple status filter only
    if (isset($_GET['status']) && !empty(trim($_GET['status']))) {
        $status = trim($_GET['status']);
        $validStatuses = ['confirmed', 'in-progress', 'completed', 'cancelled'];
        if (in_array($status, $validStatuses)) {
            $filter['status'] = $status;
            logAppointments("Status filter applied", ['status' => $status]);
        }
    }
    
    // Simple mechanic filter
    if (isset($_GET['mechanicId']) && !empty(trim($_GET['mechanicId']))) {
        $mechanicId = trim($_GET['mechanicId']);
        if (preg_match('/^[a-f\d]{24}$/i', $mechanicId)) {
            $filter['mechanicId'] = $mechanicId;
            logAppointments("Mechanic filter applied", ['mechanicId' => $mechanicId]);
        }
    }
    
    logAppointments("Filter prepared", $filter);
    
    // Fetch appointments
    $options = [
        'limit' => 100,
        'sort' => ['_id' => -1]
    ];
    
    logAppointments("Executing find query", ['filter' => $filter, 'options' => $options]);
    
    $cursor = $collection->find($filter, $options);
    $appointments = [];
    
    logAppointments("Cursor created, processing documents");
    
    $docCount = 0;
    foreach ($cursor as $doc) {
        $docCount++;
        logAppointments("Processing document #$docCount");
        
        try {
            // Very safe document processing
            $appointment = [];
            
            // Essential fields with fallbacks
            $appointment['_id'] = isset($doc->_id) ? (string)$doc->_id : "doc_$docCount";
            $appointment['clientName'] = isset($doc->clientName) ? (string)$doc->clientName : 'Unknown Client';
            $appointment['clientPhone'] = isset($doc->clientPhone) ? (string)$doc->clientPhone : 'No Phone';
            $appointment['carLicense'] = isset($doc->carLicense) ? (string)$doc->carLicense : 'No License';
            $appointment['mechanicName'] = isset($doc->mechanicName) ? (string)$doc->mechanicName : 'Unassigned';
            $appointment['status'] = isset($doc->status) ? (string)$doc->status : 'confirmed';
            
            // Optional fields
            $appointment['clientAddress'] = isset($doc->clientAddress) ? (string)$doc->clientAddress : '';
            $appointment['carEngine'] = isset($doc->carEngine) ? (string)$doc->carEngine : '';
            $appointment['mechanicId'] = isset($doc->mechanicId) ? (string)$doc->mechanicId : '';
            
            // Date handling - very safe
            $appointment['appointmentDate'] = '';
            $appointment['createdAt'] = '';
            $appointment['updatedAt'] = '';
            
            try {
                if (isset($doc->appointmentDate)) {
                    if (is_object($doc->appointmentDate) && method_exists($doc->appointmentDate, 'toDateTime')) {
                        $appointment['appointmentDate'] = $doc->appointmentDate->toDateTime()->format('Y-m-d\TH:i:s\Z');
                    } elseif (is_string($doc->appointmentDate)) {
                        $appointment['appointmentDate'] = $doc->appointmentDate;
                    }
                }
                
                if (isset($doc->createdAt)) {
                    if (is_object($doc->createdAt) && method_exists($doc->createdAt, 'toDateTime')) {
                        $appointment['createdAt'] = $doc->createdAt->toDateTime()->format('Y-m-d\TH:i:s\Z');
                    }
                }
                
                if (isset($doc->updatedAt)) {
                    if (is_object($doc->updatedAt) && method_exists($doc->updatedAt, 'toDateTime')) {
                        $appointment['updatedAt'] = $doc->updatedAt->toDateTime()->format('Y-m-d\TH:i:s\Z');
                    }
                }
            } catch (Exception $dateError) {
                logAppointments("Date processing error for doc #$docCount", ['error' => $dateError->getMessage()]);
            }
            
            $appointments[] = $appointment;
            logAppointments("Document #$docCount processed successfully", ['clientName' => $appointment['clientName']]);
            
        } catch (Exception $docError) {
            logAppointments("Error processing document #$docCount", ['error' => $docError->getMessage()]);
            
            // Create minimal appointment record for corrupted document
            $appointments[] = [
                '_id' => "error_doc_$docCount",
                'clientName' => 'Error Loading Client',
                'clientPhone' => 'Error',
                'carLicense' => 'Error',
                'mechanicName' => 'Error',
                'status' => 'confirmed',
                'appointmentDate' => '',
                'createdAt' => '',
                'updatedAt' => '',
                'clientAddress' => '',
                'carEngine' => '',
                'mechanicId' => ''
            ];
        }
    }
    
    logAppointments("All documents processed", ['totalProcessed' => $docCount, 'successfulAppointments' => count($appointments)]);
    
    // Success response with CORS headers
    $response = [
        'success' => true,
        'message' => 'Appointments loaded successfully',
        'appointments' => $appointments,
        'count' => count($appointments),
        'database' => $databaseName,
        'processed' => $docCount,
        'cors' => 'enabled',
        'server' => $_SERVER['HTTP_HOST'] ?? 'unknown'
    ];
    
    logAppointments("Sending successful response with CORS", ['appointmentCount' => count($appointments)]);
    
    // Ensure clean output
    ob_clean();
    echo json_encode($response, JSON_PARTIAL_OUTPUT_ON_ERROR);
    
} catch (MongoDB\Driver\Exception\ConnectionTimeoutException $e) {
    logAppointments("MongoDB connection timeout", ['error' => $e->getMessage()]);
    ob_clean();
    echo json_encode([
        'success' => false,
        'message' => 'Database connection timeout. Please try again.',
        'error_type' => 'Connection Timeout',
        'cors' => 'enabled'
    ]);
    
} catch (MongoDB\Driver\Exception\Exception $e) {
    logAppointments("MongoDB driver error", [
        'error' => $e->getMessage(),
        'code' => $e->getCode(),
        'file' => basename($e->getFile()),
        'line' => $e->getLine()
    ]);
    
    ob_clean();
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage(),
        'error_type' => 'MongoDB Driver Exception',
        'cors' => 'enabled',
        'debug' => [
            'file' => basename($e->getFile()),
            'line' => $e->getLine(),
            'code' => $e->getCode()
        ]
    ]);
    
} catch (Exception $e) {
    logAppointments("General error", [
        'error' => $e->getMessage(),
        'file' => basename($e->getFile()),
        'line' => $e->getLine()
    ]);
    
    ob_clean();
    echo json_encode([
        'success' => false,
        'message' => 'Server error: ' . $e->getMessage(),
        'error_type' => 'General Exception',
        'cors' => 'enabled',
        'debug' => [
            'file' => basename($e->getFile()),
            'line' => $e->getLine()
        ]
    ]);
    
} catch (Error $e) {
    logAppointments("Fatal error", [
        'error' => $e->getMessage(),
        'file' => basename($e->getFile()),
        'line' => $e->getLine()
    ]);
    
    ob_clean();
    echo json_encode([
        'success' => false,
        'message' => 'Fatal server error: ' . $e->getMessage(),
        'error_type' => 'Fatal Error',
        'cors' => 'enabled',
        'debug' => [
            'file' => basename($e->getFile()),
            'line' => $e->getLine()
        ]
    ]);
}
?>