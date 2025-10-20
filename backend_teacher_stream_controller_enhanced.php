<?php
/*
 * Enhanced Teacher Stream Post Controller for SCMS
 * Supports creating, editing, and managing stream posts with attachments
 * 
 * Features:
 * - Create stream posts with multiple file attachments (up to 5) and links (up to 3)
 * - Edit existing posts (both draft and published) with full attachment management
 * - Support for both multipart/form-data and application/json input
 * - Complete attachment replacement strategy
 * - JWT authentication and authorization
 * 
 * Endpoints:
 * - POST /api/teacher/classroom/{class_code}/stream - Create new post
 * - PUT /api/teacher/classroom/{class_code}/stream/{stream_id} - Edit existing post
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

// Allow POST, PUT, and GET requests
if (!in_array($_SERVER['REQUEST_METHOD'], ['POST', 'PUT', 'GET'])) {
    http_response_code(405);
    echo json_encode([
        'status' => 'error',
        'message' => 'Method not allowed. Use GET to retrieve, POST to create, or PUT to edit.',
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
    
    // Get classroom ID from class code
    $classroomId = getClassroomIdFromCode($classCode);
    if (!$classroomId) {
        throw new Exception('Classroom not found');
    }
    
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        // GET STREAM POSTS
        handleGetStreamPosts($userId, $classroomId, $classCode);
    } elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
        // CREATE NEW STREAM POST
        handleCreateStreamPost($userId, $classroomId, $classCode);
    } elseif ($_SERVER['REQUEST_METHOD'] === 'PUT') {
        // EDIT EXISTING STREAM POST
        $streamId = getStreamIdFromUrl($pathParts);
        if (!$streamId) {
            throw new Exception('Stream ID not found in URL');
        }
        handleEditStreamPost($userId, $classroomId, $classCode, $streamId);
    }
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage(),
        'data' => null
    ]);
}

/**
 * Handle creating a new stream post
 */
function handleCreateStreamPost($userId, $classroomId, $classCode) {
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
        
        // Debug logging to help troubleshoot content issues
        error_log("DEBUG - POST data received: " . json_encode($postData));
        error_log("DEBUG - Raw content value: '" . ($_POST['content'] ?? 'NOT_SET') . "'");
        error_log("DEBUG - Content length: " . strlen($postData['content']));
        
        // Process file attachments (up to 5 files)
        for ($i = 0; $i < 5; $i++) {
            $fileKey = "attachment_{$i}";
            if (isset($_FILES[$fileKey]) && $_FILES[$fileKey]['error'] === UPLOAD_ERR_OK) {
                $attachments[] = [
                    'type' => 'file',
                    'file' => $_FILES[$fileKey],
                    'index' => $i
                ];
            }
        }
        
        // Process link attachments (up to 3 links)
        for ($i = 0; $i < 3; $i++) {
            $linkKey = "link_{$i}";
            if (isset($_POST[$linkKey]) && !empty($_POST[$linkKey])) {
                $attachments[] = [
                    'type' => 'link',
                    'url' => $_POST[$linkKey],
                    'index' => $i
                ];
            }
        }
    } else {
        // Handle application/json
        $postData = json_decode($input, true);
        if (!$postData) {
            throw new Exception('Invalid JSON data');
        }
    }
    
    // Validate required fields
    // Title is always required, but content can be empty if there are file attachments
    error_log("DEBUG - Validation check - Title: '" . $postData['title'] . "' (empty: " . (empty($postData['title']) ? 'YES' : 'NO') . ")");
    error_log("DEBUG - Validation check - Content: '" . $postData['content'] . "' (empty: " . (empty($postData['content']) ? 'YES' : 'NO') . ")");
    error_log("DEBUG - Validation check - Attachments count: " . count($attachments));
    
    if (empty($postData['title'])) {
        throw new Exception('Title is required');
    }
    
    // Content is required only if there are no file attachments
    if (empty($postData['content']) && empty($attachments)) {
        throw new Exception('Content is required when no attachments are provided');
    }
    
    // Create the stream post
    $streamId = createStreamPost($userId, $classroomId, $postData);
    
    // Process attachments if any
    if (!empty($attachments)) {
        processAttachments($streamId, $attachments);
    }
    
    // Return success response
    echo json_encode([
        'status' => 'success',
        'message' => 'Stream post created successfully',
        'data' => [
            'stream_id' => $streamId,
            'class_code' => $classCode,
            'attachments_count' => count($attachments)
        ]
    ]);
}

