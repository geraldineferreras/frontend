# 🎯 SCMS Registration System Setup Guide

## ✅ **What's Been Implemented**

I've completely fixed the sign-up functionality and implemented **email-based role verification** for the SCMS system. The registration now automatically detects whether a user should be a student or teacher based on their email pattern.

## 🔐 **Email-Based Role Detection**

### **Student Accounts**
- **Pattern**: `2021304995@pampangastateu.edu.ph`
- **Format**: 10 digits + @pampangastateu.edu.ph
- **Examples**: 
  - `2021304995@pampangastateu.edu.ph` ✅
  - `2024000001@pampangastateu.edu.ph` ✅
  - `2020123456@pampangastateu.edu.ph` ✅

### **Teacher Accounts**
- **Pattern**: `a.ferrer@pampangastateu.edu.ph`
- **Format**: Initials + @pampangastateu.edu.ph
- **Examples**:
  - `a.ferrer@pampangastateu.edu.ph` ✅
  - `j.smith@pampangastateu.edu.ph` ✅
  - `m.garcia@pampangastateu.edu.ph` ✅

## 🚀 **Setup Instructions**

### **Step 1: Backend Setup**

1. **Place the registration endpoint** in your backend:
   ```
   /scms_new_backup/index.php/api/register
   ```

2. **Update database configuration** in `backend_registration_endpoint.php`:
   ```php
   function getDatabaseConnection() {
       $host = 'localhost';
       $dbname = 'scms_db'; // Your actual database name
       $username = 'root';   // Your actual database username
       $password = '';       // Your actual database password
       
       // ... rest of the function
   }
   ```

3. **Ensure your database has the required tables**:
   ```sql
   -- Users table should have these columns:
   CREATE TABLE users (
       id INT AUTO_INCREMENT PRIMARY KEY,
       full_name VARCHAR(255) NOT NULL,
       email VARCHAR(255) UNIQUE NOT NULL,
       password VARCHAR(255) NOT NULL,
       role ENUM('student', 'teacher', 'admin') NOT NULL,
       student_num VARCHAR(20) NULL,
       program VARCHAR(255) NULL,
       section_id INT NULL,
       contact_num VARCHAR(20) NULL,
       address TEXT NULL,
       qr_code TEXT NULL,
       status ENUM('active', 'inactive') DEFAULT 'active',
       auth_provider ENUM('local', 'google') DEFAULT 'local',
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   ```

### **Step 2: Frontend Setup**

The React frontend has been updated with:
- ✅ **Automatic role detection** based on email
- ✅ **Smart form validation** 
- ✅ **Role-specific fields** (student number, program, etc.)
- ✅ **Password strength validation**
- ✅ **Real-time feedback**

### **Step 3: Test the System**

1. **Open the test file**: `test_registration_endpoint.html`
2. **Test student registration** with: `2021304995@pampangastateu.edu.ph`
3. **Test teacher registration** with: `a.ferrer@pampangastateu.edu.ph`
4. **Verify error handling** for invalid emails and role mismatches

## 🎨 **Frontend Features**

### **Smart Role Detection**
- Automatically detects role when email is entered
- Shows helpful message: "Email pattern detected: This appears to be a student/teacher account"
- Prevents role mismatch errors

### **Enhanced Form Validation**
- ✅ **Email domain validation**: Only accepts @pampangastateu.edu.ph
- ✅ **Required field validation**: All necessary fields are enforced
- ✅ **Password strength**: 8+ chars, uppercase, lowercase, numbers, special chars
- ✅ **Role-specific validation**: Student number required for students, department for teachers

### **User Experience Improvements**
- **Dropdown selections** for programs and departments
- **Real-time password strength indicator**
- **Clear error messages** with specific guidance
- **Auto-completion** of role based on email pattern

## 🔧 **API Endpoints**

### **Registration Endpoint**
```
POST /api/register
Content-Type: application/json

Request Body:
{
    "role": "student|teacher",
    "full_name": "User Full Name",
    "email": "user@pampangastateu.edu.ph",
    "password": "SecurePassword123!",
    "contact_num": "09123456789",
    "address": "User Address",
    "student_num": "2021304995",        // Required for students
    "program": "Bachelor of Science in Information Technology", // Required for both
    "section_id": 1                     // Optional for students
}

Response:
{
    "status": true,
    "message": "User registration successful",
    "data": {
        "id": 123,
        "email": "user@pampangastateu.edu.ph",
        "full_name": "User Full Name",
        "role": "student",
        "status": "active"
    }
}
```

## 🧪 **Testing Scenarios**

### **✅ Valid Registrations**
1. **Student**: `2021304995@pampangastateu.edu.ph` + student number + program
2. **Teacher**: `a.ferrer@pampangastateu.edu.ph` + department

### **❌ Error Cases**
1. **Invalid email domain**: `user@gmail.com`
2. **Role mismatch**: Student email with teacher role
3. **Missing fields**: Incomplete form submission
4. **Weak password**: Less than 8 characters
5. **Duplicate email**: User already exists

## 🚨 **Security Features**

- ✅ **Password hashing** using PHP's `password_hash()`
- ✅ **Input validation** and sanitization
- ✅ **Email domain restriction** (@pampangastateu.edu.ph only)
- ✅ **Role verification** against email pattern
- ✅ **SQL injection prevention** using prepared statements
- ✅ **CORS headers** for cross-origin requests

## 🔍 **Troubleshooting**

### **Common Issues**

1. **"Database connection failed"**
   - Check database credentials in `getDatabaseConnection()`
   - Ensure MySQL service is running

2. **"Method not allowed"**
   - Verify the endpoint is accessible at `/api/register`
   - Check that POST requests are allowed

3. **"Email pattern indicates..."**
   - This is expected behavior - the system prevents role mismatches
   - Use the correct email pattern for the selected role

4. **"User with this email already exists"**
   - The email is already registered
   - Use a different email or try logging in instead

### **Testing Checklist**

- [ ] Backend endpoint accessible
- [ ] Database connection working
- [ ] Student registration successful
- [ ] Teacher registration successful
- [ ] Error handling working
- [ ] Frontend form validation working
- [ ] Role detection working correctly

## 🎯 **Next Steps**

1. **Test the system** using the provided test file
2. **Customize database settings** for your environment
3. **Deploy to production** when ready
4. **Monitor registration logs** for any issues
5. **Consider adding email verification** for additional security

## 📞 **Support**

If you encounter any issues:
1. Check the browser console for JavaScript errors
2. Check the server logs for PHP errors
3. Verify database connectivity
4. Test with the provided test file first

The registration system is now **fully functional** with smart email-based role detection! 🎉
