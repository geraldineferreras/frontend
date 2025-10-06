<?php
/*
 * User Registration Endpoint for SCMS
 * Handles user registration with email-based role verification
 * 
 * File location: /scms_new_backup/index.php/api/register
 */

// Set CORS headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
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
        'message' => 'Method not allowed',
        'data' => null
    ]);
    exit();
}

try {
    // Load database configuration (adjust path as needed)
    require_once 'config/database.php';
    
    // Get JSON input
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    
    if (!$data) {
        throw new Exception('Invalid JSON data');
    }
    
    // Extract and validate required fields
    $email = trim($data['email'] ?? '');
    $fullName = trim($data['full_name'] ?? '');
    $password = $data['password'] ?? '';
    $role = trim($data['role'] ?? '');
    $contactNum = trim($data['contact_num'] ?? '');
    $address = trim($data['contact_num'] ?? '');
    
    // Basic validation
    if (empty($email) || empty($fullName) || empty($password) || empty($role)) {
        throw new Exception('Missing required fields: email, full_name, password, role');
    }
    
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        throw new Exception('Invalid email format');
    }
    
    if (strlen($password) < 6) {
        throw new Exception('Password must be at least 6 characters long');
    }
    
    // Email-based role verification
    $detectedRole = detectRoleFromEmail($email);
    
    // If role was manually selected, verify it matches email pattern
    if ($role !== $detectedRole) {
        throw new Exception("Email pattern indicates this should be a {$detectedRole} account. Please select the correct role.");
    }
    
    // Check if user already exists
    $pdo = getDatabaseConnection();
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$email]);
    
    if ($stmt->fetch()) {
        throw new Exception('User with this email already exists');
    }
    
    // Hash password
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
    
    // Prepare user data
    $userData = [
        'full_name' => $fullName,
        'email' => $email,
        'password' => $hashedPassword,
        'role' => $role,
        'contact_num' => $contactNum,
        'address' => $address,
        'status' => 'active',
        'created_at' => date('Y-m-d H:i:s'),
        'auth_provider' => 'local'
    ];
    
    // Add role-specific fields
    if ($role === 'student') {
        $studentNum = trim($data['student_num'] ?? '');
        $program = trim($data['program'] ?? '');
        $sectionId = $data['section_id'] ?? null;
        
        if (empty($studentNum)) {
            throw new Exception('Student number is required for students');
        }
        if (empty($program)) {
            throw new Exception('Program is required for students');
        }
        
        $userData['student_num'] = $studentNum;
        $userData['program'] = $program;
        if ($sectionId) {
            $userData['section_id'] = $sectionId;
        }
        
        // Generate QR code for students
        $userData['qr_code'] = "IDNo: {$studentNum}\nFull Name: {$fullName}\nProgram: {$program}";
        
    } elseif ($role === 'teacher') {
        $program = trim($data['program'] ?? '');
        if (empty($program)) {
            throw new Exception('Program/Department is required for teachers');
        }
        $userData['program'] = $program;
    }
    
    // Insert user into database
    $columns = implode(', ', array_keys($userData));
    $placeholders = ':' . implode(', :', array_keys($userData));
    
    $sql = "INSERT INTO users ({$columns}) VALUES ({$placeholders})";
    $stmt = $pdo->prepare($sql);
    
    if (!$stmt->execute($userData)) {
        throw new Exception('Failed to create user account');
    }
    
    $userId = $pdo->lastInsertId();
    
    // Return success response
    http_response_code(201);
    echo json_encode([
        'status' => true,
        'message' => 'User registration successful',
        'data' => [
            'id' => $userId,
            'email' => $email,
            'full_name' => $fullName,
            'role' => $role,
            'status' => 'active'
        ]
    ]);
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'status' => false,
        'message' => $e->getMessage(),
        'data' => null
    ]);
}

/**
 * Detect user role based on email pattern
 * 
 * @param string $email User's email address
 * @return string 'student' or 'teacher'
 */
function detectRoleFromEmail($email) {
    // Extract the part before @pampangastateu.edu.ph
    $localPart = str_replace('@pampangastateu.edu.ph', '', $email);
    
    // Check if it's a student number (10 digits starting with year)
    if (preg_match('/^\d{10}$/', $localPart)) {
        return 'student';
    }
    
    // Check if it's initials (e.g., a.ferrer)
    if (preg_match('/^[a-z]\.[a-z]+$/i', $localPart)) {
        return 'teacher';
    }
    
    // Default to student if pattern is unclear
    return 'student';
}

/**
 * Get database connection
 * 
 * @return PDO
 */
function getDatabaseConnection() {
    // You'll need to implement this based on your database configuration
    // This is a placeholder - replace with your actual database connection logic
    
    $host = 'localhost';
    $dbname = 'scms_db'; // Replace with your actual database name
    $username = 'root'; // Replace with your actual database username
    $password = ''; // Replace with your actual database password
    
    try {
        $pdo = new PDO("mysql:host={$host};dbname={$dbname};charset=utf8mb4", $username, $password);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        return $pdo;
    } catch (PDOException $e) {
        throw new Exception('Database connection failed: ' . $e->getMessage());
    }
}
?>
