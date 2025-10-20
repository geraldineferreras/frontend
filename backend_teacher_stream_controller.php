<?php
/*
 * Enhanced Teacher Stream Post Controller for SCMS
 * Supports multiple link attachments (regular links, YouTube, Google Drive)
 * 
 * File location: /scms_new_backup/index.php/api/teacher/classroom/{class_code}/stream
 * Or add to your existing Teacher controller
 */

// Set CORS headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Only allow POST requests for creating stream posts
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'status' => 'error',
        'message' => 'Method not allowed',
        'data' => null
    ]);
    exit();
}

try {
    // Load database configuration (adjust path as needed)
    require_once 'config/database.php';
    require_once 'config/auth.php';
    
    // Get JWT token from Authorization header
    $headers = getallheaders();
    $authHeader = $headers['Authorization'] ?? '';
    
    if (!preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
        throw new Exception('Authorization header missing or invalid');
    }
    
    $token = $matches[1];
    
    // Validate JWT token (implement your JWT validation logic)
    $decodedToken = validateJWTToken($token);
    if (!$decodedToken) {
        throw new Exception('Invalid or expired token');
    }
    
    // Check if user is a teacher
    if ($decodedToken->role !== 'teacher') {
        throw new Exception('Access denied. Teachers only.');
    }
    
    $userId = $decodedToken->user_id;
    
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
    
    // Check if teacher has access to this classroom
    if (!teacherHasAccessToClassroom($userId, $classCode)) {
        throw new Exception('Access denied to this classroom');
    }
    
    // Get request data
    $input = file_get_contents('php://input');
    $contentType = $_SERVER['CONTENT_TYPE'] ?? '';
    
    $postData = [];
    $attachments = [];
    
    if (strpos($contentType, 'multipart/form-data') !== false) {
        // Handle multipart/form-data (files + form fields)
        $postData = [
            'title' => trim($_POST['title'] ?? ''),
            'content' => trim($_POST['content'] ?? ''),
            'is_draft' => $_POST['is_draft'] ?? 0,
            'is_scheduled' => $_POST['is_scheduled'] ?? 0,
            'scheduled_at' => $_POST['scheduled_at'] ?? '',
            'allow_comments' => $_POST['allow_comments'] ?? 1,
            'assignment_type' => $_POST['assignment_type'] ?? 'classroom',
            'student_ids' => $_POST['student_ids'] ?? null
        ];
        
        // Process file attachments
        $fileIndex = 0;
        while (isset($_FILES["attachment_{$fileIndex}"])) {
            $file = $_FILES["attachment_{$fileIndex}"];
            if ($file['error'] === UPLOAD_ERR_OK) {
                $attachments[] = [
                    'type' => 'file',
                    'file' => $file,
                    'file_name' => $file['name'],
                    'file_size' => $file['size'],
                    'mime_type' => $file['type']
                ];
            }
            $fileIndex++;
        }
        
        // Process link attachments
        $linkIndex = 0;
        while (isset($_POST["link_{$linkIndex}"])) {
            $url = $_POST["link_{$linkIndex}"];
            if (!empty($url)) {
                $attachments[] = [
                    'type' => 'link',
                    'url' => $url,
                    'title' => $_POST["link_title_{$linkIndex}"] ?? '',
                    'description' => $_POST["link_description_{$linkIndex}"] ?? ''
                ];
            }
            $linkIndex++;
        }
        
        // Process YouTube attachments
        $youtubeIndex = 0;
        while (isset($_POST["youtube_{$youtubeIndex}"])) {
            $url = $_POST["youtube_{$youtubeIndex}"];
            if (!empty($url)) {
                $attachments[] = [
                    'type' => 'youtube',
                    'url' => $url,
                    'title' => $_POST["youtube_title_{$youtubeIndex}"] ?? '',
                    'description' => $_POST["youtube_description_{$youtubeIndex}"] ?? ''
                ];
            }
            $youtubeIndex++;
        }
        
        // Process Google Drive attachments
        $gdriveIndex = 0;
        while (isset($_POST["gdrive_{$gdriveIndex}"])) {
            $url = $_POST["gdrive_{$gdriveIndex}"];
            if (!empty($url)) {
                $attachments[] = [
                    'type' => 'google_drive',
                    'url' => $url,
                    'title' => $_POST["gdrive_title_{$gdriveIndex}"] ?? '',
                    'description' => $_POST["gdrive_description_{$gdriveIndex}"] ?? ''
                ];
            }
            $gdriveIndex++;
        }
        
    } else {
        // Handle JSON payload
        $data = json_decode($input, true);
        if (!$data) {
            throw new Exception('Invalid JSON data');
        }
        
        $postData = [
            'title' => $data['title'] ?? '',
            'content' => $data['content'] ?? '',
            'is_draft' => $data['is_draft'] ?? 0,
            'is_scheduled' => $data['is_scheduled'] ?? 0,
            'scheduled_at' => $data['scheduled_at'] ?? '',
            'allow_comments' => $data['allow_comments'] ?? 1,
            'assignment_type' => $data['assignment_type'] ?? 'classroom',
            'student_ids' => $data['student_ids'] ?? null
        ];
        
        // Process attachments from JSON
        if (isset($data['attachments']) && is_array($data['attachments'])) {
            foreach ($data['attachments'] as $attachment) {
                if (isset($attachment['type']) && isset($attachment['url'])) {
                    $attachments[] = [
                        'type' => $attachment['type'],
                        'url' => $attachment['url'],
                        'title' => $attachment['title'] ?? '',
                        'description' => $attachment['description'] ?? ''
                    ];
                }
            }
        }
    }
    
    // Debug logging to help troubleshoot content issues
    error_log("DEBUG - POST data received: " . json_encode($postData));
    error_log("DEBUG - Raw content value: '" . ($postData['content'] ?? 'NOT_SET') . "'");
    error_log("DEBUG - Content length: " . strlen($postData['content']));
    error_log("DEBUG - Attachments count: " . count($attachments));
    
    // Validate required fields
    // Title is always required, but content can be empty if there are file attachments
    error_log("DEBUG - Validation check - Title: '" . $postData['title'] . "' (empty: " . (empty($postData['title']) ? 'YES' : 'NO') . ")");
    error_log("DEBUG - Validation check - Content: '" . $postData['content'] . "' (empty: " . (empty($postData['content']) ? 'YES' : 'NO') . ")");
    
    if (empty($postData['title'])) {
        throw new Exception('Title is required');
    }
    
    // Content is required only if there are no file attachments
    if (empty($postData['content']) && empty($attachments)) {
        throw new Exception('Content is required when no attachments are provided');
    }
    
    // Validate and process attachments
    $validatedAttachments = [];
    foreach ($attachments as $attachment) {
        $validatedAttachment = validateAttachment($attachment);
        if ($validatedAttachment) {
            $validatedAttachments[] = $validatedAttachment;
        }
    }
    
    // Create stream post
    $streamId = createStreamPost($userId, $classCode, $postData, $validatedAttachments);
    
    // Return success response
    http_response_code(200);
    echo json_encode([
        'status' => 'success',
        'message' => 'Stream post created successfully',
        'data' => [
            'stream_id' => $streamId,
            'title' => $postData['title'],
            'content' => $postData['content'],
            'attachment_type' => count($validatedAttachments) > 1 ? 'multiple' : (count($validatedAttachments) === 1 ? $validatedAttachments[0]['type'] : 'none'),
            'attachment_url' => null, // For multiple attachments, this is null
            'created_at' => date('Y-m-d H:i:s')
        ]
    ]);
    
} catch (Exception $e) {
    // Return error response
    http_response_code(400);
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage(),
        'data' => null
    ]);
}

