<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once 'config.php';

// Debug logging
function logMessage($message, $data = null) {
    $timestamp = date('Y-m-d H:i:s');
    $log = "[$timestamp] BOOKING: $message";
    if ($data) {
        $log .= " | Data: " . json_encode($data);
    }
    error_log($log);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'POST method required']);
    exit;
}

$rawInput = file_get_contents('php://input');
$input = json_decode($rawInput, true);

if (!$input) {
    echo json_encode([
        'success' => false,
        'message' => 'Invalid JSON: ' . json_last_error_msg()
    ]);
    exit;
}

// Validate required fields
$required = ['clientName', 'clientPhone', 'clientAddress', 'carLicense', 'carEngine', 'appointmentDate', 'mechanicId'];
foreach ($required as $field) {
    if (empty($input[$field])) {
        echo json_encode([
            'success' => false,
            'message' => "Missing field: $field"
        ]);
        exit;
    }
}

try {
    logMessage("Connecting to MongoDB", ['uri' => $mongoUri, 'database' => $databaseName]);
    
    // MongoDB connection
    $client = new MongoDB\Client($mongoUri);
    $database = $client->selectDatabase($databaseName);
    
    // Test connection
    $database->command(['ping' => 1]);
    logMessage("MongoDB connection successful");
    
    $appointmentsCollection = $database->selectCollection('appointments');
    $mechanicsCollection = $database->selectCollection('mechanics');
    
    // Validate mechanic exists
    $mechanicId = trim($input['mechanicId']);
    logMessage("Looking for mechanic", ['mechanicId' => $mechanicId]);
    
    // Try to find mechanic by ObjectId
    if (preg_match('/^[a-f\d]{24}$/i', $mechanicId)) {
        try {
            $mechanic = $mechanicsCollection->findOne(['_id' => new MongoDB\BSON\ObjectId($mechanicId)]);
        } catch (Exception $e) {
            logMessage("ObjectId lookup failed", $e->getMessage());
            $mechanic = null;
        }
    }
    
    // Try to find by name if ObjectId failed
    if (!$mechanic) {
        $mechanic = $mechanicsCollection->findOne(['name' => $mechanicId]);
        if ($mechanic) {
            $mechanicId = (string)$mechanic->_id;
        }
    }
    
    if (!$mechanic) {
        logMessage("Mechanic not found", ['id' => $mechanicId]);
        echo json_encode([
            'success' => false,
            'message' => 'Mechanic not found: ' . $mechanicId
        ]);
        exit;
    }
    
    logMessage("Mechanic found", ['name' => $mechanic->name, 'id' => (string)$mechanic->_id]);
    
    // Create appointment document
    $appointmentDoc = [
        'clientName' => trim($input['clientName']),
        'clientPhone' => trim($input['clientPhone']),
        'clientAddress' => trim($input['clientAddress']),
        'carLicense' => strtoupper(trim($input['carLicense'])),
        'carEngine' => strtoupper(trim($input['carEngine'])),
        'appointmentDate' => $input['appointmentDate'] . 'T00:00:00.000Z',
        'mechanicId' => (string)$mechanic->_id, // Store as string
        'mechanicName' => $mechanic->name,
        'status' => 'confirmed',
        'estimatedDuration' => 120,
        'createdAt' => new MongoDB\BSON\UTCDateTime(),
        'updatedAt' => new MongoDB\BSON\UTCDateTime()
    ];
    
    logMessage("Creating appointment document", $appointmentDoc);
    
    // Insert appointment
    $result = $appointmentsCollection->insertOne($appointmentDoc);
    
    if ($result->getInsertedCount() === 1) {
        $insertedId = (string)$result->getInsertedId();
        logMessage("Appointment created successfully", ['id' => $insertedId]);
        
        // Get the created appointment for response
        $createdAppointment = $appointmentsCollection->findOne(['_id' => $result->getInsertedId()]);
        $createdAppointment->_id = $insertedId;
        
        // Verify it was actually saved by counting documents
        $totalAppointments = $appointmentsCollection->countDocuments();
        logMessage("Total appointments in collection", ['count' => $totalAppointments]);
        
        echo json_encode([
            'success' => true,
            'message' => 'Appointment booked successfully',
            'appointment' => $createdAppointment,
            'debug' => [
                'inserted_id' => $insertedId,
                'total_appointments' => $totalAppointments
            ]
        ]);
    } else {
        logMessage("Insert failed - no documents inserted");
        echo json_encode([
            'success' => false,
            'message' => 'Failed to create appointment - no documents inserted'
        ]);
    }
    
} catch (Exception $e) {
    logMessage("Exception occurred", [
        'message' => $e->getMessage(),
        'file' => $e->getFile(),
        'line' => $e->getLine()
    ]);
    
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
?>