# Section Management API Documentation

## Overview
This document outlines the API endpoints required for the Section Management functionality in the SCMS (Student Course Management System) frontend.

## Base URL
```
http://localhost/scms_new/index.php/api
```

## Authentication
All endpoints require authentication using Bearer token in the Authorization header:
```
Authorization: Bearer {token}
```

## API Endpoints

### 1. Get All Sections
**GET** `/admin/sections`

**Query Parameters:**
- `course` (optional): Filter by course (e.g., "bsit", "bscs", "bsis", "act")
- `year` (optional): Filter by year (e.g., "1st Year", "2nd Year", "3rd Year", "4th Year")
- `academic_year` (optional): Filter by academic year (e.g., "2024-2025")
- `semester` (optional): Filter by semester (e.g., "1st Semester", "2nd Semester")

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "BSIT 3A",
      "course": "bsit",
      "year": "3rd Year",
      "adviserId": 101,
      "adviserDetails": {
        "id": 101,
        "name": "Mr. Cruz",
        "email": "cruz@dhvsu.edu.ph",
        "avatar": "path/to/avatar.jpg"
      },
      "enrolled": 9,
      "ay": "2024-2025",
      "semester": "1st Semester",
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### 2. Get Section by ID
**GET** `/admin/sections/{sectionId}`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "BSIT 3A",
    "course": "bsit",
    "year": "3rd Year",
    "adviserId": 101,
    "adviserDetails": {
      "id": 101,
      "name": "Mr. Cruz",
      "email": "cruz@dhvsu.edu.ph",
      "avatar": "path/to/avatar.jpg"
    },
    "enrolled": 9,
    "ay": "2024-2025",
    "semester": "1st Semester",
    "students": [
      {
        "id": 1,
        "name": "John Doe",
        "email": "2021305901@dhvsu.edu.ph",
        "status": "active"
      }
    ]
  }
}
```

### 3. Create Section
**POST** `/admin/sections`

**Request Body:**
```json
{
  "name": "BSIT 3C",
  "course": "bsit",
  "year": "3rd Year",
  "adviserId": 102,
  "ay": "2024-2025",
  "semester": "1st Semester",
  "students": [1, 2, 3] // Array of student IDs
}
```

**Response:**
```json
{
  "success": true,
  "message": "Section created successfully",
  "data": {
    "id": 4,
    "name": "BSIT 3C",
    "course": "bsit",
    "year": "3rd Year",
    "adviserId": 102,
    "enrolled": 3,
    "ay": "2024-2025",
    "semester": "1st Semester"
  }
}
```

### 4. Update Section
**PUT** `/admin/sections/{sectionId}`

**Request Body:**
```json
{
  "name": "BSIT 3A Updated",
  "course": "bsit",
  "year": "3rd Year",
  "adviserId": 103,
  "ay": "2024-2025",
  "semester": "1st Semester"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Section updated successfully",
  "data": {
    "id": 1,
    "name": "BSIT 3A Updated",
    "course": "bsit",
    "year": "3rd Year",
    "adviserId": 103,
    "enrolled": 9,
    "ay": "2024-2025",
    "semester": "1st Semester"
  }
}
```

### 5. Delete Section
**DELETE** `/admin/sections/{sectionId}`

**Response:**
```json
{
  "success": true,
  "message": "Section deleted successfully"
}
```

### 6. Get Section Students
**GET** `/admin/sections/{sectionId}/students`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "2021305901@dhvsu.edu.ph",
      "status": "active",
      "avatar": "path/to/avatar.jpg"
    }
  ]
}
```

### 7. Add Student to Section
**POST** `/admin/sections/{sectionId}/students`

**Request Body:**
```json
{
  "studentId": 5,
  "status": "active"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Student added to section successfully"
}
```

### 8. Remove Student from Section
**DELETE** `/admin/sections/{sectionId}/students/{studentId}`

**Response:**
```json
{
  "success": true,
  "message": "Student removed from section successfully"
}
```

### 9. Get Available Teachers
**GET** `/admin/teachers/available`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 101,
      "name": "Mr. Cruz",
      "email": "cruz@dhvsu.edu.ph",
      "avatar": "path/to/avatar.jpg",
      "role": "teacher",
      "status": "active"
    }
  ]
}
```

### 10. Get Available Students
**GET** `/admin/students/available`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "2021305901@dhvsu.edu.ph",
      "avatar": "path/to/avatar.jpg",
      "role": "student",
      "status": "active"
    }
  ]
}
```

### 11. Export Sections
**GET** `/admin/sections/export?format=csv`

**Query Parameters:**
- `format`: Export format (csv, xlsx, pdf)

**Response:**
Returns file download with sections data in the specified format.

### 12. Get Courses
**GET** `/admin/courses`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "bsit",
      "abbr": "BSIT",
      "name": "Info Tech"
    },
    {
      "id": "bscs",
      "abbr": "BSCS",
      "name": "Computer Science"
    }
  ]
}
```

### 13. Get Academic Years
**GET** `/admin/academic-years`

**Response:**
```json
{
  "success": true,
  "data": [
    "2023-2024",
    "2024-2025",
    "2025-2026"
  ]
}
```

### 14. Get Semesters
**GET** `/admin/semesters`

**Response:**
```json
{
  "success": true,
  "data": [
    "1st Semester",
    "2nd Semester",
    "Summer"
  ]
}
```

## Error Responses

### Authentication Error
```json
{
  "success": false,
  "message": "Authentication token not found. Please log in again.",
  "code": 401
}
```

### Validation Error
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "name": ["Section name is required"],
    "course": ["Course is required"]
  },
  "code": 422
}
```

