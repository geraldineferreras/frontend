# Backend CORS Fix - Step by Step Guide

## Current Issue
Your React frontend (running on `http://localhost:3000`) cannot access your PHP backend (running on `http://localhost/scms_new/index.php/api`) due to CORS policy restrictions.

## Step 1: Locate Your API File

First, find your main API file. It's likely one of these:
- `scms_new/index.php`
- `scms_new/api/index.php`
- `scms_new/api/admin/index.php`

## Step 2: Add CORS Headers

Add these lines at the **very beginning** of your API file (before any other code):

```php
<?php
// CORS Headers - ADD THESE AT THE VERY TOP
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Credentials: true");

// Handle preflight OPTIONS requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Your existing API code starts here...
?>
```

## Step 3: Alternative - Add to .htaccess

If you can't modify the PHP file, create or edit `.htaccess` in your `scms_new` folder:

```apache
# Add to .htaccess file in scms_new folder
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

## Step 4: Test the Fix

### Test 1: Direct Browser Test
Open your browser and go to:
```
http://localhost/scms_new/index.php/api/admin/sections_by_program?program=BSIT
```

You should see JSON data (not a CORS error).

### Test 2: Browser Console Test
Open your React app and run this in the browser console:

```javascript
fetch('http://localhost/scms_new/index.php/api/admin/sections_by_program?program=BSIT', {
    method: 'GET',
    headers: {
        'Content-Type': 'application/json'
    }
})
.then(response => response.json())
.then(data => console.log('Success:', data))
.catch(error => console.error('Error:', error));
```

## Step 5: Common Issues & Solutions

### Issue 1: Headers not being sent
**Solution:** Make sure the headers are added before ANY output (including whitespace or HTML).

### Issue 2: Still getting CORS errors
**Solution:** Check if your server supports headers. Try this test:

```php
<?php
// Test file: test_cors.php
header("Access-Control-Allow-Origin: http://localhost:3000");
echo "CORS headers working!";
?>
```

### Issue 3: Apache mod_headers not enabled
**Solution:** Enable mod_headers in Apache:
```bash
sudo a2enmod headers
sudo service apache2 restart
```

## Step 6: Complete Example

Here's how your API file should look:

```php
<?php
// CORS Headers - MUST BE FIRST
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Credentials: true");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Your existing includes
require_once 'config/database.php';
require_once 'config/auth.php';

// Your API routing logic
$request_uri = $_SERVER['REQUEST_URI'];
$path = parse_url($request_uri, PHP_URL_PATH);

// Handle your existing endpoints
if (strpos($path, '/api/admin/sections_by_program') !== false) {
    $program = $_GET['program'] ?? '';
    
    // Your existing logic for sections_by_program
    // ...
    
    // Return JSON response
    header('Content-Type: application/json');
    echo json_encode($response);
}

if (strpos($path, '/api/admin/sections_by_program_year_specific') !== false) {
    $program = $_GET['program'] ?? '';
    $year_level = $_GET['year_level'] ?? '';
    
    // Your existing logic for sections_by_program_year_specific
    // ...
    
    // Return JSON response
    header('Content-Type: application/json');
    echo json_encode($response);
}

// ... rest of your API code
?>
```

## Step 7: Verify the Fix

After making these changes:

1. **Restart your web server** (Apache/XAMPP/WAMP)
2. **Clear your browser cache**
3. **Test the API directly** in browser
4. **Test from React app**

## Step 8: Production Considerations

For production, replace the CORS origin with your actual domain:

```php
// Development
header("Access-Control-Allow-Origin: http://localhost:3000");

// Production
header("Access-Control-Allow-Origin: https://yourdomain.com");
```

## Troubleshooting Checklist

- [ ] CORS headers added at the very top of PHP file
- [ ] No whitespace or output before headers
- [ ] Web server restarted
- [ ] Browser cache cleared
- [ ] Direct API test works
- [ ] React app can access API

## Quick Test Commands

Test your API directly:
```bash
curl "http://localhost/scms_new/index.php/api/admin/sections_by_program?program=BSIT"
```

Test with headers:
```bash
curl -H "Origin: http://localhost:3000" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     "http://localhost/scms_new/index.php/api/admin/sections_by_program?program=BSIT"
```

Once you've implemented these CORS headers, your React frontend should be able to communicate with your PHP backend without any CORS errors.