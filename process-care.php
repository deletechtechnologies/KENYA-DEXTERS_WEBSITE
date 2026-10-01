<?php
// Start output buffering to catch unwanted warnings or accidental whitespace
ob_start();

// Enforce JSON headers
header('Content-Type: application/json; charset=UTF-8');
header('Cache-Control: no-cache, must-revalidate');

// Helper function to return JSON and stop script execution safely
function sendJsonResponse(int $httpCode, string $status, string $message): void {
    if (ob_get_length()) {
        ob_clean(); // Discard any buffered output before sending JSON
    }
    http_response_code($httpCode);
    echo json_encode([
        'status'  => $status,
        'message' => $message
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// 1. Validate HTTP Request Method
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJsonResponse(405, 'error', 'Invalid request method. Only POST allowed.');
}

// 2. Include Database Connection
if (file_exists('db.php')) {
    require_once 'db.php';
} else {
    sendJsonResponse(500, 'error', 'Server configuration error: Database configuration missing.');
}

// Ensure PDO object exists
if (!isset($pdo) || !($pdo instanceof PDO)) {
    sendJsonResponse(500, 'error', 'Database connection failed to initialize.');
}

// 3. Extract & Sanitize Inputs
$fullName        = htmlspecialchars(trim($_POST['fullName'] ?? ''), ENT_QUOTES, 'UTF-8');
$phone           = trim($_POST['phone'] ?? '');
$location        = htmlspecialchars(trim($_POST['location'] ?? ''), ENT_QUOTES, 'UTF-8');
$whoNeedsCare    = htmlspecialchars(trim($_POST['whoNeedsCare'] ?? ''), ENT_QUOTES, 'UTF-8');
$mainNeed        = htmlspecialchars(trim($_POST['mainNeed'] ?? ''), ENT_QUOTES, 'UTF-8');

$serviceRequired = !empty($_POST['serviceRequired']) ? htmlspecialchars(trim($_POST['serviceRequired']), ENT_QUOTES, 'UTF-8') : null;
$startDate       = !empty($_POST['startDate']) ? trim($_POST['startDate']) : null;
$careArrangement = !empty($_POST['careArrangement']) ? htmlspecialchars(trim($_POST['careArrangement']), ENT_QUOTES, 'UTF-8') : null;
$additionalInfo  = !empty($_POST['additionalInfo']) ? htmlspecialchars(trim($_POST['additionalInfo']), ENT_QUOTES, 'UTF-8') : null;

// 4. Validate Mandatory Fields
if (empty($fullName) || empty($phone) || empty($location) || empty($whoNeedsCare) || empty($mainNeed)) {
    sendJsonResponse(400, 'error', 'Please fill in all mandatory fields (*).');
}

// Validate Start Date Format (YYYY-MM-DD) if provided
if ($startDate !== null) {
    $d = DateTime::createFromFormat('Y-m-d', $startDate);
    if (!($d && $d->format('Y-m-d') === $startDate)) {
        sendJsonResponse(400, 'error', 'Invalid start date format. Please use YYYY-MM-DD.');
    }
}

// 5. Database Insertion Procedure
$sql = "INSERT INTO care_requests 
        (full_name, phone, location, who_needs_care, main_need, service_required, start_date, care_arrangement, additional_info) 
        VALUES 
        (:fullName, :phone, :location, :whoNeedsCare, :mainNeed, :serviceRequired, :startDate, :careArrangement, :additionalInfo)";

try {
    $stmt = $pdo->prepare($sql);
    $executed = $stmt->execute([
        ':fullName'        => $fullName,
        ':phone'           => $phone,
        ':location'        => $location,
        ':whoNeedsCare'    => $whoNeedsCare,
        ':mainNeed'        => $mainNeed,
        ':serviceRequired' => $serviceRequired,
        ':startDate'       => $startDate,
        ':careArrangement' => $careArrangement,
        ':additionalInfo'  => $additionalInfo
    ]);

    if ($executed) {
        sendJsonResponse(200, 'success', 'Care request successfully recorded. Our team will contact you shortly.');
    } else {
        sendJsonResponse(500, 'error', 'Failed to save record to database.');
    }

} catch (PDOException $e) {
    // Log real database error internally for administrators
    error_log('Database Insert Exception: ' . $e->getMessage());

    // Send generic response to client to prevent credential/schema exposure
    sendJsonResponse(500, 'error', 'Database operation failed. Please try again later.');
}
?>