<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: PUT, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Cache-Control, Pragma');
header('Access-Control-Max-Age: 86400');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
    ob_clean();
    echo json_encode([
        'success' => false,
        'message' => 'Only PUT method allowed',
        'cors' => 'enabled'
    ]);
    exit;
}

require_once 'config.php';

function logUpdate($message, $data = null) {
    $timestamp = date('Y-m-d H:i:s');
    $log = "[$timestamp] UPDATE_CORS_FIXED: $message";
    if ($data) {
        $log .= " | Data: " . json_encode($data, JSON_PARTIAL_OUTPUT_ON_ERROR);
    }
    error_log($log);
}

// Get PUT data
$rawInput = file_get_contents('php://input');
$input = json_decode($rawInput, true);

logUpdate("Raw input received with CORS", ['input' => $rawInput]);

if (!$input) {
    logUpdate("JSON decode failed", ['error' => json_last_error_msg()]);
    ob_clean();
    echo json_encode([
        'success' => false,
        'message' => 'Invalid JSON: ' . json_last_error_msg(),
        'cors' => 'enabled'
    ]);
    exit;
}

// Validate required fields
if (empty($input['appointmentId']) || empty($input['status'])) {
    logUpdate("Missing fields", $input);
    ob_clean();
    echo json_encode([
        'success' => false,
        'message' => 'appointmentId and status are required',
        'cors' => 'enabled'
    ]);
    exit;
}

$appointmentId = trim($input['appointmentId']);
$newStatus = trim($input['status']);

// Validate status
$validStatuses = ['confirmed', 'in-progress', 'completed', 'cancelled'];
if (!in_array($newStatus, $validStatuses)) {
    logUpdate("Invalid status", ['status' => $newStatus]);
    ob_clean();
    echo json_encode([
        'success' => false,
        'message' => 'Status must be one of: ' . implode(', ', $validStatuses),
        'cors' => 'enabled'
    ]);
    exit;
}