### Not Found Error
```json
{
  "success": false,
  "message": "Section not found",
  "code": 404
}
```

### Server Error
```json
{
  "success": false,
  "message": "Internal server error",
  "code": 500
}
```

## Database Schema

### Sections Table
```sql
CREATE TABLE sections (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    course VARCHAR(20) NOT NULL,
    year VARCHAR(20) NOT NULL,
    adviser_id INT NOT NULL,
    enrolled INT DEFAULT 0,
    academic_year VARCHAR(20) NOT NULL,
    semester VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (adviser_id) REFERENCES users(id)
);
```

### Section Students Table
```sql
CREATE TABLE section_students (
    id INT PRIMARY KEY AUTO_INCREMENT,
    section_id INT NOT NULL,
    student_id INT NOT NULL,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (section_id) REFERENCES sections(id),
    FOREIGN KEY (student_id) REFERENCES users(id),
    UNIQUE KEY unique_section_student (section_id, student_id)
);
```

## Frontend Integration

### API Service Methods
The frontend uses the following API service methods:

```javascript
// Get all sections with optional filters
apiService.getSections()
apiService.getSectionsByCourse(course)
apiService.getSectionsByYear(year)
apiService.getSectionsByAcademicYear(academicYear)
apiService.getSectionsBySemester(semester)

// CRUD operations
apiService.getSectionById(sectionId)
apiService.createSection(sectionData)
apiService.updateSection(sectionId, sectionData)
apiService.deleteSection(sectionId)

// Student management
apiService.getSectionStudents(sectionId)
apiService.addStudentToSection(sectionId, studentData)
apiService.removeStudentFromSection(sectionId, studentId)

// Supporting data
apiService.getAvailableTeachers()
apiService.getAvailableStudents()
apiService.getCourses()
apiService.getAcademicYears()
apiService.getSemesters()

// Export
apiService.exportSections(format)
```

### State Management
The component manages the following state:

```javascript
const [sections, setSections] = useState([]);
const [teachers, setTeachers] = useState([]);
const [courses, setCourses] = useState([]);
const [students, setStudents] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);
const [sectionStudents, setSectionStudents] = useState([]);
const [loadingStudents, setLoadingStudents] = useState(false);
```

### Error Handling
The component includes comprehensive error handling:

1. **Loading States**: Shows spinners during API calls
2. **Error Display**: Shows error messages in alerts
3. **Network Errors**: Handles network failures gracefully
4. **Authentication Errors**: Redirects to login on token expiration
5. **Validation Errors**: Displays field-specific validation messages

### Data Flow
1. Component mounts → Load initial data (sections, teachers, courses, students)
2. User filters/searches → Filter local data
3. User clicks section → Load section students via API
4. User edits/deletes → Make API call → Update local state
5. User exports → Download file from API

## Security Considerations

1. **Authentication**: All endpoints require valid JWT token
2. **Authorization**: Only admin users can access section management
3. **Input Validation**: Server-side validation for all inputs
4. **SQL Injection**: Use prepared statements
5. **XSS Protection**: Sanitize all user inputs
6. **CSRF Protection**: Implement CSRF tokens for state-changing operations

## Performance Considerations

1. **Pagination**: Implement pagination for large datasets
2. **Caching**: Cache frequently accessed data (courses, teachers, students)
3. **Lazy Loading**: Load section students only when needed
4. **Optimistic Updates**: Update UI immediately, sync with server
5. **Debounced Search**: Implement search debouncing to reduce API calls

## Testing

### API Testing
Use tools like Postman or curl to test endpoints:

```bash
# Get all sections
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost/scms_new/index.php/api/admin/sections

# Create a section
curl -X POST \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"name":"BSIT 3D","course":"bsit","year":"3rd Year","adviserId":101,"ay":"2024-2025","semester":"1st Semester"}' \
     http://localhost/scms_new/index.php/api/admin/sections
```

### Frontend Testing
Test the component with different scenarios:

1. **Loading State**: Verify spinner appears during API calls
2. **Error State**: Verify error messages display correctly
3. **Empty State**: Verify empty state when no sections exist
4. **Filtering**: Test search and filter functionality
5. **CRUD Operations**: Test create, read, update, delete operations
6. **Responsive Design**: Test on different screen sizes

## Deployment

### Environment Variables
Set the following environment variables:

```env
API_BASE_URL=http://localhost/scms_new/index.php/api
JWT_SECRET=your_jwt_secret_here
DB_HOST=localhost
DB_NAME=scms_db
DB_USER=scms_user
DB_PASS=scms_password
```

### CORS Configuration
Ensure your backend allows requests from your frontend domain:

```php
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
```

This documentation provides a complete guide for implementing the Section Management API and connecting it with the frontend. The API endpoints are RESTful and follow standard conventions for data management.