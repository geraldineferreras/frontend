<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Check if it's a GET request for backup codes or POST for generating new ones
$requestMethod = $_SERVER['REQUEST_METHOD'];
$requestUri = $_SERVER['REQUEST_URI'];

// Extract the endpoint from the URI
if (preg_match('/\/api\/2fa\/backup-codes(\/generate)?$/', $requestUri, $matches)) {
    $isGenerate = !empty($matches[1]);
    
    if ($requestMethod === 'GET' && !$isGenerate) {
        // GET /api/2fa/backup-codes - Get current backup codes
        handleGetBackupCodes();
    } elseif ($requestMethod === 'POST' && $isGenerate) {
        // POST /api/2fa/backup-codes/generate - Generate new backup codes
        handleGenerateBackupCodes();
    } else {
        http_response_code(405);
        echo json_encode([
            'status' => false,
            'message' => 'Method not allowed'
        ]);
    }
} else {
    http_response_code(404);
    echo json_encode([
        'status' => false,
        'message' => 'Endpoint not found'
    ]);
}

function handleGetBackupCodes() {
    // Check authorization header
    $headers = getallheaders();
    $authHeader = isset($headers['Authorization']) ? $headers['Authorization'] : '';
    
    if (!preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
        http_response_code(401);
        echo json_encode([
            'status' => false,
            'message' => 'Authorization header missing or invalid'
        ]);
        return;
    }
    
    $token = $matches[1];
    
    // TODO: Validate JWT token and get user ID
    // For now, return mock data
    $mockBackupCodes = [
        'A1B2C3D4',
        'E5F6G7H8',
        'I9J0K1L2',
        'M3N4O5P6',
        'Q7R8S9T0',
        'U1V2W3X4',
        'Y5Z6A7B8',
        'C9D0E1F2'
    ];
    
    echo json_encode([
        'status' => true,
        'message' => 'Backup codes retrieved successfully',
        'data' => [
            'backup_codes' => $mockBackupCodes,
            'total_codes' => count($mockBackupCodes),
            'remaining_codes' => count($mockBackupCodes)
        ]
    ]);
}

function handleGenerateBackupCodes() {
    // Check authorization header
    $headers = getallheaders();
    $authHeader = isset($headers['Authorization']) ? $headers['Authorization'] : '';
    
    if (!preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
        http_response_code(401);
        echo json_encode([
            'status' => false,
            'message' => 'Authorization header missing or invalid'
        ]);
        return;
    }
    
    $token = $matches[1];
    
    // TODO: Validate JWT token and get user ID
    // TODO: Verify 2FA code if required
    // For now, generate new mock backup codes
    
    // Generate 8 new backup codes (8 characters each, alphanumeric)
    $newBackupCodes = [];
    for ($i = 0; $i < 8; $i++) {
        $code = '';
        for ($j = 0; $j < 8; $j++) {
            $code .= chr(rand(65, 90)); // A-Z
        }
        $newBackupCodes[] = $code;
    }
    
    echo json_encode([
        'status' => true,
        'message' => 'New backup codes generated successfully',
        'data' => [
            'backup_codes' => $newBackupCodes,
            'total_codes' => count($newBackupCodes),
            'remaining_codes' => count($newBackupCodes),
            'generated_at' => date('Y-m-d H:i:s')
        ]
    ]);
}
?>
