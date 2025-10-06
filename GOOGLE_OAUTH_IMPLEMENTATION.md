# Google OAuth Implementation Guide for SCMS

This guide provides a complete implementation of Google OAuth authentication for both sign-in and sign-up functionality in the SCMS (Student Class Management System).

## Frontend Implementation

### ✅ Completed Features

1. **Google OAuth Service** (`src/services/googleAuth.js`)
   - Handles Google API initialization
   - Manages sign-in/sign-out flow
   - Extracts user data from Google response
   - Token verification support

2. **Enhanced Auth Context** (`src/contexts/AuthContext.js`)
   - Added `loginWithGoogle()` method
   - Integrated with existing authentication flow
   - Automatic token storage and user management

3. **API Service Integration** (`src/services/api.js`)
   - Added `googleAuth()` method for backend communication
   - Handles Google user data transmission

4. **Google OAuth Button Component** (`src/components/GoogleOAuthButton.jsx`)
   - Reusable component for sign-in/sign-up
   - Loading states and error handling
   - Consistent styling with existing UI

5. **Updated Login Page** (`src/views/examples/Login.js`)
   - Integrated Google OAuth button
   - Role-based navigation after successful login

6. **Updated Register Page** (`src/views/examples/Register.js`)
   - Integrated Google OAuth button
   - Automatic registration via Google

## Setup Instructions

### 1. Environment Configuration

Create a `.env` file in your project root (or copy from `env.example`):

```env
# API Configuration
REACT_APP_API_BASE_URL=http://localhost/scms_new_backup/index.php/api

# Google OAuth Configuration
REACT_APP_GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID_HERE
```

**✅ Your Google Client ID has been configured in `env.example`**

### 2. Google Cloud Console Setup

1. **Create a Google Cloud Project**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one

2. **Enable Google+ API**
   - Navigate to "APIs & Services" > "Library"
   - Search for "Google+ API" and enable it
   - Also enable "Google Identity" if available

3. **Create OAuth 2.0 Credentials**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client ID"
   - Choose "Web application"
   - Add authorized origins:
     - `http://localhost:3000` (development)
     - `https://yourdomain.com` (production)
   - Add authorized redirect URIs:
     - `http://localhost:3000` (development)
     - `https://yourdomain.com` (production)

4. **Copy Client ID**
   - Copy the generated Client ID
   - Add it to your `.env` file as `REACT_APP_GOOGLE_CLIENT_ID`

## Backend Implementation Required

### API Endpoint: `/auth/google`

Create a new endpoint in your backend to handle Google OAuth authentication:

#### PHP (CodeIgniter) Implementation

```php
<?php
// In your Auth controller (e.g., application/controllers/Auth.php)

public function google() {
    // Set CORS headers
    header("Access-Control-Allow-Origin: http://localhost:3000");
    header("Access-Control-Allow-Methods: POST, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization");
    
    if ($this->input->method() === 'options') {
        return;
    }
    
    $json = json_decode(file_get_contents('php://input'), true);
    
    try {
        // Get Google user data from request
        $idToken = $json['idToken'] ?? '';
        $email = $json['email'] ?? '';
        $name = $json['name'] ?? '';
        $firstName = $json['firstName'] ?? '';
        $lastName = $json['lastName'] ?? '';
        $imageUrl = $json['imageUrl'] ?? '';
        
        // Verify Google ID token (recommended for security)
        if (!$this->verifyGoogleToken($idToken)) {
            $this->output
                ->set_content_type('application/json')
                ->set_output(json_encode([
                    'status' => false,
                    'message' => 'Invalid Google token'
                ]));
            return;
        }
        
        // Check if user exists
        $existingUser = $this->User_model->get_user_by_email($email);
        
        if ($existingUser) {
            // User exists - log them in
            $userData = $existingUser;
        } else {
            // User doesn't exist - create new account
            $userData = [
                'full_name' => $name,
                'email' => $email,
                'first_name' => $firstName,
                'last_name' => $lastName,
                'profile_image' => $imageUrl,
                'role' => 'student', // Default role, or implement role selection
                'auth_provider' => 'google',
                'google_id' => $json['id'] ?? '',
                'status' => 'active',
                'created_at' => date('Y-m-d H:i:s')
            ];
            
            $userId = $this->User_model->create_user($userData);
            $userData['id'] = $userId;
        }
        
        // Generate JWT token
        $token = $this->generateJWT($userData);
        
        $this->output
            ->set_content_type('application/json')
            ->set_output(json_encode([
                'status' => true,
                'message' => 'Authentication successful',
                'data' => [
                    'token' => $token,
                    'user' => $userData
                ]
            ]));
            
    } catch (Exception $e) {
        $this->output
            ->set_content_type('application/json')
            ->set_output(json_encode([
                'status' => false,
                'message' => 'Authentication failed: ' . $e->getMessage()
            ]));
    }
}

private function verifyGoogleToken($idToken) {
    // Use Google's PHP library to verify the token
    // Install: composer require google/apiclient
    
    require_once APPPATH . 'vendor/autoload.php';
    
    $client = new Google_Client(['client_id' => 'YOUR_GOOGLE_CLIENT_ID']);
    
    try {
        $payload = $client->verifyIdToken($idToken);
        return $payload !== false;
    } catch (Exception $e) {
        return false;
    }
}

private function generateJWT($userData) {
    // Implement JWT generation
    // You can use libraries like firebase/php-jwt
    
    $key = "your-secret-key";
    $payload = [
        'iss' => 'scms-app',
        'sub' => $userData['id'],
        'iat' => time(),
        'exp' => time() + (24 * 60 * 60), // 24 hours
        'data' => [
            'id' => $userData['id'],
            'email' => $userData['email'],
            'role' => $userData['role']
        ]
    ];
    
    return JWT::encode($payload, $key, 'HS256');
}
```

