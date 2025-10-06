# CORS Setup Guide for SCMS Backend

## Problem
You're getting CORS errors when trying to access your API from the React frontend:
```
Access to XMLHttpRequest at 'http://localhost/scms_new/index.php/api/admin/students/available' from origin 'http://localhost:3000' has been blocked by CORS policy
```

## Solution

### 1. Add CORS Headers to Your PHP Backend

Add these headers to your main API file (likely `index.php` or wherever your API routes are handled):

```php
<?php
// Add these headers at the very beginning of your API file
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Credentials: true");

// Handle preflight OPTIONS requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Your existing API code here...
?>
```

### 2. Alternative: Add to .htaccess (if using Apache)

If you're using Apache, you can add CORS headers to your `.htaccess` file:

```apache
# Add to your .htaccess file
<IfModule mod_headers.c>
    Header always set Access-Control-Allow-Origin "http://localhost:3000"
    Header always set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
    Header always set Access-Control-Allow-Headers "Content-Type, Authorization, X-Requested-With"
    Header always set Access-Control-Allow-Credentials "true"
    
    # Handle preflight requests
    RewriteEngine On
    RewriteCond %{REQUEST_METHOD} OPTIONS
    RewriteRule ^(.*)$ $1 [R=200,L]
</IfModule>
```

### 3. For Production (Multiple Origins)

If you need to support multiple origins, you can do this:

```php
<?php
// Get the origin from the request
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

// Define allowed origins
$allowed_origins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://yourdomain.com'
];

// Check if origin is allowed
if (in_array($origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: $origin");
}

header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Credentials: true");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}
?>
```

### 4. Test Your CORS Setup

You can test if CORS is working by running this in your browser console:

```javascript
fetch('http://localhost/scms_new/index.php/api/admin/sections_by_program?program=BSIT', {
    method: 'GET',
    headers: {
        'Authorization': 'Bearer YOUR_TOKEN_HERE',
        'Content-Type': 'application/json'
    }
})
.then(response => response.json())
.then(data => console.log('Success:', data))
.catch(error => console.error('Error:', error));
```

### 5. Common Issues and Solutions

#### Issue: Still getting CORS errors
**Solution:** Make sure the headers are added before any output is sent to the browser.

#### Issue: Authorization header not working
**Solution:** Make sure `Authorization` is included in `Access-Control-Allow-Headers`.

#### Issue: Cookies not being sent
**Solution:** Make sure `Access-Control-Allow-Credentials: true` is set.

### 6. Development vs Production

For development, you can be more permissive:

```php
// Development - Allow all origins (NOT for production)
header("Access-Control-Allow-Origin: *");
```

For production, be specific:

```php
// Production - Only allow your specific domain
header("Access-Control-Allow-Origin: https://yourdomain.com");
```

### 7. Complete Example

Here's a complete example of how your API file should look:

```php
<?php
// CORS Headers
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Credentials: true");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Your existing API logic here
require_once 'config/database.php';
require_once 'config/auth.php';

// Your API routes
$request_uri = $_SERVER['REQUEST_URI'];
$path = parse_url($request_uri, PHP_URL_PATH);

// Route handling
if (strpos($path, '/api/admin/sections_by_program') !== false) {
    // Handle sections by program
    $program = $_GET['program'] ?? '';
    // Your existing logic here
}

// ... rest of your API code
?>
```

After implementing these CORS headers, your React frontend should be able to communicate with your PHP backend without CORS errors.

## Testing the Fix

1. Add the CORS headers to your backend
2. Restart your web server if necessary
3. Try accessing your React app again
4. Check the browser console for any remaining CORS errors

The frontend should now be able to successfully call your API endpoints like:
- `http://localhost/scms_new/index.php/api/admin/sections_by_program?program=BSIT`
- `http://localhost/scms_new/index.php/api/admin/sections_by_program_year_specific?program=BSIT&year_level=1st`