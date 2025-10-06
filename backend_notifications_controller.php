<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Notifications extends CI_Controller {
    
    public function __construct() {
        parent::__construct();
        
        // Load necessary models
        $this->load->model('user_model'); // Adjust model name as needed
        $this->load->library('jwt'); // If you have JWT library
        
        // Set headers for SSE
        header('Content-Type: text/event-stream');
        header('Cache-Control: no-cache');
        header('Connection: keep-alive');
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Headers: Content-Type');
        header('Access-Control-Allow-Methods: GET');
    }
    
    /**
     * SSE Stream endpoint for real-time notifications
     * URL: /api/notifications/stream/{token}
     */
    public function stream($token = null) {
        // Validate token from URL path
        if (!$token) {
            $this->sendError('Token required', 401);
            return;
        }
        
        // Get query parameters
        $userId = $this->input->get('userId');
        $role = $this->input->get('role');
        
        // Validate required parameters
        if (!$userId || !$role) {
            $this->sendError('userId and role required', 400);
            return;
        }
        
        // Validate JWT token
        try {
            $decoded = $this->jwt->decode($token, $this->config->item('jwt_secret'));
            
            // Check if token matches the user
            if ($decoded->user_id !== $userId) {
                $this->sendError('Token mismatch', 401);
                return;
            }
            
            // Check if token is expired
            if (time() > $decoded->exp) {
                $this->sendError('Token expired', 401);
                return;
            }
            
        } catch (Exception $e) {
            $this->sendError('Invalid token', 401);
            return;
        }
        
        // Send initial connection success
        $this->sendEvent('connected', [
            'message' => 'SSE connection established',
            'userId' => $userId,
            'role' => $role,
            'timestamp' => date('c')
        ]);
        
        // Keep connection alive and send notifications
        $this->streamNotifications($userId, $role);
    }
    
    /**
     * Stream notifications to the client
     */
    private function streamNotifications($userId, $role) {
        $lastCheck = time();
        
        while (true) {
            // Check for new notifications every 5 seconds
            if (time() - $lastCheck >= 5) {
                $notifications = $this->getNewNotifications($userId, $role);
                
                foreach ($notifications as $notification) {
                    $this->sendEvent('notification', $notification);
                }
                
                $lastCheck = time();
            }
            
            // Send heartbeat every 30 seconds
            if (time() % 30 === 0) {
                $this->sendEvent('heartbeat', [
                    'timestamp' => date('c')
                ]);
            }
            
            // Flush output buffer
            if (ob_get_level()) {
                ob_end_flush();
            }
            flush();
            
            // Sleep for 1 second
            sleep(1);
            
            // Check if client is still connected
            if (connection_aborted()) {
                break;
            }
        }
    }
    
    /**
     * Get new notifications for the user
     */
    private function getNewNotifications($userId, $role) {
        // TODO: Implement your notification logic here
        // This should query your database for new notifications
        
        // Example structure:
        $notifications = [
            [
                'id' => uniqid(),
                'type' => 'info',
                'title' => 'Welcome!',
                'message' => 'SSE connection established successfully',
                'timestamp' => date('c'),
                'duration' => 5000
            ]
        ];
        
        return $notifications;
    }
    
    /**
     * Send SSE event to client
     */
    private function sendEvent($event, $data) {
        echo "event: {$event}\n";
        echo "data: " . json_encode($data) . "\n\n";
        
        if (ob_get_level()) {
            ob_end_flush();
        }
        flush();
    }
    
    /**
     * Send error event
     */
    private function sendError($message, $code = 400) {
        $this->sendEvent('error', [
            'message' => $message,
            'code' => $code,
            'timestamp' => date('c')
        ]);
    }
}