#### Database Schema Updates

Add these fields to your users table:

```sql
ALTER TABLE users ADD COLUMN auth_provider VARCHAR(50) DEFAULT 'local';
ALTER TABLE users ADD COLUMN google_id VARCHAR(255) NULL;
ALTER TABLE users ADD COLUMN profile_image TEXT NULL;
ALTER TABLE users ADD COLUMN first_name VARCHAR(100) NULL;
ALTER TABLE users ADD COLUMN last_name VARCHAR(100) NULL;
```

### Node.js/Express Implementation (Alternative)

```javascript
const express = require('express');
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');

const router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

router.post('/auth/google', async (req, res) => {
    try {
        const { idToken, email, name, firstName, lastName, imageUrl } = req.body;
        
        // Verify Google token
        const ticket = await client.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        
        const payload = ticket.getPayload();
        
        if (!payload || payload.email !== email) {
            return res.status(400).json({
                status: false,
                message: 'Invalid Google token'
            });
        }
        
        // Check if user exists or create new user
        let user = await User.findOne({ email });
        
        if (!user) {
            user = await User.create({
                fullName: name,
                email,
                firstName,
                lastName,
                profileImage: imageUrl,
                role: 'student',
                authProvider: 'google',
                googleId: payload.sub,
                status: 'active'
            });
        }
        
        // Generate JWT
        const token = jwt.sign(
            { 
                id: user._id, 
                email: user.email, 
                role: user.role 
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        res.json({
            status: true,
            message: 'Authentication successful',
            data: {
                token,
                user: {
                    id: user._id,
                    email: user.email,
                    fullName: user.fullName,
                    role: user.role,
                    profileImage: user.profileImage
                }
            }
        });
        
    } catch (error) {
        console.error('Google auth error:', error);
        res.status(500).json({
            status: false,
            message: 'Authentication failed'
        });
    }
});
```

## Security Considerations

1. **Token Verification**: Always verify Google ID tokens on the server side
2. **CORS Configuration**: Properly configure CORS for your domain
3. **Rate Limiting**: Implement rate limiting for authentication endpoints
4. **User Validation**: Validate and sanitize all user data from Google
5. **Role Management**: Implement proper role assignment logic

## Testing

1. **Set up environment variables**
2. **Start your development server**: `npm start`
3. **Navigate to login/register pages**
4. **Click "Sign in with Google" or "Sign up with Google"**
5. **Complete Google OAuth flow**
6. **Verify successful authentication and redirection**

## Production Deployment

1. **Update environment variables** with production values
2. **Configure Google OAuth** for production domain
3. **Update CORS settings** in backend
4. **Test OAuth flow** in production environment

## Common Issues & Solutions

### Issue: "redirect_uri_mismatch"
- **Solution**: Ensure redirect URIs in Google Console match your application URLs

### Issue: "Invalid client_id"
- **Solution**: Verify the client ID in your environment variables

### Issue: CORS errors
- **Solution**: Configure proper CORS headers in your backend API

### Issue: Google sign-in popup blocked
- **Solution**: Ensure popups are allowed for your domain

## Features Implemented

✅ Google OAuth sign-in for existing users  
✅ Google OAuth sign-up for new users  
✅ Automatic user creation from Google profile  
✅ JWT token generation and management  
✅ Role-based redirection after authentication  
✅ Error handling and user feedback  
✅ Integration with existing authentication system  
✅ Responsive design and loading states  

## Next Steps

1. Implement the backend `/auth/google` endpoint
2. Set up Google Cloud Console OAuth credentials
3. Configure environment variables
4. Test the complete OAuth flow
5. Deploy to production with proper security configurations

For support or questions, refer to:
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google Sign-In for Websites](https://developers.google.com/identity/sign-in/web)
- [Google API Console](https://console.developers.google.com/)