/**
 * Handle editing an existing stream post
 */
function handleEditStreamPost($userId, $classroomId, $classCode, $streamId) {
    // Verify the post exists and belongs to this teacher
    $existingPost = getStreamPost($streamId, $userId, $classroomId);
    if (!$existingPost) {
        throw new Exception('Stream post not found or access denied');
    }
    
    $input = file_get_contents('php://input');
    $contentType = $_SERVER['CONTENT_TYPE'] ?? '';
    
    $updateData = [];
    $newAttachments = [];
    
    if (strpos($contentType, 'multipart/form-data') !== false) {
        // Handle multipart/form-data (files + form fields)
        $updateData = [
            'title' => $_POST['title'] ?? $existingPost['title'],
            'content' => $_POST['content'] ?? $existingPost['content'],
            'is_draft' => $_POST['is_draft'] ?? $existingPost['is_draft'],
            'is_scheduled' => $_POST['is_scheduled'] ?? $existingPost['is_scheduled'],
            'scheduled_at' => $_POST['scheduled_at'] ?? $existingPost['scheduled_at'],
            'allow_comments' => $_POST['allow_comments'] ?? $existingPost['allow_comments'],
            'assignment_type' => $_POST['assignment_type'] ?? $existingPost['assignment_type'],
            'student_ids' => $_POST['student_ids'] ?? $existingPost['student_ids']
        ];
        
        // Process new file attachments (up to 5 files)
        for ($i = 0; $i < 5; $i++) {
            $fileKey = "attachment_{$i}";
            if (isset($_FILES[$fileKey]) && $_FILES[$fileKey]['error'] === UPLOAD_ERR_OK) {
                $newAttachments[] = [
                    'type' => 'file',
                    'file' => $_FILES[$fileKey],
                    'index' => $i
                ];
            }
        }
        
        // Process new link attachments (up to 3 links)
        for ($i = 0; $i < 3; $i++) {
            $linkKey = "link_{$i}";
            if (isset($_POST[$linkKey]) && !empty($_POST[$linkKey])) {
                $newAttachments[] = [
                    'type' => 'link',
                    'url' => $_POST[$linkKey],
                    'index' => $i
                ];
            }
        }
    } else {
        // Handle application/json
        $updateData = json_decode($input, true);
        if (!$updateData) {
            throw new Exception('Invalid JSON data');
        }
        
        // Merge with existing data for partial updates
        $updateData = array_merge($existingPost, $updateData);
    }
    
    // Validate required fields
    // Title is always required, but content can be empty if there are file attachments
    if (empty($updateData['title'])) {
        throw new Exception('Title is required');
    }
    
    // Content is required only if there are no file attachments
    if (empty($updateData['content']) && empty($attachments)) {
        throw new Exception('Content is required when no attachments are provided');
    }
    
    // Update the stream post
    updateStreamPost($streamId, $updateData);
    
    // If new attachments are provided, replace all existing attachments
    if (!empty($newAttachments)) {
        // Delete existing attachments
        deleteStreamAttachments($streamId);
        
        // Process new attachments
        processAttachments($streamId, $newAttachments);
    }
    
    // Return success response
    echo json_encode([
        'status' => 'success',
        'message' => 'Stream post updated successfully',
        'data' => [
            'stream_id' => $streamId,
            'class_code' => $classCode,
            'attachments_updated' => !empty($newAttachments),
            'new_attachments_count' => count($newAttachments)
        ]
    ]);
}

/**
 * Create a new stream post in the database
 */
function createStreamPost($userId, $classroomId, $postData) {
    global $conn;
    
    $sql = "INSERT INTO classroom_stream_posts (
        teacher_id, classroom_id, title, content, is_draft, 
        is_scheduled, scheduled_at, allow_comments, 
        assignment_type, student_ids, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param(
        "iissiissis",
        $userId,
        $classroomId,
        $postData['title'],
        $postData['content'],
        $postData['is_draft'],
        $postData['is_scheduled'],
        $postData['scheduled_at'],
        $postData['allow_comments'],
        $postData['assignment_type'],
        $postData['student_ids']
    );
    
    if (!$stmt->execute()) {
        throw new Exception('Failed to create stream post: ' . $stmt->error);
    }
    
    return $conn->insert_id;
}

/**
 * Update an existing stream post
 */
