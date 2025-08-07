<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode([
        'success' => false,
        'message' => 'Only POST method allowed'
    ]);
    exit;
}

// Get POST data
$input = json_decode(file_get_contents('php://input'), true);

// Validate required fields
if (!isset($input['appointmentId']) || empty(trim($input['appointmentId']))) {
    echo json_encode([
        'success' => false,
        'message' => 'Missing required field: appointmentId'
    ]);
    exit;
}

try {
    // Connect to MongoDB
    $client = new MongoDB\Client($mongoUri);
    $database = $client->selectDatabase($databaseName);
    $appointmentsCollection = $database->selectCollection('appointments');
    
    // Validate appointment ID
    try {
        $appointmentId = new MongoDB\BSON\ObjectId($input['appointmentId']);
    } catch (Exception $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Invalid appointment ID'
        ]);
        exit;
    }
    
    // Check if appointment exists
    $existingAppointment = $appointmentsCollection->findOne(['_id' => $appointmentId]);
    if (!$existingAppointment) {
        echo json_encode([
            'success' => false,
            'message' => 'Appointment not found'
        ]);
        exit;
    }
    
    // Delete appointment
    $result = $appointmentsCollection->deleteOne(['_id' => $appointmentId]);
    
    if ($result->getDeletedCount() === 1) {
        echo json_encode([
            'success' => true,
            'message' => 'Appointment deleted successfully'
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Failed to delete appointment'
        ]);
    }
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
?>