try {
    logUpdate("Connecting to MongoDB for update");
    
    // Connect to MongoDB
    $client = new MongoDB\Client($mongoUri, [
        'connectTimeoutMS' => 10000,
        'serverSelectionTimeoutMS' => 10000
    ]);
    $database = $client->selectDatabase($databaseName);
    $collection = $database->selectCollection('appointments');
    
    // Test connection
    $database->command(['ping' => 1]);
    logUpdate("Connection successful");
    
    // Validate and create ObjectId
    if (!preg_match('/^[a-f\d]{24}$/i', $appointmentId)) {
        throw new Exception("Invalid ObjectId format: $appointmentId");
    }
    
    $objectId = new MongoDB\BSON\ObjectId($appointmentId);
    logUpdate("ObjectId created", ['id' => $appointmentId]);
    
    // First, find the appointment to verify it exists
    $existingAppointment = $collection->findOne(['_id' => $objectId]);
    
    if (!$existingAppointment) {
        logUpdate("Appointment not found", ['id' => $appointmentId]);
        ob_clean();
        echo json_encode([
            'success' => false,
            'message' => "Appointment not found with ID: $appointmentId",
            'cors' => 'enabled'
        ]);
        exit;
    }
    
    $currentStatus = isset($existingAppointment->status) ? $existingAppointment->status : 'unknown';
    logUpdate("Found appointment", [
        'clientName' => $existingAppointment->clientName ?? 'Unknown',
        'currentStatus' => $currentStatus
    ]);
    
    // Check if status is actually different
    if ($currentStatus === $newStatus) {
        logUpdate("Status already set", ['currentStatus' => $currentStatus, 'newStatus' => $newStatus]);
        ob_clean();
        echo json_encode([
            'success' => false,
            'message' => "Appointment status is already: $newStatus",
            'cors' => 'enabled'
        ]);
        exit;
    }
    
    // Perform the update with proper write concern
    $updateResult = $collection->updateOne(
        ['_id' => $objectId],
        [
            '$set' => [
                'status' => $newStatus,
                'updatedAt' => new MongoDB\BSON\UTCDateTime()
            ]
        ],
        [
            'writeConcern' => new MongoDB\Driver\WriteConcern(MongoDB\Driver\WriteConcern::MAJORITY, 5000)
        ]
    );
    
    logUpdate("Update executed", [
        'matchedCount' => $updateResult->getMatchedCount(),
        'modifiedCount' => $updateResult->getModifiedCount()
    ]);
    
    // Check if the update was successful
    if ($updateResult->getMatchedCount() > 0 && $updateResult->getModifiedCount() > 0) {
        
        // Verify the update by fetching the document again
        $updatedAppointment = $collection->findOne(['_id' => $objectId]);
        
        if ($updatedAppointment && isset($updatedAppointment->status) && $updatedAppointment->status === $newStatus) {
            logUpdate("Update verified successful", [
                'appointmentId' => $appointmentId,
                'oldStatus' => $currentStatus,
                'newStatus' => $updatedAppointment->status,
                'clientName' => $updatedAppointment->clientName ?? 'Unknown'
            ]);
            
            ob_clean();
            echo json_encode([
                'success' => true,
                'message' => "Appointment status updated from '$currentStatus' to '$newStatus' successfully",
                'appointment' => [
                    '_id' => $appointmentId,
                    'clientName' => $updatedAppointment->clientName ?? 'Unknown',
                    'status' => $updatedAppointment->status,
                    'previousStatus' => $currentStatus,
                    'updatedAt' => isset($updatedAppointment->updatedAt) ? 
                        $updatedAppointment->updatedAt->toDateTime()->format('c') : ''
                ],
                'debug' => [
                    'matchedCount' => $updateResult->getMatchedCount(),
                    'modifiedCount' => $updateResult->getModifiedCount()
                ],
                'cors' => 'enabled'
            ], JSON_PARTIAL_OUTPUT_ON_ERROR);
        } else {
            logUpdate("Update verification failed", [
                'expectedStatus' => $newStatus,
                'actualStatus' => isset($updatedAppointment->status) ? $updatedAppointment->status : 'not found'
            ]);
            
            ob_clean();
            echo json_encode([
                'success' => false,
                'message' => 'Update operation completed but verification failed',
                'cors' => 'enabled'
            ]);
        }
        
    } else if ($updateResult->getMatchedCount() === 0) {
        logUpdate("No document matched", ['appointmentId' => $appointmentId]);
        ob_clean();
        echo json_encode([
            'success' => false,
            'message' => "No appointment found with ID: $appointmentId",
            'cors' => 'enabled'
        ]);
        
    } else {
        logUpdate("No changes made", [
            'matchedCount' => $updateResult->getMatchedCount(),
            'modifiedCount' => $updateResult->getModifiedCount(),
            'currentStatus' => $currentStatus,
            'requestedStatus' => $newStatus
        ]);
        
        ob_clean();
        echo json_encode([
            'success' => false,
            'message' => "No changes made. Current status: $currentStatus",
            'cors' => 'enabled'
        ]);
    }
    
} catch (MongoDB\Driver\Exception\Exception $e) {
    logUpdate("MongoDB Driver Exception", [
        'message' => $e->getMessage(),
        'code' => $e->getCode(),
        'file' => basename($e->getFile()),
        'line' => $e->getLine()
    ]);
    
    ob_clean();
    echo json_encode([
        'success' => false,
        'message' => 'MongoDB error: ' . $e->getMessage(),
        'cors' => 'enabled'
    ]);
    
} catch (Exception $e) {
    logUpdate("General Exception", [
        'message' => $e->getMessage(),
        'code' => $e->getCode(),
        'file' => basename($e->getFile()),
        'line' => $e->getLine()
    ]);
    
    ob_clean();
    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage(),
        'cors' => 'enabled'
    ]);
}
?>