/**
 * Validate JWT token
 */
function validateJWTToken($token) {
    // Implement your JWT validation logic here
    // This is a placeholder - replace with your actual JWT validation
    
    try {
        // Example JWT validation (replace with your implementation)
        $secret = getenv('JWT_SECRET') ?: 'your-secret-key';
        
        // Decode and verify token
        $decoded = JWT::decode($token, $secret, ['HS256']);
        
        // Check if token is expired
        if (isset($decoded->exp) && $decoded->exp < time()) {
            return false;
        }
        
        return $decoded;
    } catch (Exception $e) {
        return false;
    }
}

/**
 * Check if teacher has access to classroom
 */
function teacherHasAccessToClassroom($teacherId, $classCode) {
    // Implement your access control logic here
    // This is a placeholder - replace with your actual database query
    
    try {
        $pdo = getDatabaseConnection();
        
        $stmt = $pdo->prepare("
            SELECT COUNT(*) as count 
            FROM classroom_teachers 
            WHERE teacher_id = ? AND class_code = ? AND status = 'active'
        ");
        $stmt->execute([$teacherId, $classCode]);
        
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return $result['count'] > 0;
        
    } catch (Exception $e) {
        error_log("Error checking teacher access: " . $e->getMessage());
        return false;
    }
}

/**
 * Validate attachment data
 */
function validateAttachment($attachment) {
    $type = $attachment['type'] ?? '';
    $url = $attachment['url'] ?? '';
    
    if (empty($url)) {
        return false;
    }
    
    switch ($type) {
        case 'link':
            // Basic URL validation
            if (!filter_var($url, FILTER_VALIDATE_URL)) {
                return false;
            }
            break;
            
        case 'youtube':
            // YouTube URL validation
            if (!isValidYouTubeUrl($url)) {
                throw new Exception('Invalid YouTube URL format');
            }
            break;
            
        case 'google_drive':
            // Google Drive URL validation
            if (!isValidGoogleDriveUrl($url)) {
                throw new Exception('Invalid Google Drive URL format');
            }
            break;
            
        case 'file':
            // File validation (already handled in multipart processing)
            return $attachment;
            
        default:
            return false;
    }
    
    return [
        'type' => $type,
        'url' => $url,
        'title' => $attachment['title'] ?? '',
        'description' => $attachment['description'] ?? '',
        'file_name' => generateFileName($type, $url),
        'mime_type' => getMimeType($type)
    ];
}

/**
 * Validate YouTube URL
 */
function isValidYouTubeUrl($url) {
    $patterns = [
        '/^https:\/\/www\.youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/',
        '/^https:\/\/youtu\.be\/([a-zA-Z0-9_-]+)/',
        '/^https:\/\/www\.youtube\.com\/embed\/([a-zA-Z0-9_-]+)/'
    ];
    
    foreach ($patterns as $pattern) {
        if (preg_match($pattern, $url)) {
            return true;
        }
    }
    
    return false;
}

/**
 * Validate Google Drive URL
 */
function isValidGoogleDriveUrl($url) {
    $patterns = [
        '/^https:\/\/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)\/view/',
        '/^https:\/\/drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/',
        '/^https:\/\/docs\.google\.com\/document\/d\/([a-zA-Z0-9_-]+)\/edit/'
    ];
    
    foreach ($patterns as $pattern) {
        if (preg_match($pattern, $url)) {
            return true;
        }
    }
    
    return false;
}

/**
 * Generate filename for attachment
 */
function generateFileName($type, $url) {
    switch ($type) {
        case 'youtube':
            return 'youtube_video_' . time() . '.mp4';
        case 'google_drive':
            return 'gdrive_document_' . time() . '.pdf';
        case 'link':
            $parsed = parse_url($url);
            $domain = $parsed['host'] ?? 'link';
            return $domain . '_' . time() . '.html';
        default:
            return 'attachment_' . time() . '.txt';
    }
}

/**
 * Get MIME type for attachment
 */
function getMimeType($type) {
    switch ($type) {
        case 'youtube':
            return 'video/mp4';
        case 'google_drive':
            return 'application/pdf';
        case 'link':
            return 'text/html';
        default:
            return 'application/octet-stream';
    }
}

/**
 * Create stream post in database
 */
function createStreamPost($userId, $classCode, $postData, $attachments) {
    try {
        $pdo = getDatabaseConnection();
        
        // Start transaction
        $pdo->beginTransaction();
        
        // Insert main stream post
        $stmt = $pdo->prepare("
            INSERT INTO classroom_stream (
                class_code, user_id, title, content, is_draft, is_scheduled, 
                scheduled_at, allow_comments, assignment_type, student_ids, 
                attachment_type, attachment_url, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        ");
        
        $attachmentType = count($attachments) > 1 ? 'multiple' : (count($attachments) === 1 ? $attachments[0]['type'] : 'none');
        $attachmentUrl = count($attachments) === 1 ? $attachments[0]['url'] : null;
        $studentIds = $postData['student_ids'] ? json_encode($postData['student_ids']) : null;
        
        $stmt->execute([
            $classCode,
            $userId,
            $postData['title'],
            $postData['content'],
            $postData['is_draft'],
            $postData['is_scheduled'],
            $postData['scheduled_at'],
            $postData['allow_comments'],
            $postData['assignment_type'],
            $studentIds,
            $attachmentType,
            $attachmentUrl
        ]);
        
        $streamId = $pdo->lastInsertId();
        
        // Insert attachments if any
        if (!empty($attachments)) {
            $stmt = $pdo->prepare("
                INSERT INTO stream_attachments (
                    stream_id, attachment_type, attachment_url, file_name, 
                    original_name, file_size, mime_type, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
            ");
            
            foreach ($attachments as $attachment) {
                $stmt->execute([
                    $streamId,
                    $attachment['type'],
                    $attachment['url'],
                    $attachment['file_name'],
                    $attachment['title'] ?: $attachment['file_name'],
                    $attachment['file_size'] ?? 0,
                    $attachment['mime_type']
                ]);
            }
        }
        
        // Commit transaction
        $pdo->commit();
        
        return $streamId;
        
    } catch (Exception $e) {
        // Rollback transaction on error
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        throw new Exception('Database error: ' . $e->getMessage());
    }
}

/**
 * Get database connection
 */
function getDatabaseConnection() {
    // Implement your database connection logic here
    // This is a placeholder - replace with your actual database connection
    
    try {
        $host = getenv('DB_HOST') ?: 'localhost';
        $dbname = getenv('DB_NAME') ?: 'scms_db';
        $username = getenv('DB_USERNAME') ?: 'root';
        $password = getenv('DB_PASSWORD') ?: '';
        
        $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        
        return $pdo;
        
    } catch (Exception $e) {
        throw new Exception('Database connection failed: ' . $e->getMessage());
    }
}

?>