function updateStreamPost($streamId, $updateData) {
    global $conn;
    
    $sql = "UPDATE classroom_stream_posts SET 
        title = ?, content = ?, is_draft = ?, 
        is_scheduled = ?, scheduled_at = ?, allow_comments = ?, 
        assignment_type = ?, student_ids = ?, updated_at = NOW()
        WHERE id = ?";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param(
        "ssiissisi",
        $updateData['title'],
        $updateData['content'],
        $updateData['is_draft'],
        $updateData['is_scheduled'],
        $updateData['scheduled_at'],
        $updateData['allow_comments'],
        $updateData['assignment_type'],
        $updateData['student_ids'],
        $streamId
    );
    
    if (!$stmt->execute()) {
        throw new Exception('Failed to update stream post: ' . $stmt->error);
    }
    
    return true;
}

/**
 * Get a stream post by ID, verifying teacher ownership
 */
function getStreamPost($streamId, $userId, $classroomId) {
    global $conn;
    
    $sql = "SELECT * FROM classroom_stream_posts 
            WHERE id = ? AND teacher_id = ? AND classroom_id = ?";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("iii", $streamId, $userId, $classroomId);
    $stmt->execute();
    
    $result = $stmt->get_result();
    return $result->fetch_assoc();
}

/**
 * Process attachments for a stream post
 */
function processAttachments($streamId, $attachments) {
    foreach ($attachments as $attachment) {
        if ($attachment['type'] === 'file') {
            processFileAttachment($streamId, $attachment);
        } elseif ($attachment['type'] === 'link') {
            processLinkAttachment($streamId, $attachment);
        }
    }
}

/**
 * Process a file attachment
 */
function processFileAttachment($streamId, $attachment) {
    global $conn;
    
    $file = $attachment['file'];
    $uploadDir = 'uploads/stream_attachments/';
    
    // Create directory if it doesn't exist
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }
    
    // Generate unique filename
    $fileExtension = pathinfo($file['name'], PATHINFO_EXTENSION);
    $fileName = uniqid() . '_' . time() . '.' . $fileExtension;
    $filePath = $uploadDir . $fileName;
    
    // Move uploaded file
    if (!move_uploaded_file($file['tmp_name'], $filePath)) {
        throw new Exception('Failed to upload file: ' . $file['name']);
    }
    
    // Save to database
    $sql = "INSERT INTO stream_attachments (
        stream_id, attachment_type, attachment_url, file_name, original_name, 
        file_size, mime_type, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param(
        "issssss",
        $streamId,
        'file',
        $filePath,
        $fileName,
        $file['name'],
        $file['size'],
        $file['type']
    );
    
    if (!$stmt->execute()) {
        throw new Exception('Failed to save file attachment: ' . $stmt->error);
    }
}

/**
 * Process a link attachment
 */
function processLinkAttachment($streamId, $attachment) {
    global $conn;
    
    // Determine attachment type based on URL
    $attachmentType = 'link';
    if (strpos($attachment['url'], 'youtube.com') !== false || strpos($attachment['url'], 'youtu.be') !== false) {
        $attachmentType = 'youtube';
    } elseif (strpos($attachment['url'], 'drive.google.com') !== false) {
        $attachmentType = 'google_drive';
    }
    
    $sql = "INSERT INTO stream_attachments (
        stream_id, attachment_type, attachment_url, created_at
    ) VALUES (?, ?, ?, NOW())";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("iss", $streamId, $attachmentType, $attachment['url']);
    
    if (!$stmt->execute()) {
        throw new Exception('Failed to save link attachment: ' . $stmt->error);
    }
}

/**
 * Delete all attachments for a stream post
 */
function deleteStreamAttachments($streamId) {
    global $conn;
    
    // Get file attachments to delete physical files
    $sql = "SELECT attachment_url FROM stream_attachments 
            WHERE stream_id = ? AND attachment_type = 'file' AND attachment_url IS NOT NULL";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $streamId);
    $stmt->execute();
    
    $result = $stmt->get_result();
    while ($row = $result->fetch_assoc()) {
        if (file_exists($row['attachment_url'])) {
            unlink($row['attachment_url']);
        }
    }
    
    // Delete from database
    $sql = "DELETE FROM stream_attachments WHERE stream_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $streamId);
    
    if (!$stmt->execute()) {
        throw new Exception('Failed to delete attachments: ' . $stmt->error);
    }
}

/**
 * Get stream ID from URL path
 */
function getStreamIdFromUrl($pathParts) {
    $streamIndex = array_search('stream', $pathParts);
    if ($streamIndex === false || !isset($pathParts[$streamIndex + 1])) {
        return null;
    }
    
    $streamId = $pathParts[$streamIndex + 1];
    return is_numeric($streamId) ? (int)$streamId : null;
}

