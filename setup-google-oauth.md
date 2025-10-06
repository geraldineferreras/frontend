# Quick Setup Guide for Google OAuth

## Step 1: Install Dependencies (✅ Already Done)
The required dependencies have been installed:
- `@google-cloud/local-auth`
- `google-auth-library`
- `react-google-login`

## Step 2: Get Google OAuth Credentials

1. **Go to Google Cloud Console**: https://console.cloud.google.com/
2. **Create a project** or select existing one
3. **Enable APIs**:
   - Google+ API
   - Google Identity Toolkit API (if available)
4. **Create OAuth 2.0 Credentials**:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client ID"
   - Application type: "Web application"
   - Authorized JavaScript origins:
     - `http://localhost:3000`
     - Your production domain
   - Authorized redirect URIs:
     - `http://localhost:3000`
     - Your production domain

## Step 3: Configure Environment Variables

1. **Copy the example environment file**:
   ```bash
   cp env.example .env
   ```

2. **Update your `.env` file**:
   ```env
   REACT_APP_API_BASE_URL=http://localhost/scms_new_backup/index.php/api
   REACT_APP_GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID_HERE
   ```
   
   **✅ Your Google Client ID is already configured in `env.example`**

## Step 4: Backend Implementation

You need to implement the `/auth/google` endpoint in your backend. See `GOOGLE_OAUTH_IMPLEMENTATION.md` for detailed backend code examples.

### Quick PHP Implementation (CodeIgniter):

```php
public function google() {
    header("Access-Control-Allow-Origin: http://localhost:3000");
    header("Access-Control-Allow-Methods: POST, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization");
    
    if ($this->input->method() === 'options') return;
    
    $json = json_decode(file_get_contents('php://input'), true);
    
    // Extract user data
    $email = $json['email'] ?? '';
    $name = $json['name'] ?? '';
    
    // Check if user exists or create new user
    // Generate JWT token
    // Return response with token and user data
    
    $this->output
        ->set_content_type('application/json')
        ->set_output(json_encode([
            'status' => true,
            'data' => [
                'token' => $jwt_token,
                'user' => $user_data
            ]
        ]));
}
```

## Step 5: Test the Implementation

1. **Start your development server**:
   ```bash
   npm start
   ```

2. **Navigate to**: http://localhost:3000/auth/login

3. **Click "Sign in with Google"** and test the OAuth flow

## Features Ready to Use:

✅ **Login Page**: `src/views/examples/Login.js`
- Google OAuth button integrated
- Automatic role-based redirection
- Error handling

✅ **Register Page**: `src/views/examples/Register.js`  
- Google OAuth registration
- Automatic user creation
- Success feedback

✅ **Reusable Component**: `src/components/GoogleOAuthButton.jsx`
- Loading states
- Error handling
- Consistent styling

✅ **Authentication Context**: Enhanced with Google OAuth support

✅ **API Service**: Ready for backend integration

## Need Help?

- Check `GOOGLE_OAUTH_IMPLEMENTATION.md` for detailed implementation guide
- Verify your Google Cloud Console settings
- Ensure your backend API endpoint `/auth/google` is implemented
- Check browser console for any errors

## Security Notes:

- Always verify Google ID tokens on the server side
- Use HTTPS in production
- Configure proper CORS settings
- Implement rate limiting for auth endpoints
