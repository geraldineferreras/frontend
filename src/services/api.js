import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost/scms_new_backup/index.php/api';

class ApiService {
  // Helper method to validate token presence
  validateToken() {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication token not found. Please log in again.');
    }
    return token;
  }

  // Helper method for making requests
  async makeRequest(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const { method = 'GET', headers = {}, body, requireAuth = false } = options;
    
    // Get token from localStorage if authentication is required
    let authHeaders = { ...headers };
    if (requireAuth) {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found. Please log in again.');
      }
      authHeaders['Authorization'] = `Bearer ${token}`;
    }
    
    const config = {
      url,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
      },
    };
    
    // Handle body data properly
    if (body) {
      // Check if body is FormData
      if (body instanceof FormData) {
        config.data = body;
        // Remove Content-Type header for FormData to let browser set it with boundary
        delete config.headers['Content-Type'];
      } else {
        // Parse JSON string to object
        config.data = JSON.parse(body);
      }
    }
    
    try {
      const response = await axios(config);
      return response.data;
    } catch (error) {
      // Axios error handling
      const message = error.response?.data?.message || error.message || 'API Error';
      console.error(`API Error (${endpoint}):`, message);
      // Token/session expiration handling
      if (
        message.toLowerCase().includes('token expired') ||
        message.toLowerCase().includes('unauthorized') ||
        error.response?.status === 401
      ) {
        // Dispatch a custom event for session timeout
        window.dispatchEvent(new CustomEvent('sessionTimeout'));
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('scms_logged_in_user');
        // Do not redirect here; let the modal handle it
        return;
      }
      throw new Error(message);
    }
  }

  // Generic HTTP methods
  async get(endpoint, requireAuth = true) {
    return this.makeRequest(endpoint, { method: 'GET', requireAuth });
  }

  async post(endpoint, data, requireAuth = true) {
    return this.makeRequest(endpoint, { 
      method: 'POST', 
      body: typeof data === 'string' ? data : JSON.stringify(data), 
      requireAuth 
    });
  }

  async put(endpoint, data, requireAuth = true) {
    return this.makeRequest(endpoint, { 
      method: 'PUT', 
      body: typeof data === 'string' ? data : JSON.stringify(data), 
      requireAuth 
    });
  }

  async delete(endpoint, requireAuth = true) {
    return this.makeRequest(endpoint, { method: 'DELETE', requireAuth });
  }

  // Authentication methods
  async login(email, password) {
    return this.makeRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(userData) {

    
    return this.makeRequest('/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async registerWithImages(formData) {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication token not found. Please log in again.');
    }
    
    try {
      const response = await axios.post(`${API_BASE}/register`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Registration failed';
      console.error('Registration with images error:', message);
      throw new Error(message);
    }
  }

  async logout() {
    return this.makeRequest('/auth/logout', {
      method: 'POST',
      requireAuth: true,
    });
  }

  // Authenticated requests
  async getProfile() {
    return this.makeRequest('/user', {
      method: 'GET',
      requireAuth: true,
    });
  }

  async updateProfile(userData) {
    return this.makeRequest('/user', {
      method: 'PUT',
      body: JSON.stringify(userData),
      requireAuth: true,
    });
  }

  // Section Management API endpoints - Individual methods for each program
  async getSectionsBSIT() {
    return this.makeRequest(`/admin/sections_by_program?program=${encodeURIComponent('Bachelor of Science in Information Technology')}`, {
      method: 'GET',
      requireAuth: true,
    });
  }

  async getSectionsBSCS() {
    return this.makeRequest(`/admin/sections_by_program?program=${encodeURIComponent('Bachelor of Science in Computer Science')}`, {
      method: 'GET',
      requireAuth: true,
    });
  }

  async getSectionsBSIS() {
    return this.makeRequest(`/admin/sections_by_program?program=${encodeURIComponent('Bachelor of Science in Information Systems')}`, {
      method: 'GET',
      requireAuth: true,
    });
  }

  async getSectionsACT() {
    return this.makeRequest(`/admin/sections_by_program?program=${encodeURIComponent('Associate in Computer Technology')}`, {
      method: 'GET',
      requireAuth: true,
    });
  }

  async getSectionsByProgram(program) {
    return this.makeRequest(`/admin/sections_by_program?program=${encodeURIComponent(program)}`, {
      method: 'GET',
      requireAuth: true,
    });
  }

  async getSectionsByProgramAndYear(program, yearLevel) {
    return this.makeRequest(`/admin/sections_by_program_year_specific?program=${encodeURIComponent(program)}&year_level=${yearLevel}`, {
      method: 'GET',
      requireAuth: true,
    });
  }

  async getSectionsByCourse(course) {
    // Map course IDs to full program names to match database
    const programMap = {
      'bsit': 'Bachelor of Science in Information Technology',
      'bscs': 'Bachelor of Science in Computer Science', 
      'bsis': 'Bachelor of Science in Information Systems',
      'act': 'Associate in Computer Technology'
    };
    const program = programMap[course] || 'Bachelor of Science in Information Technology';
    console.log(`Getting sections for course: ${course} -> program: ${program}`);
    
    try {
      // First try to get all sections and filter on frontend
      const allSectionsResponse = await this.makeRequest(`/admin/sections`, {
        method: 'GET',
        requireAuth: true,
      });
      
      console.log(`All sections response:`, allSectionsResponse);
      
      if (allSectionsResponse && allSectionsResponse.data) {
        // Filter sections by program name (including partial matches)
        const allSections = allSectionsResponse.data;
        const filteredSections = allSections.filter(section => {
          const sectionProgram = section.program || '';
          const matches = sectionProgram.toLowerCase().includes(program.toLowerCase()) ||
                         sectionProgram.toLowerCase().includes(course.toLowerCase()) ||
                         (course === 'bsit' && (sectionProgram.toLowerCase().includes('information technology') || sectionProgram.toLowerCase().includes('bsit'))) ||
                         (course === 'bscs' && (sectionProgram.toLowerCase().includes('computer science') || sectionProgram.toLowerCase().includes('bscs'))) ||
                         (course === 'bsis' && (sectionProgram.toLowerCase().includes('information systems') || sectionProgram.toLowerCase().includes('bsis'))) ||
                         (course === 'act' && (sectionProgram.toLowerCase().includes('computer technology') || sectionProgram.toLowerCase().includes('act')));
          
          console.log(`Section program: "${sectionProgram}", Course: "${course}", Matches: ${matches}`);
          return matches;
        });
        
        console.log(`Filtered ${filteredSections.length} sections for ${course}`);
        
        // Get enrollment count for each section by counting students with section_id
        const sectionsWithEnrollment = await Promise.all(
          filteredSections.map(async (section) => {
            try {
              console.log(`Getting enrollment count for section ${section.id} (${section.name || section.section_name})`);
              
              // Get all students and count those assigned to this section
              const studentsResponse = await this.getUsersByRole('student');
              
              console.log(`Students response for section ${section.id}:`, studentsResponse);
              
              const allStudents = studentsResponse.data || studentsResponse || [];
              console.log(`Total students found: ${allStudents.length}`);
              
              const studentsInSection = allStudents.filter(student => {
                const studentSectionId = student.section_id || student.sectionId;
                const sectionId = section.id;
                const matches = studentSectionId === sectionId;
                console.log(`Student ${student.id}: section_id=${studentSectionId}, section.id=${sectionId}, matches=${matches}`);
                return matches;
              });
              
              const enrollmentCount = studentsInSection.length;
              
              console.log(`Section ${section.id} (${section.name || section.section_name}): ${enrollmentCount} students enrolled`);
              console.log(`Students in section:`, studentsInSection.map(s => ({ id: s.id, name: s.name, section_id: s.section_id || s.sectionId })));
              
              return {
                ...section,
                enrolled: enrollmentCount,
                student_count: enrollmentCount
              };
            } catch (error) {
              console.error(`Failed to get enrollment count for section ${section.id}:`, error);
              return {
                ...section,
                enrolled: section.enrolled || 0,
                student_count: section.student_count || 0
              };
            }
          })
        );
        
        console.log(`Final sections with enrollment for ${course}:`, sectionsWithEnrollment);
        console.log(`Filtered ${sectionsWithEnrollment.length} sections for ${course} out of ${allSections.length} total sections`);
        return { data: sectionsWithEnrollment };
      }
      
      // Fallback to original method
      const response = await this.makeRequest(`/admin/sections_by_program?program=${encodeURIComponent(program)}`, {
        method: 'GET',
        requireAuth: true,
      });
      
      console.log(`API Response for ${course}:`, response);
      console.log(`Raw sections data:`, response.data || response);
      console.log(`Number of sections returned:`, (response.data || response || []).length);
      
      return response;
    } catch (error) {
      console.error(`Error fetching sections for ${course}:`, error);
      throw error;
    }
  }
  

  async getSectionsByYear(year) {
    // Map year names to year levels
    const yearMap = {
      '1st Year': '1st',
      '2nd Year': '2nd', 
      '3rd Year': '3rd',
      '4th Year': '4th'
    };
    const yearLevel = yearMap[year] || '1st';
    return this.makeRequest(`/admin/sections_by_program_year_specific?program=${encodeURIComponent('Bachelor of Science in Information Technology')}&year_level=${yearLevel}`, {
      method: 'GET',
      requireAuth: true,
    });
  }

  async getSectionsByAcademicYear(academicYear) {
    // For now, return all sections since the API doesn't support academic year filtering
    return this.makeRequest(`/admin/sections_by_program?program=${encodeURIComponent('Bachelor of Science in Information Technology')}`, {
      method: 'GET',
      requireAuth: true,
    });
  }

  async getSectionsBySemester(semester) {
    // For now, return all sections since the API doesn't support semester filtering
    return this.makeRequest(`/admin/sections_by_program?program=${encodeURIComponent('Bachelor of Science in Information Technology')}`, {
      method: 'GET',
      requireAuth: true,
    });
  }

  async getSectionById(sectionId) {
    // Since there's no specific endpoint for single section, we'll get all and filter
    const allSections = await this.getSections();
    const section = allSections.data?.find(s => s.id === sectionId);
    if (!section) {
      throw new Error('Section not found');
    }
    return { success: true, data: section };
  }

  async createSection(sectionData) {
    // Note: This endpoint might not exist in your backend yet
    return this.makeRequest('/admin/sections', {
      method: 'POST',
      body: JSON.stringify(sectionData),
      requireAuth: true,
    });
  }

  async updateSection(sectionId, sectionData) {
    // Note: This endpoint might not exist in your backend yet
    return this.makeRequest(`/admin/sections/${sectionId}`, {
      method: 'PUT',
      body: JSON.stringify(sectionData),
      requireAuth: true,
    });
  }

  async deleteSection(sectionId) {
    // Note: This endpoint might not exist in your backend yet
    return this.makeRequest(`/admin/sections/${sectionId}`, {
      method: 'DELETE',
      requireAuth: true,
    });
  }

  async getSectionStudents(sectionId) {
    // Note: This endpoint might not exist in your backend yet
    return this.makeRequest(`/admin/sections/${sectionId}/students`, {
      method: 'GET',
      requireAuth: true,
    });
  }

  async addStudentToSection(sectionId, studentData) {
    // Note: This endpoint might not exist in your backend yet
    return this.makeRequest(`/admin/sections/${sectionId}/students`, {
      method: 'POST',
      body: JSON.stringify(studentData),
      requireAuth: true,
    });
  }

  async removeStudentFromSection(sectionId, studentId) {
    // Note: This endpoint might not exist in your backend yet
    return this.makeRequest(`/admin/sections/${sectionId}/students/${studentId}`, {
      method: 'DELETE',
      requireAuth: true,
    });
  }

  // Update user's section_id
  async updateUserSectionId(userId, sectionId) {
    return this.makeRequest(`/admin/users/${userId}/section`, {
      method: 'PUT',
      body: JSON.stringify({ section_id: sectionId }),
      requireAuth: true,
    });
  }

  // Get section students with enrollment count
  async getSectionStudentsWithCount(sectionId) {
    return this.makeRequest(`/admin/sections/${sectionId}/students`, {
      method: 'GET',
      requireAuth: true,
    });
  }

  async getAvailableTeachers() {
    // Note: This endpoint might not exist in your backend yet
    // For now, return empty array to avoid CORS errors
    return { success: true, data: [] };
  }

  async getAvailableStudents() {
    // Note: This endpoint might not exist in your backend yet
    // For now, return empty array to avoid CORS errors
    return { success: true, data: [] };
  }

  async exportSections(format = 'csv') {
    // Note: This endpoint might not exist in your backend yet
    return this.makeRequest(`/admin/sections/export?format=${format}`, {
      method: 'GET',
      requireAuth: true,
    });
  }

  async getCourses() {
    // Return static course data since there's no API endpoint
    return {
      success: true,
      data: [
        { id: "bsit", abbr: "BSIT", name: "Info Tech" },
        { id: "bscs", abbr: "BSCS", name: "Computer Science" },
        { id: "bsis", abbr: "BSIS", name: "Info Systems" },
        { id: "act", abbr: "ACT", name: "Computer Technology" },
      ]
    };
  }

  async getAcademicYears() {
    // Return static academic years since there's no API endpoint
    return {
      success: true,
      data: [
        "2023-2024",
        "2024-2025",
        "2025-2026"
      ]
    };
  }

  async getSemesters() {
    // Return static semesters since there's no API endpoint
    return {
      success: true,
      data: [
        "1st Semester",
        "2nd Semester",
        "Summer"
      ]
    };
  }

  // Fetch users by role
  async getUsersByRole(role) {
    return this.makeRequest(`/users?role=${role}`, {
      method: 'GET',
      requireAuth: true,
    });
  }

  // Get all users (for admin)
  async getAllUsers() {
    return this.makeRequest('/users', {
      method: 'GET',
      requireAuth: true,
    });
  }

  // Update user
  async updateUser(userId, userData) {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication token not found. Please log in again.');
    }
    
    try {
      console.log('Updating user with data:', userData);
      
      const response = await axios.put(`${API_BASE}/auth/update_user`, userData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      });
      
      console.log('Update response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Full update error:', error);
      console.error('Error response data:', error.response?.data);
      console.error('Error response status:', error.response?.status);
      const message = error.response?.data?.message || error.message || 'Update failed';
      console.error('Update error:', message);
      throw new Error(message);
    }
  }

  async updateUserWithImages(userId, formData) {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication token not found. Please log in again.');
    }
    
    try {
      // Get the role from the FormData to determine the correct endpoint
      const role = formData.get('role');
      console.log('Updating user with role:', role);
      
      console.log('Using endpoint:', `${API_BASE}/auth/update_user`);
      
      // Log FormData contents for debugging
      console.log('FormData contents:');
      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value instanceof File ? `File: ${value.name}` : value);
      }
      
      const response = await axios.put(`${API_BASE}/auth/update_user`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000, // 30 second timeout
      });
      
      console.log('Update response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Full error object:', error);
      console.error('Error response:', error.response);
      console.error('Error request:', error.request);
      
      let message = 'Update failed';
      if (error.response) {
        // Server responded with error status
        message = error.response.data?.message || `Server error: ${error.response.status}`;
      } else if (error.request) {
        // Request was made but no response received
        message = 'Network error - no response from server';
      } else {
        // Something else happened
        message = error.message || 'Unknown error occurred';
      }
      
      console.error('Update user with images error:', message);
      throw new Error(message);
    }
  }

  // Role-specific update methods
  async updateAdminUser(formData) {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication token not found. Please log in again.');
    }
    
    try {
      // Check if there are files in the FormData
      let hasFiles = false;
      for (let [key, value] of formData.entries()) {
        if (value instanceof File) {
          hasFiles = true;
          break;
        }
      }
      
      let response;
      if (hasFiles) {
        // Send as multipart/form-data using POST
        response = await axios.post(`${API_BASE}/admin/update`, formData, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
          timeout: 30000,
        });
      } else {
        // Convert FormData to JSON and send using PUT
        const jsonData = {};
        for (let [key, value] of formData.entries()) {
          jsonData[key] = value;
        }
        
        response = await axios.put(`${API_BASE}/admin/update`, jsonData, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        });
      }
      
      return response.data;
    } catch (error) {
      console.error('Full admin update error:', error);
      console.error('Error response data:', error.response?.data);
      console.error('Error response status:', error.response?.status);
      const message = error.response?.data?.message || error.message || 'Admin update failed';
      console.error('Admin update error:', message);
      throw new Error(message);
    }
  }

  async updateTeacherUser(formData) {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication token not found. Please log in again.');
    }
    
    try {
      // Check if there are files in the FormData
      let hasFiles = false;
      for (let [key, value] of formData.entries()) {
        if (value instanceof File) {
          hasFiles = true;
          break;
        }
      }
      
      let response;
      if (hasFiles) {
        // Send as multipart/form-data using POST
        response = await axios.post(`${API_BASE}/teacher/update`, formData, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
          timeout: 30000,
        });
      } else {
        // Convert FormData to JSON and send using PUT
        const jsonData = {};
        for (let [key, value] of formData.entries()) {
          jsonData[key] = value;
        }
        
        response = await axios.put(`${API_BASE}/teacher/update`, jsonData, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        });
      }
      
      return response.data;
    } catch (error) {
      console.error('Full teacher update error:', error);
      console.error('Error response data:', error.response?.data);
      console.error('Error response status:', error.response?.status);
      const message = error.response?.data?.message || error.message || 'Teacher update failed';
      console.error('Teacher update error:', message);
      throw new Error(message);
    }
  }

  async updateStudentUser(formData) {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication token not found. Please log in again.');
    }
    
    try {
      // Check if there are files in the FormData
      let hasFiles = false;
      for (let [key, value] of formData.entries()) {
        if (value instanceof File) {
          hasFiles = true;
          break;
        }
      }
      
      let response;
      if (hasFiles) {
        // Send as multipart/form-data using POST
        response = await axios.post(`${API_BASE}/student/update`, formData, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
          timeout: 30000,
        });
      } else {
        // Convert FormData to JSON and send using PUT
        const jsonData = {};
        for (let [key, value] of formData.entries()) {
          jsonData[key] = value;
        }
        
        response = await axios.put(`${API_BASE}/student/update`, jsonData, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        });
      }
      
      return response.data;
    } catch (error) {
      console.error('Full student update error:', error);
      console.error('Error response data:', error.response?.data);
      console.error('Error response status:', error.response?.status);
      const message = error.response?.data?.message || error.message || 'Student update failed';
      console.error('Student update error:', message);
      throw new Error(message);
    }
  }

  async fetchUserByRoleAndId(role, userId) {
    return this.makeRequest(`/user?role=${role}&user_id=${userId}`, {
      method: 'GET',
      requireAuth: true,
    });
  }

  async getUserById(userId, role) {
    try {
      // Use makeRequest with requireAuth
      const response = await this.makeRequest(`/user?role=${role}&user_id=${userId}`, {
        method: 'GET',
        requireAuth: true,
      });
      return response;
    } catch (error) {
      // If makeRequest fails, try direct axios call as fallback
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found. Please log in again.');
      }
      
      try {
        const response = await axios.get(`${API_BASE}/user?role=${role}&user_id=${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          timeout: 10000, // 10 second timeout
        });

        return response.data;
      } catch (axiosError) {
        console.error("Direct axios call failed:", axiosError);
        throw axiosError;
      }
    }
  }

  // Delete user
  async deleteUser(userId) {
    return this.makeRequest(`/users/${userId}`, {
      method: 'DELETE',
      requireAuth: true,
    });
  }

  // Image upload methods
  async uploadProfileImage(file) {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication token not found. Please log in again.');
    }
    
    const formData = new FormData();
    formData.append('image', file);
    
    try {
      const response = await axios.post(`${API_BASE}/upload/profile`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Upload failed';
      console.error('Profile image upload error:', message);
      throw new Error(message);
    }
  }

  async uploadCoverPhoto(file) {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication token not found. Please log in again.');
    }
    
    const formData = new FormData();
    formData.append('image', file);
    
    try {
      const response = await axios.post(`${API_BASE}/upload/cover`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Upload failed';
      console.error('Cover photo upload error:', message);
      throw new Error(message);
    }
  }

  async getTeachers() {
    return this.makeRequest('/users?role=teacher', {
      method: 'GET',
      requireAuth: true,
    });
  }

  async getStudents() {
    return this.makeRequest('/users?role=student', {
      method: 'GET',
      requireAuth: true,
    });
  }

  // Role-specific delete methods
  async deleteAdminUser(userId) {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication token not found. Please log in again.');
    }
    
    try {
      const response = await axios.delete(`${API_BASE}/admin/delete`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        data: { 
          user_id: userId,
          role: 'admin'
        },
        timeout: 30000,
      });
      
      return response.data;
    } catch (error) {
      console.error('Full admin delete error:', error);
      console.error('Error response data:', error.response?.data);
      console.error('Error response status:', error.response?.status);
      const message = error.response?.data?.message || error.message || 'Admin delete failed';
      console.error('Admin delete error:', message);
      throw new Error(message);
    }
  }

  async deleteTeacherUser(userId) {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication token not found. Please log in again.');
    }
    
    try {
      const response = await axios.delete(`${API_BASE}/teacher/delete`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        data: { 
          user_id: userId,
          role: 'teacher'
        },
        timeout: 30000,
      });
      
      return response.data;
    } catch (error) {
      console.error('Full teacher delete error:', error);
      console.error('Error response data:', error.response?.data);
      console.error('Error response status:', error.response?.status);
      const message = error.response?.data?.message || error.message || 'Teacher delete failed';
      console.error('Teacher delete error:', message);
      throw new Error(message);
    }
  }

  async deleteStudentUser(userId) {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication token not found. Please log in again.');
    }
    
    try {
      const response = await axios.delete(`${API_BASE}/student/delete`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        data: { 
          user_id: userId,
          role: 'student'
        },
        timeout: 30000,
      });
      
      return response.data;
    } catch (error) {
      console.error('Full student delete error:', error);
      console.error('Error response data:', error.response?.data);
      console.error('Error response status:', error.response?.status);
      const message = error.response?.data?.message || error.message || 'Student delete failed';
      console.error('Student delete error:', message);
      throw new Error(message);
    }
  }

  // Subject Management Methods
  async getSubjects() {
    return this.makeRequest('/admin/subjects', {
      method: 'GET',
      requireAuth: true,
    });
  }

  async createSubject(subjectData) {
    return this.makeRequest('/admin/subjects', {
      method: 'POST',
      body: JSON.stringify(subjectData),
      requireAuth: true,
    });
  }

  async updateSubject(subjectId, subjectData) {
    return this.makeRequest(`/admin/subjects/${subjectId}`, {
      method: 'PUT',
      body: JSON.stringify(subjectData),
      requireAuth: true,
    });
  }

  async deleteSubject(subjectId) {
    return this.makeRequest(`/admin/subjects/${subjectId}`, {
      method: 'DELETE',
      requireAuth: true,
    });
  }

  // Classes/Offerings Management Methods
  async getClasses() {
    return this.makeRequest('/admin/classes', {
      method: 'GET',
      requireAuth: true,
    });
  }

  async createClass(classData) {
    return this.makeRequest('/admin/classes', {
      method: 'POST',
      body: JSON.stringify(classData),
      requireAuth: true,
    });
  }

  async updateClass(classId, classData) {
    return this.makeRequest(`/admin/classes/${classId}`, {
      method: 'PUT',
      body: JSON.stringify(classData),
      requireAuth: true,
    });
  }

  async deleteClass(classId) {
    return this.makeRequest(`/admin/classes/${classId}`, {
      method: 'DELETE',
      requireAuth: true,
    });
  }

  // Teacher Classrooms API
  async getTeacherClassrooms() {
    return this.makeRequest('/teacher/classrooms', {
      method: 'GET',
      requireAuth: true,
    });
  }

  // Teacher Assigned Subjects API
  async getTeacherAssignedSubjects() {
    return this.makeRequest('/teacher/assigned-subjects', {
      method: 'GET',
      requireAuth: true,
    });
  }

  // Teacher Available Subjects API
  async getTeacherAvailableSubjects() {
    return this.makeRequest('/teacher/available-subjects', {
      method: 'GET',
      requireAuth: true,
    });
  }

  // Teacher Available Sections for Subject API
  async getTeacherAvailableSections(subjectId) {
    return this.makeRequest(`/teacher/available-sections/${subjectId}`, {
      method: 'GET',
      requireAuth: true,
    });
  }

  // Teacher Create Classroom API
  async createClassroom(classroomData) {
    return this.makeRequest('/teacher/classrooms', {
      method: 'POST',
      body: JSON.stringify(classroomData),
      requireAuth: true,
    });
  }

  // Teacher Get Classroom by Code API
  async getClassroomByCode(classCode) {
    return this.makeRequest(`/teacher/classrooms/${classCode}`, {
      method: 'GET',
      requireAuth: true,
    });
  }

  // Teacher Get Classroom Stream Posts API
  async getClassroomStream(classCode) {
    return this.makeRequest(`/teacher/classroom/${classCode}/stream`, {
      method: 'GET',
      requireAuth: true,
    });
  }

  // Teacher Create Classroom Stream Post API
  async createClassroomStreamPost(classCode, postData) {
    return this.makeRequest(`/teacher/classroom/${classCode}/stream`, {
      method: 'POST',
      body: JSON.stringify(postData),
      requireAuth: true,
    });
  }

  // Student methods
  async getStudentClasses() {
    return this.makeRequest('/student/my-classes', {
      method: 'GET',
      requireAuth: true,
    });
  }

  async joinClass(classCode) {
    return this.makeRequest('/student/join-class', {
      method: 'POST',
      body: JSON.stringify({ class_code: classCode }),
      requireAuth: true,
    });
  }

  // Attendance Management Methods
  async getTeacherAssignments() {
    return this.makeRequest('/attendance/teacher-assignments', {
      method: 'GET',
      requireAuth: true,
    });
  }

  async getTeacherClasses() {
    return this.makeRequest('/admin/classes', {
      method: 'GET',
      requireAuth: true,
    });
  }

  async getStudentsByClass(classId) {
    return this.makeRequest(`/attendance/students/${classId}`, {
      method: 'GET',
      requireAuth: true,
    });
  }

  async getStudentsBySubjectAndSection(subjectId, sectionName) {
    return this.makeRequest(`/teacher/subject/${subjectId}/section/${sectionName}/students`, {
      method: 'GET',
      requireAuth: true,
    });
  }

  async recordAttendance(attendanceData) {
    return this.makeRequest('/attendance/record', {
      method: 'POST',
      body: JSON.stringify(attendanceData),
      requireAuth: true,
    });
  }

  async recordAttendanceQR(qrData) {
    return this.makeRequest('/attendance/record-qr', {
      method: 'POST',
      body: JSON.stringify(qrData),
      requireAuth: true,
    });
  }

  async updateAttendanceRecord(attendanceId, updateData) {
    return this.makeRequest(`/attendance/update/${attendanceId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
      requireAuth: true,
    });
  }

  async getAttendanceRecords(filters = {}) {
    const queryParams = new URLSearchParams();
    
    if (filters.classId) queryParams.append('class_id', filters.classId);
    if (filters.subjectId) queryParams.append('subject_id', filters.subjectId);
    if (filters.sectionName) queryParams.append('section_name', filters.sectionName);
    if (filters.date) queryParams.append('date', filters.date);
    if (filters.status) queryParams.append('status', filters.status);
    if (filters.studentId) queryParams.append('student_id', filters.studentId);
    if (filters.limit) queryParams.append('limit', filters.limit);
    if (filters.offset) queryParams.append('offset', filters.offset);

    const endpoint = `/attendance/records${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    return this.makeRequest(endpoint, {
      method: 'GET',
      requireAuth: true,
    });
  }

  async getAllAttendance(filters = {}) {
    const queryParams = new URLSearchParams();
    
    if (filters.classId) queryParams.append('class_id', filters.classId);
    if (filters.date) queryParams.append('date', filters.date);
    if (filters.status) queryParams.append('status', filters.status);
    if (filters.studentId) queryParams.append('student_id', filters.studentId);
    if (filters.limit) queryParams.append('limit', filters.limit);
    if (filters.offset) queryParams.append('offset', filters.offset);

    const endpoint = `/attendance/all${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    return this.makeRequest(endpoint, {
      method: 'GET',
      requireAuth: true,
    });
  }

  async getAllAttendanceRecords() {
    return this.makeRequest('/attendance/all', {
      method: 'GET',
      requireAuth: true,
    });
  }

  async getAttendanceRecordsByClassId(classId) {
    return this.makeRequest(`/attendance/all?class_id=${classId}`, {
      method: 'GET',
      requireAuth: true,
    });
  }

  async updateAttendanceStatus(attendanceId, status, notes = '') {
    return this.makeRequest(`/attendance/${attendanceId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, notes }),
      requireAuth: true,
    });
  }

  async bulkUpdateAttendance(updates) {
    return this.makeRequest('/attendance/bulk-update', {
      method: 'PUT',
      body: JSON.stringify({ updates }),
      requireAuth: true,
    });
  }

  async getAttendanceSummary(subjectId, sectionName, date) {
    const queryParams = new URLSearchParams();
    if (subjectId) queryParams.append('subject_id', subjectId);
    if (sectionName) queryParams.append('section_name', sectionName);
    if (date) queryParams.append('date', date);

    const endpoint = `/attendance/summary${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    return this.makeRequest(endpoint, {
      method: 'GET',
      requireAuth: true,
    });
  }

  async exportAttendance(filters = {}, format = 'csv') {
    const queryParams = new URLSearchParams();
    
    if (filters.classId) queryParams.append('class_id', filters.classId);
    if (filters.subjectId) queryParams.append('subject_id', filters.subjectId);
    if (filters.sectionName) queryParams.append('section_name', filters.sectionName);
    if (filters.date) queryParams.append('date', filters.date);
    if (filters.status) queryParams.append('status', filters.status);
    if (filters.studentId) queryParams.append('student_id', filters.studentId);
    queryParams.append('format', format);

    const endpoint = `/attendance/export?${queryParams.toString()}`;
    
    return this.makeRequest(endpoint, {
      method: 'GET',
      requireAuth: true,
    });
  }

  async deleteAttendanceRecord(attendanceId) {
    return this.makeRequest(`/attendance/${attendanceId}`, {
      method: 'DELETE',
      requireAuth: true,
    });
  }

  async getAttendanceStatistics(subjectId, sectionName, dateRange = {}) {
    const queryParams = new URLSearchParams();
    
    if (subjectId) queryParams.append('subject_id', subjectId);
    if (sectionName) queryParams.append('section_name', sectionName);
    if (dateRange.startDate) queryParams.append('start_date', dateRange.startDate);
    if (dateRange.endDate) queryParams.append('end_date', dateRange.endDate);

    const endpoint = `/attendance/statistics${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    return this.makeRequest(endpoint, {
      method: 'GET',
      requireAuth: true,
    });
  }

  async getStudentAttendance(filters = {}) {
    const queryParams = new URLSearchParams();
    
    if (filters.subjectId) queryParams.append('subject_id', filters.subjectId);
    if (filters.dateFrom) queryParams.append('date_from', filters.dateFrom);
    if (filters.dateTo) queryParams.append('date_to', filters.dateTo);

    const endpoint = `/attendance/student${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    return this.makeRequest(endpoint, {
      method: 'GET',
      requireAuth: true,
    });
  }

  // Excuse Letter methods
  async submitExcuseLetter(excuseData) {
    return this.makeRequest('/excuse-letters/submit', {
      method: 'POST',
      body: JSON.stringify(excuseData),
      requireAuth: true,
    });
  }

  async submitExcuseLetterWithAttachment(formData) {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication token not found. Please log in again.');
    }
    
    try {
      const response = await axios.post(`${API_BASE}/excuse-letters/submit`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          // Don't set Content-Type for FormData, let browser set it with boundary
        },
      });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'API Error';
      console.error('API Error (submitExcuseLetterWithAttachment):', message);
      throw new Error(message);
    }
  }

  async getStudentExcuseLetters(filters = {}) {
    const queryParams = new URLSearchParams();
    if (filters.classId) queryParams.append('class_id', filters.classId);
    if (filters.status) queryParams.append('status', filters.status);
    const endpoint = `/excuse-letters/student${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.makeRequest(endpoint, {
      method: 'GET',
      requireAuth: true,
    });
  }

  async deleteExcuseLetter(letterId) {
    return this.makeRequest(`/excuse-letters/delete/${letterId}`, {
      method: 'DELETE',
      requireAuth: true,
    });
  }

  // Teacher excuse letter methods
  async getTeacherExcuseLetters() {
    return this.makeRequest('/excuse-letters/teacher', {
      method: 'GET',
      requireAuth: true,
    });
  }

  async updateExcuseLetterStatus(letterId, statusData) {
    return this.makeRequest(`/excuse-letters/update/${letterId}`, {
      method: 'PUT',
      body: JSON.stringify(statusData),
      requireAuth: true,
    });
  }

  // Audit Log API methods
  async getAuditLogs(filters = {}) {
    const queryParams = new URLSearchParams();
    
    if (filters.module) queryParams.append('module', filters.module);
    if (filters.role) queryParams.append('role', filters.role);
    if (filters.dateFrom) queryParams.append('date_from', filters.dateFrom);
    if (filters.dateTo) queryParams.append('date_to', filters.dateTo);
    if (filters.search) queryParams.append('search', filters.search);
    if (filters.limit) queryParams.append('limit', filters.limit);
    if (filters.offset) queryParams.append('offset', filters.offset);
    if (filters.sortBy) queryParams.append('sort_by', filters.sortBy);
    if (filters.sortOrder) queryParams.append('sort_order', filters.sortOrder);

    const endpoint = `/admin/audit-logs${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    return this.makeRequest(endpoint, {
      method: 'GET',
      requireAuth: true,
    });
  }

  // Role-specific audit log methods
  async getAdminAuditLogs(filters = {}) {
    const queryParams = new URLSearchParams();
    
    if (filters.module) queryParams.append('module', filters.module);
    if (filters.role) queryParams.append('role', filters.role);
    if (filters.dateFrom) queryParams.append('date_from', filters.dateFrom);
    if (filters.dateTo) queryParams.append('date_to', filters.dateTo);
    if (filters.search) queryParams.append('search', filters.search);
    if (filters.limit) queryParams.append('limit', filters.limit);
    if (filters.offset) queryParams.append('offset', filters.offset);
    if (filters.sortBy) queryParams.append('sort_by', filters.sortBy);
    if (filters.sortOrder) queryParams.append('sort_order', filters.sortOrder);

    const endpoint = `/admin/audit-logs/admin${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    return this.makeRequest(endpoint, {
      method: 'GET',
      requireAuth: true,
    });
  }

  async getTeacherAuditLogs(filters = {}) {
    const queryParams = new URLSearchParams();
    
    if (filters.module) queryParams.append('module', filters.module);
    if (filters.role) queryParams.append('role', filters.role);
    if (filters.dateFrom) queryParams.append('date_from', filters.dateFrom);
    if (filters.dateTo) queryParams.append('date_to', filters.dateTo);
    if (filters.search) queryParams.append('search', filters.search);
    if (filters.limit) queryParams.append('limit', filters.limit);
    if (filters.offset) queryParams.append('offset', filters.offset);
    if (filters.sortBy) queryParams.append('sort_by', filters.sortBy);
    if (filters.sortOrder) queryParams.append('sort_order', filters.sortOrder);

    const endpoint = `/admin/audit-logs/teacher${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    return this.makeRequest(endpoint, {
      method: 'GET',
      requireAuth: true,
    });
  }

  async getStudentAuditLogs(filters = {}) {
    const queryParams = new URLSearchParams();
    
    if (filters.module) queryParams.append('module', filters.module);
    if (filters.role) queryParams.append('role', filters.role);
    if (filters.dateFrom) queryParams.append('date_from', filters.dateFrom);
    if (filters.dateTo) queryParams.append('date_to', filters.dateTo);
    if (filters.search) queryParams.append('search', filters.search);
    if (filters.limit) queryParams.append('limit', filters.limit);
    if (filters.offset) queryParams.append('offset', filters.offset);
    if (filters.sortBy) queryParams.append('sort_by', filters.sortBy);
    if (filters.sortOrder) queryParams.append('sort_order', filters.sortOrder);

    const endpoint = `/admin/audit-logs/student${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    return this.makeRequest(endpoint, {
      method: 'GET',
      requireAuth: true,
    });
  }

  async getAuditLogById(logId) {
    return this.makeRequest(`/admin/audit-logs/${logId}`, {
      method: 'GET',
      requireAuth: true,
    });
  }

  async getAuditLogModules() {
    return this.makeRequest('/admin/audit-logs/modules', {
      method: 'GET',
      requireAuth: true,
    });
  }

  async getAuditLogRoles() {
    return this.makeRequest('/admin/audit-logs/roles', {
      method: 'GET',
      requireAuth: true,
    });
  }

  async exportAuditLogs(filters = {}) {
    const queryParams = new URLSearchParams();
    
    if (filters.module) queryParams.append('module', filters.module);
    if (filters.role) queryParams.append('role', filters.role);
    if (filters.dateFrom) queryParams.append('date_from', filters.dateFrom);
    if (filters.dateTo) queryParams.append('date_to', filters.dateTo);
    if (filters.search) queryParams.append('search', filters.search);

    const endpoint = `/admin/audit-logs/export${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    return this.makeRequest(endpoint, {
      method: 'GET',
      requireAuth: true,
    });
  }

  // Role-specific export methods
  async exportAdminAuditLogs(filters = {}) {
    const queryParams = new URLSearchParams();
    
    if (filters.module) queryParams.append('module', filters.module);
    if (filters.role) queryParams.append('role', filters.role);
    if (filters.dateFrom) queryParams.append('date_from', filters.dateFrom);
    if (filters.dateTo) queryParams.append('date_to', filters.dateTo);
    if (filters.search) queryParams.append('search', filters.search);

    const endpoint = `/admin/audit-logs/admin/export${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    return this.makeRequest(endpoint, {
      method: 'GET',
      requireAuth: true,
    });
  }

  async exportTeacherAuditLogs(filters = {}) {
    const queryParams = new URLSearchParams();
    
    if (filters.module) queryParams.append('module', filters.module);
    if (filters.role) queryParams.append('role', filters.role);
    if (filters.dateFrom) queryParams.append('date_from', filters.dateFrom);
    if (filters.dateTo) queryParams.append('date_to', filters.dateTo);
    if (filters.search) queryParams.append('search', filters.search);

    const endpoint = `/admin/audit-logs/teacher/export${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    return this.makeRequest(endpoint, {
      method: 'GET',
      requireAuth: true,
    });
  }

  async exportStudentAuditLogs(filters = {}) {
    const queryParams = new URLSearchParams();
    
    if (filters.module) queryParams.append('module', filters.module);
    if (filters.role) queryParams.append('role', filters.role);
    if (filters.dateFrom) queryParams.append('date_from', filters.dateFrom);
    if (filters.dateTo) queryParams.append('date_to', filters.dateTo);
    if (filters.search) queryParams.append('search', filters.search);

    const endpoint = `/admin/audit-logs/student/export${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    return this.makeRequest(endpoint, {
      method: 'GET',
      requireAuth: true,
    });
  }
}

export default new ApiService(); 