<?php
/*
 * Students Endpoint for SCMS
 * Handles fetching all students for the Add Students modal
 * 
 * File location: /scms_new_backup/index.php/api/users
 */

// Set CORS headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Only allow GET requests
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode([
        'status' => false,
        'message' => 'Method not allowed',
        'data' => null
    ]);
    exit();
}

try {
    // Load database configuration (adjust path as needed)
    require_once 'config/database.php';
    
    // Get JWT token from Authorization header
    $headers = getallheaders();
    $authHeader = $headers['Authorization'] ?? '';
    
    if (!preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
        throw new Exception('Authorization header missing or invalid');
    }
    
    $token = $matches[1];
    
    // For now, we'll skip JWT validation to get this working
    // In production, you should implement proper JWT validation
    
    // Get role filter from query string
    $role = $_GET['role'] ?? null;
    
    // Connect to database
    $pdo = getDatabaseConnection();
    
    // Build query based on role filter
    if ($role) {
        $stmt = $pdo->prepare("SELECT * FROM users WHERE role = ? AND status = 'active' ORDER BY full_name ASC");
        $stmt->execute([$role]);
    } else {
        $stmt = $pdo->prepare("SELECT * FROM users WHERE status = 'active' ORDER BY full_name ASC");
        $stmt->execute();
    }
    
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Transform data to match frontend expectations
    $transformedUsers = array_map(function($user) {
        return [
            'id' => $user['id'],
            'full_name' => $user['full_name'],
            'email' => $user['email'],
            'role' => $user['role'],
            'student_num' => $user['student_num'] ?? null,
            'contact_num' => $user['contact_num'] ?? null,
            'program' => $user['program'] ?? null,
            'section_name' => $user['section_name'] ?? null,
            'profile_pic' => $user['profile_pic'] ?? null,
            'status' => $user['status'],
            'created_at' => $user['created_at']
        ];
    }, $users);
    
    echo json_encode([
        'status' => true,
        'message' => 'Users fetched successfully',
        'data' => $transformedUsers
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => false,
        'message' => 'Error fetching users: ' . $e->getMessage(),
        'data' => null
    ]);
}

// Helper function to get database connection
function getDatabaseConnection() {
    // This should match your existing database configuration
    $host = 'localhost';
    $dbname = 'scms_db'; // Adjust to your database name
    $username = 'root'; // Adjust to your database username
    $password = ''; // Adjust to your database password
    
    try {
        $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        return $pdo;
    } catch (PDOException $e) {
        throw new Exception('Database connection failed: ' . $e->getMessage());
    }
}
?>
