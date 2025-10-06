# Backend Adviser Data Fix

## Problem
The frontend shows "No Adviser" and "No Email" even though adviser data exists in the database. The issue is that the backend API isn't properly joining the `sections` table with the `users` table to fetch adviser details including profile pictures.

## Solution
Update your `Admin` controller to properly join the tables and fetch adviser information including profile pictures from the user management system.

## Step 1: Update your Admin.php controller

Replace your current `sections_by_program` method with this optimized version:

```php
<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Admin extends BaseController {
    
    public function __construct() {
        parent::__construct();
        $this->load->database();
    }

    public function sections_by_program() {
        $program = $this->input->get('program');
        
        if (!$program) {
            return $this->send_error('Program parameter is required', 400);
        }

        try {
            // Join sections with users table to get adviser details including profile picture
            $sections = $this->db->select('
                s.section_id as id,
                s.section_name as name,
                s.program,
                s.year_level,
                s.adviser_id,
                s.semester,
                s.academic_year,
                s.enrolled_count,
                u.full_name as adviser_name,
                u.email as adviser_email,
                u.profile_picture as adviser_profile_picture,
                u.profile_pic as adviser_profile_pic
            ')
            ->from('sections s')
            ->join('users u', 's.adviser_id = u.user_id AND u.role = "teacher"', 'left')
            ->where('s.program', $program)
            ->get()
            ->result();

            // Transform the data to match frontend expectations
            $formattedSections = array_map(function($section) {
                // Use profile_picture if available, otherwise fallback to profile_pic
                $profilePicture = $section->adviser_profile_picture ?: $section->adviser_profile_pic;
                
                return [
                    'id' => $section->id,
                    'name' => $section->name,
                    'section_name' => $section->name,
                    'program' => $section->program,
                    'course' => $section->program,
                    'year_level' => $section->year_level,
                    'year' => $section->year_level,
                    'adviser_id' => $section->adviser_id,
                    'semester' => $section->semester,
                    'academic_year' => $section->academic_year,
                    'enrolled_count' => $section->enrolled_count,
                    'student_count' => $section->enrolled_count,
                    'enrolled' => $section->enrolled_count,
                    'adviserDetails' => [
                        'name' => $section->adviser_name ?: 'No Adviser',
                        'email' => $section->adviser_email ?: 'No Email',
                        'profile_picture' => $profilePicture ?: null
                    ],
                    'adviser_details' => [
                        'name' => $section->adviser_name ?: 'No Adviser',
                        'email' => $section->adviser_email ?: 'No Email',
                        'profile_picture' => $profilePicture ?: null
                    ]
                ];
            }, $sections);

            return $this->send_success($formattedSections, 'Sections retrieved successfully');

        } catch (Exception $e) {
            return $this->send_error('Failed to retrieve sections: ' . $e->getMessage(), 500);
        }
    }

    public function sections_by_program_year_specific() {
        $program = $this->input->get('program');
        $year_level = $this->input->get('year_level');
        
        if (!$program || !$year_level) {
            return $this->send_error('Program and year_level parameters are required', 400);
        }

        try {
            // Join sections with users table to get adviser details including profile picture
            $sections = $this->db->select('
                s.section_id as id,
                s.section_name as name,
                s.program,
                s.year_level,
                s.adviser_id,
                s.semester,
                s.academic_year,
                s.enrolled_count,
                u.full_name as adviser_name,
                u.email as adviser_email,
                u.profile_picture as adviser_profile_picture,
                u.profile_pic as adviser_profile_pic
            ')
            ->from('sections s')
            ->join('users u', 's.adviser_id = u.user_id AND u.role = "teacher"', 'left')
            ->where('s.program', $program)
            ->where('s.year_level', $year_level)
            ->get()
            ->result();

            // Transform the data to match frontend expectations
            $formattedSections = array_map(function($section) {
                // Use profile_picture if available, otherwise fallback to profile_pic
                $profilePicture = $section->adviser_profile_picture ?: $section->adviser_profile_pic;
                
                return [
                    'id' => $section->id,
                    'name' => $section->name,
                    'section_name' => $section->name,
                    'program' => $section->program,
                    'course' => $section->program,
                    'year_level' => $section->year_level,
                    'year' => $section->year_level,
                    'adviser_id' => $section->adviser_id,
                    'semester' => $section->semester,
                    'academic_year' => $section->academic_year,
                    'enrolled_count' => $section->enrolled_count,
                    'student_count' => $section->enrolled_count,
                    'enrolled' => $section->enrolled_count,
                    'adviserDetails' => [
                        'name' => $section->adviser_name ?: 'No Adviser',
                        'email' => $section->adviser_email ?: 'No Email',
                        'profile_picture' => $profilePicture ?: null
                    ],
                    'adviser_details' => [
                        'name' => $section->adviser_name ?: 'No Adviser',
                        'email' => $section->adviser_email ?: 'No Email',
                        'profile_picture' => $profilePicture ?: null
                    ]
                ];
            }, $sections);

            return $this->send_success($formattedSections, 'Sections retrieved successfully');

        } catch (Exception $e) {
            return $this->send_error('Failed to retrieve sections: ' . $e->getMessage(), 500);
        }
    }

    // Add other methods as needed...
}
?>
```

