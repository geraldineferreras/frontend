<?php
/*
 * Google OAuth Backend Stub for SCMS
 * Place this in your backend API directory to handle Google OAuth requests
 * 
 * File location: /scms_new_backup/index.php/api/auth/google
 * Or add to your existing Auth controller
 */

// Set CORS headers
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'status' => false,
        'message' => 'Method not allowed'
    ]);
    exit();
}

try {
    // Get JSON input
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    
    if (!$data) {
        throw new Exception('Invalid JSON data');
    }
    
    // Extract Google user data
    $email = $data['email'] ?? '';
    $name = $data['name'] ?? '';
    $firstName = $data['firstName'] ?? '';
    $lastName = $data['lastName'] ?? '';
    $imageUrl = $data['imageUrl'] ?? '';
    $idToken = $data['idToken'] ?? '';
    
    // Basic validation
    if (empty($email) || empty($name)) {
        throw new Exception('Missing required user data');
    }
    
    // For demo purposes, we'll simulate a successful response
    // In production, you would:
    // 1. Verify the Google ID token
    // 2. Check if user exists in database
    // 3. Create user if doesn't exist
    // 4. Generate JWT token
    // 5. Return user data and token
    
    $mockUser = [
        'id' => 'google_' . time(),
        'email' => $email,
        'full_name' => $name,
        'first_name' => $firstName,
        'last_name' => $lastName,
        'role' => 'student', // or determine based on email domain/logic
        'profile_image' => $imageUrl,
        'auth_provider' => 'google',
        'status' => 'active',
        'created_at' => date('Y-m-d H:i:s')
    ];
    
    // Generate a mock JWT token (in production, use proper JWT library)
    $mockToken = 'jwt_' . base64_encode(json_encode([
        'sub' => $mockUser['id'],
        'email' => $mockUser['email'],
        'role' => $mockUser['role'],
        'iat' => time(),
        'exp' => time() + (24 * 60 * 60) // 24 hours
    ]));
    
    // Return successful response
    http_response_code(200);
    echo json_encode([
        'status' => true,
        'message' => 'Google authentication successful',
        'data' => [
            'token' => $mockToken,
            'user' => $mockUser
        ]
    ]);
    
} catch (Exception $e) {
    // Return error response
    http_response_code(500);
    echo json_encode([
        'status' => false,
        'message' => 'Authentication failed: ' . $e->getMessage()
    ]);
}
?>

<!--
USAGE INSTRUCTIONS:

1. Copy this file to your backend directory
2. Add this route to your API router or .htaccess
3. Or integrate this code into your existing Auth controller

INTEGRATION INTO EXISTING CONTROLLER:

public function google() {
    // Copy the code from this file (without <?php tags)
    // Adapt to your existing database models and JWT implementation
}

PRODUCTION IMPLEMENTATION:

1. Install Google Client Library:
   composer require google/apiclient

2. Verify ID Token:
   $client = new Google_Client(['client_id' => 'YOUR_GOOGLE_CLIENT_ID']);
   $payload = $client->verifyIdToken($idToken);

3. Database Integration:
   - Check if user exists by email
   - Create new user if doesn't exist
   - Update last_login timestamp
   - Generate proper JWT token

4. Security:
   - Validate all input data
   - Use prepared statements for database queries
   - Implement rate limiting
   - Log authentication attempts
-->