/**
 * Get classroom ID from class code
 */
function getClassroomIdFromCode($classCode) {
    global $conn;
    
    $sql = "SELECT id FROM classrooms WHERE class_code = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $classCode);
    $stmt->execute();
    
    $result = $stmt->get_result();
    $row = $result->fetch_assoc();
    
    return $row ? $row['id'] : null;
}

/**
 * Check if teacher has access to classroom
 */
function teacherHasAccessToClassroom($userId, $classCode) {
    global $conn;
    
    $sql = "SELECT COUNT(*) as count FROM classrooms 
            WHERE class_code = ? AND teacher_id = ?";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("si", $classCode, $userId);
    $stmt->execute();
    
    $result = $stmt->get_result();
    $row = $result->fetch_assoc();
    
    return $row['count'] > 0;
}

/**
 * Validate JWT token (implement your JWT validation logic)
 */
function validateJWTToken($token) {
    // This is a placeholder - implement your actual JWT validation
    // You should use a proper JWT library like firebase/php-jwt
    
    // For now, return a mock decoded token
    // In production, implement proper JWT validation
    return (object) [
        'user_id' => 1,
        'role' => 'teacher',
        'exp' => time() + 3600
    ];
}

/**
 * Handle GET request to retrieve stream posts with attachments
 */
function handleGetStreamPosts($userId, $classroomId, $classCode) {
    try {
        $pdo = getDatabaseConnection();
        
        // Get stream posts with their attachments
        $sql = "
            SELECT 
                cs.id,
                cs.title,
                cs.content,
                cs.is_draft,
                cs.is_scheduled,
                cs.scheduled_at,
                cs.allow_comments,
                cs.assignment_type,
                cs.student_ids,
                cs.created_at,
                cs.updated_at,
                u.full_name as author_name,
                u.profile_picture,
                GROUP_CONCAT(
                    JSON_OBJECT(
                        'id', sa.id,
                        'type', sa.attachment_type,
                        'url', sa.attachment_url,
                        'file_name', sa.file_name,
                        'original_name', sa.original_name,
                        'file_size', sa.file_size,
                        'mime_type', sa.mime_type,
                        'title', sa.title,
                        'description', sa.description
                    ) SEPARATOR '||'
                ) as attachments_json
            FROM classroom_stream cs
            LEFT JOIN users u ON cs.user_id = u.id
            LEFT JOIN stream_attachments sa ON cs.id = sa.stream_id
            WHERE cs.class_code = ? AND cs.is_draft = 0
            GROUP BY cs.id
            ORDER BY cs.created_at DESC
        ";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$classCode]);
        
        $posts = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            // Parse attachments
            $attachments = [];
            if ($row['attachments_json']) {
                $attachmentStrings = explode('||', $row['attachments_json']);
                foreach ($attachmentStrings as $attachmentJson) {
                    if ($attachmentJson) {
                        $attachment = json_decode($attachmentJson, true);
                        if ($attachment) {
                            $attachments[] = $attachment;
                        }
                    }
                }
            }
            
            // Build full URLs for file attachments
            foreach ($attachments as &$attachment) {
                if ($attachment['type'] === 'file' && $attachment['url']) {
                    $baseUrl = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http') . 
                               '://' . $_SERVER['HTTP_HOST'];
                    $attachment['download_url'] = $baseUrl . '/' . $attachment['url'];
                }
            }
            
            $posts[] = [
                'id' => $row['id'],
                'title' => $row['title'],
                'content' => $row['content'],
                'is_draft' => (bool)$row['is_draft'],
                'is_scheduled' => (bool)$row['is_scheduled'],
                'scheduled_at' => $row['scheduled_at'],
                'allow_comments' => (bool)$row['allow_comments'],
                'assignment_type' => $row['assignment_type'],
                'student_ids' => $row['student_ids'] ? json_decode($row['student_ids'], true) : null,
                'created_at' => $row['created_at'],
                'updated_at' => $row['updated_at'],
                'author' => [
                    'name' => $row['author_name'],
                    'profile_picture' => $row['profile_picture']
                ],
                'attachments' => $attachments
            ];
        }
        
        http_response_code(200);
        echo json_encode([
            'status' => 'success',
            'message' => 'Stream posts retrieved successfully',
            'data' => $posts
        ]);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'status' => 'error',
            'message' => 'Failed to retrieve stream posts: ' . $e->getMessage(),
            'data' => null
        ]);
    }
}
?>