## Step 2: Verify your database structure

Make sure your tables have the correct column names:

**sections table:**
- `section_id` (primary key)
- `section_name`
- `program`
- `year_level`
- `adviser_id` (foreign key to users.user_id)
- `semester`
- `academic_year`
- `enrolled_count`

**users table:**
- `user_id` (primary key)
- `full_name`
- `email`
- `role` (should be "teacher" for advisers)
- `profile_picture` OR `profile_pic` (the profile picture field - supports both naming conventions)

## Step 3: Test the API

After updating your backend, test the API directly:

1. **Test BSIT sections:**
   ```
   GET http://localhost/scms_new/index.php/api/admin/sections_by_program?program=BSIT
   ```

2. **Test specific year:**
   ```
   GET http://localhost/scms_new/index.php/api/admin/sections_by_program_year_specific?program=BSIT&year_level=1st
   ```

## Expected Response Format

The API should now return data like this:

```json
{
  "status": true,
  "message": "Sections retrieved successfully",
  "data": [
    {
      "id": "1",
      "name": "A",
      "section_name": "A",
      "program": "BSIT",
      "course": "BSIT",
      "year_level": "1st",
      "year": "1st",
      "adviser_id": "TEA686420F2B5687155",
      "semester": "1st",
      "academic_year": "2024-2025",
      "enrolled_count": 25,
      "student_count": 25,
      "enrolled": 25,
      "adviserDetails": {
        "name": "Rose Valencia",
        "email": "flower@example.com",
        "profile_picture": "uploads/profile_pictures/rose_valencia.jpg"
      },
      "adviser_details": {
        "name": "Rose Valencia",
        "email": "flower@example.com",
        "profile_picture": "uploads/profile_pictures/rose_valencia.jpg"
      }
    }
  ]
}
```

## Step 4: Frontend Already Handles Profile Pictures

The frontend in `SectionManagement.js` is already set up to display profile pictures. It checks for `section.adviserDetails.profile_picture` and displays either the image or a fallback avatar with initials.

## Step 5: Database Query to Verify Data

Run this query to verify that adviser data exists and has profile pictures:

```sql
SELECT 
    s.section_id,
    s.section_name,
    s.program,
    s.adviser_id,
    u.full_name as adviser_name,
    u.email as adviser_email,
    u.profile_picture,
    u.profile_pic,
    u.role
FROM sections s
LEFT JOIN users u ON s.adviser_id = u.user_id AND u.role = 'teacher'
WHERE s.program = 'BSIT'
ORDER BY s.section_name;
```

## Troubleshooting

1. **Check if profile picture fields exist in users table:**
   ```sql
   SELECT user_id, full_name, email, profile_picture, profile_pic, role
   FROM users
   WHERE role = 'teacher';
   ```

2. **Verify the profile picture path is correct:**
   - Make sure the profile pictures are stored in a web-accessible directory
   - The path should be relative to your backend root (e.g., `uploads/profile_pictures/`)

3. **Check for CORS issues** - Make sure your BaseController is properly handling CORS headers.

4. **Test the API response directly** to ensure the data structure matches what the frontend expects.

## Performance Optimization

The updated backend code:
- Uses LEFT JOIN to include sections even if they don't have advisers
- Fetches both `profile_picture` and `profile_pic` fields for compatibility
- Returns data in the exact format expected by the frontend
- Handles null values gracefully with fallbacks

After implementing these changes, the frontend should display the actual adviser profile pictures instead of generic avatars, making the section management interface more informative and visually appealing.