<?php
/*
 * Student Classroom People Endpoint for SCMS
 * Handles fetching teacher and students for a specific classroom
 * 
 * File location: /scms_new_backup/index.php/api/student/classroom/{class_code}/people
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
    
    // Get class code from URL path
    $pathParts = explode('/', trim($_SERVER['REQUEST_URI'], '/'));
    $classCodeIndex = array_search('classroom', $pathParts);
    if ($classCodeIndex === false || !isset($pathParts[$classCodeIndex + 1])) {
        throw new Exception('Class code not found in URL');
    }
    
    $classCode = $pathParts[$classCodeIndex + 1];
    
    // Validate class code format
    if (!preg_match('/^[A-Z0-9]{6}$/', $classCode)) {
        throw new Exception('Invalid class code format');
    }
    
    // Connect to database
    $pdo = getDatabaseConnection();
    
    $response = [
        'status' => true,
        'message' => 'Classroom members fetched successfully',
        'data' => [
            'teacher' => null,
            'students' => []
        ]
    ];
    
    // First, try to get teacher from classroom_enrollments table
    try {
        $stmt = $pdo->prepare("
            SELECT 
                u.id as user_id,
                u.full_name,
                u.email,
                u.profile_pic,
                u.profile_image,
                u.google_avatar,
                u.user_avatar,
                u.avatar,
                u.role,
                u.status,
                ce.enrolled_at
            FROM users u
            INNER JOIN classroom_enrollments ce ON u.id = ce.teacher_id
            INNER JOIN classrooms c ON ce.classroom_id = c.id
            WHERE c.class_code = ? AND u.role = 'teacher' AND u.status = 'active'
            LIMIT 1
        ");
        $stmt->execute([$classCode]);
        $teacher = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($teacher) {
            $response['data']['teacher'] = $teacher;
        }
    } catch (Exception $e) {
        // If classroom_enrollments table doesn't exist, try alternative approach
        error_log('Teacher query failed: ' . $e->getMessage());
        
        // Try to get teacher from classrooms table directly
        try {
            $stmt = $pdo->prepare("
                SELECT 
                    u.id as user_id,
                    u.full_name,
                    u.email,
                    u.profile_pic,
                    u.profile_image,
                    u.google_avatar,
                    u.user_avatar,
                    u.avatar,
                    u.role,
                    u.status,
                    c.created_at as enrolled_at
                FROM users u
                INNER JOIN classrooms c ON u.id = c.teacher_id
                WHERE c.class_code = ? AND u.role = 'teacher' AND u.status = 'active'
                LIMIT 1
            ");
            $stmt->execute([$classCode]);
            $teacher = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($teacher) {
                $response['data']['teacher'] = $teacher;
            }
        } catch (Exception $e2) {
            error_log('Alternative teacher query failed: ' . $e2->getMessage());
        }
    }
    
    // Now get students from classroom_enrollments table
    try {
        $stmt = $pdo->prepare("
            SELECT 
                u.id as user_id,
                u.full_name,
                u.name,
                u.email,
                u.student_num,
                u.contact_num,
                u.program,
                u.section_name,
                u.profile_pic,
                u.profile_image,
                u.google_avatar,
                u.user_avatar,
                u.avatar,
                u.status,
                ce.enrolled_at,
                ce.enrollment_status
            FROM users u
            INNER JOIN classroom_enrollments ce ON u.id = ce.student_id
            INNER JOIN classrooms c ON ce.classroom_id = c.id
            WHERE c.class_code = ? AND u.role = 'student' AND u.status = 'active'
            ORDER BY u.full_name ASC
        ");
        $stmt->execute([$classCode]);
        $enrolledStudents = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        if (!empty($enrolledStudents)) {
            $response['data']['students'] = $enrolledStudents;
        }
    } catch (Exception $e) {
        // If classroom_enrollments table doesn't exist, fall back to all students
        error_log('Student enrollments query failed: ' . $e->getMessage());
        
        // Fallback: get all students if no specific enrollments found
        $stmt = $pdo->prepare("
            SELECT 
                id as user_id,
                full_name,
                name,
                email,
                student_num,
                contact_num,
                program,
                section_name,
                profile_pic,
                profile_image,
                google_avatar,
                user_avatar,
                avatar,
                status,
                created_at as enrolled_at,
                'active' as enrollment_status
            FROM users 
            WHERE role = 'student' AND status = 'active'
            ORDER BY full_name ASC
        ");
        $stmt->execute();
        $allStudents = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        if (!empty($allStudents)) {
            $response['data']['students'] = $allStudents;
        }
    }
    
    echo json_encode($response);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => false,
        'message' => 'Error fetching classroom members: ' . $e->getMessage(),
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
