import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Container,
  Row,
  Col,
  FormGroup,
  Input,
  Label,
  Button,
  Table,
  Badge,
  Alert,
  Spinner,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Form,
  FormText,
} from "reactstrap";
import Dropdown from 'react-bootstrap/Dropdown';
import { FaPlus, FaTrash, FaEye, FaFileUpload, FaCalendarAlt } from "react-icons/fa";
import apiService from "../../services/api";

// Get API_BASE from the same source as apiService
const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost/scms_new_backup/index.php/api';

const StudentExcuseLetter = () => {
  // State for excuse letters data
  const [excuseLetters, setExcuseLetters] = useState([]);
  const [summary, setSummary] = useState({ pending: 0, approved: 0, rejected: 0, total: 0 });
  const [availableClasses, setAvailableClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // State for submit form
  const [submitForm, setSubmitForm] = useState({
    class_id: "",
    date_absent: "",
    reason: "",
    attachment: null
  });
  const [submitLoading, setSubmitLoading] = useState(false);

  // State for delete confirmation
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [letterToDelete, setLetterToDelete] = useState(null);
  
  // State for attachment preview
  const [attachmentModalOpen, setAttachmentModalOpen] = useState(false);
  const [selectedAttachment, setSelectedAttachment] = useState(null);

  // Clear messages
  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  // Load excuse letters data on component mount
  useEffect(() => {
    loadExcuseLetters();
    loadStudentClasses();
  }, []);

  // Retry loading classes if they fail to load
  const retryLoadClasses = () => {
    loadStudentClasses();
  };

  // Test function to check API response structure
  const testApiResponse = async () => {
    try {
      console.log('Testing API response structure...');
      const response = await apiService.getStudentClasses();
      console.log('=== API RESPONSE STRUCTURE TEST ===');
      console.log('Full response:', response);
      console.log('Response status:', response.status);
      console.log('Response data type:', typeof response.data);
      console.log('Response data:', response.data);
      
      if (Array.isArray(response.data)) {
        console.log('Data is an array with length:', response.data.length);
        response.data.forEach((item, index) => {
          console.log(`Item ${index}:`, item);
          console.log(`Item ${index} keys:`, Object.keys(item));
        });
      } else if (response.data && typeof response.data === 'object') {
        console.log('Data is an object with keys:', Object.keys(response.data));
        Object.keys(response.data).forEach(key => {
          console.log(`Key "${key}":`, response.data[key]);
        });
      }
      console.log('=== END API TEST ===');
    } catch (error) {
      console.error('API test failed:', error);
    }
  };

  // Test function to try different class_id formats
  const testClassSubmission = async () => {
    if (availableClasses.length === 0) {
      console.log('No classes available to test');
      return;
    }

    const testClass = availableClasses[0];
    console.log('Testing submission with class:', testClass);
    console.log('Available class_ids to test:', testClass.possible_class_ids);

    // Test each possible class_id
    for (let i = 0; i < testClass.possible_class_ids.length; i++) {
      const classId = testClass.possible_class_ids[i];
      console.log(`Testing with class_id ${i + 1}/${testClass.possible_class_ids.length}:`, classId);
      
      try {
        const response = await apiService.submitExcuseLetter({
          class_id: String(classId),
          date_absent: '2024-01-01',
          reason: `Test submission with class_id: ${classId}`
        });
        console.log('SUCCESS with class_id:', classId, response);
        setSuccess(`Test submission successful with class_id: ${classId}`);
        return; // Stop testing if one works
      } catch (error) {
        console.log('FAILED with class_id:', classId, error.message);
        if (i === testClass.possible_class_ids.length - 1) {
          setError(`All class_id tests failed. Last error: ${error.message}`);
        }
      }
    }
  };

  // Test function to manually submit a test excuse letter
  const testManualSubmission = async () => {
    try {
      console.log('=== MANUAL TEST SUBMISSION ===');
      
      // Use the first available class
      if (availableClasses.length === 0) {
        console.log('No classes available for testing');
        setError('No classes available for testing');
        return;
      }
      
      const testClass = availableClasses[0];
      console.log('Using test class:', testClass);
      
      const testData = {
        class_id: testClass.class_id,
        date_absent: '2024-01-01',
        reason: 'Test submission from frontend'
      };
      
      console.log('Submitting test data:', testData);
      
      const response = await apiService.submitExcuseLetter(testData);
      console.log('Test submission response:', response);
      
      if (response.status) {
        setSuccess('Test submission successful! Check the database.');
        loadExcuseLetters(); // Reload the list
      } else {
        setError('Test submission failed: ' + (response.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Test submission error:', error);
      setError('Test submission failed: ' + error.message);
    }
  };

  // Test function to directly test the working API endpoint
  const testDirectAPI = async () => {
    try {
      console.log('=== DIRECT API TEST ===');
      
      // Test with all possible class_id values from your API response
      const testCases = [
        { class_id: "4", name: "Database Management System" },
        { class_id: "5", name: "System Analysis and Design" },
        { class_id: "6", name: "Advanced OOP" },
        // Also test numeric versions
        { class_id: 4, name: "Database Management System (numeric)" },
        { class_id: 5, name: "System Analysis and Design (numeric)" },
        { class_id: 6, name: "Advanced OOP (numeric)" }
      ];
      
      for (let i = 0; i < testCases.length; i++) {
        const testCase = testCases[i];
        console.log(`\n--- Testing ${testCase.name} with class_id: ${testCase.class_id} ---`);
        
        try {
          const testData = {
            class_id: testCase.class_id,
            date_absent: "2024-01-15",
            reason: `Test for ${testCase.name}`
          };
          
          console.log('Test data:', testData);
          const response = await apiService.submitExcuseLetter(testData);
          console.log('API response:', response);
          
          if (response.status) {
            console.log(`✅ SUCCESS! ${testCase.name} works with class_id: ${testCase.class_id}`);
            setSuccess(`Direct API test successful for ${testCase.name} with class_id: ${testCase.class_id}`);
            return;
          } else {
            console.log(`❌ Failed for ${testCase.name}: ${response.message}`);
          }
        } catch (error) {
          console.log(`❌ Error for ${testCase.name}: ${error.message}`);
        }
      }
      
      setError('All direct API tests failed');
    } catch (error) {
      console.error('Direct API test error:', error);
      setError('Direct API test failed: ' + error.message);
    }
  };

  // Test function to check authentication status
  const checkAuthStatus = () => {
    console.log('=== AUTH STATUS CHECK ===');
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    const scmsUser = localStorage.getItem('scms_logged_in_user');
    
    console.log('Token exists:', !!token);
    console.log('Token length:', token ? token.length : 0);
    console.log('User exists:', !!user);
    console.log('SCMS user exists:', !!scmsUser);
    
    if (token) {
      console.log('Token preview:', token.substring(0, 20) + '...');
    }
    
    if (!token) {
      setError('No authentication token found. Please log in again.');
    } else {
      setSuccess('Authentication token found. Token length: ' + token.length);
    }
  };

  // Test function to find the correct class_id from API response
  const findCorrectClassId = async () => {
    try {
      console.log('=== FINDING CORRECT CLASS_ID ===');
      
      // Get the raw API response
      const response = await apiService.getStudentClasses();
      console.log('Raw API response:', response);
      
      if (response.status && response.data) {
        let classesData = response.data;
        if (Array.isArray(response.data)) {
          classesData = response.data;
        } else if (response.data.classes && Array.isArray(response.data.classes)) {
          classesData = response.data.classes;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          classesData = response.data.data;
        }
        
        console.log('Classes data:', classesData);
        
        // Test each class to find the correct class_id
        for (let i = 0; i < classesData.length; i++) {
          const cls = classesData[i];
          console.log(`Testing class ${i}:`, cls.subject_name || cls.subject || cls.name);
          
          // Get all possible class_id fields
          const possibleIds = [
            cls.id,
            cls.class_id,
            cls.classId,
            cls.subject_id,
            cls.subjectId,
            cls.class_code,
            cls.code
          ].filter(id => id !== undefined && id !== null);
          
          console.log(`Class ${i} possible IDs:`, possibleIds);
          
          // Test each possible class_id
          for (let j = 0; j < possibleIds.length; j++) {
            const classId = possibleIds[j];
            console.log(`Testing class ${i} with ID ${j + 1}/${possibleIds.length}:`, classId);
            
            try {
              const testResponse = await apiService.submitExcuseLetter({
                class_id: String(classId),
                date_absent: "2025-08-10",
                reason: `Test to find correct class_id for ${cls.subject_name || cls.subject || cls.name}`
              });
              
              if (testResponse.status) {
                console.log('SUCCESS! Correct class_id found:', classId, 'for class:', cls.subject_name || cls.subject || cls.name);
                setSuccess(`Correct class_id found: ${classId} for ${cls.subject_name || cls.subject || cls.name}`);
                
                // Update the form with the correct class_id
                setSubmitForm(prev => ({
                  ...prev,
                  class_id: String(classId)
                }));
                
                return classId;
              }
            } catch (error) {
              console.log(`Failed with class_id ${classId}:`, error.message);
            }
          }
        }
        
        setError('No working class_id found. Check console for details.');
      }
    } catch (error) {
      console.error('Error finding correct class_id:', error);
      setError('Error finding correct class_id: ' + error.message);
    }
  };

  // Test function to find the correct numeric class_id from API response
  const findCorrectNumericClassId = async () => {
    try {
      console.log('=== FINDING CORRECT NUMERIC CLASS_ID ===');
      
      // Get the raw API response
      const response = await apiService.getStudentClasses();
      console.log('Raw API response:', response);
      
      if (response.status && response.data) {
        let classesData = response.data;
        if (Array.isArray(response.data)) {
          classesData = response.data;
        } else if (response.data.classes && Array.isArray(response.data.classes)) {
          classesData = response.data.classes;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          classesData = response.data.data;
        }
        
        console.log('Classes data:', classesData);
        
        // Look for the class that matches the working test
        // The working test shows "Database Management System" with class_id "5"
        const targetClass = classesData.find(cls => 
          cls.subject_name === "Database Management System" || 
          cls.subject === "Database Management System" ||
          cls.name === "Database Management System"
        );
        
        if (targetClass) {
          console.log('Found target class:', targetClass);
          console.log('All possible numeric class_id fields:');
          console.log('- id:', targetClass.id);
          console.log('- class_id:', targetClass.class_id);
          console.log('- classId:', targetClass.classId);
          console.log('- subject_id:', targetClass.subject_id);
          console.log('- subjectId:', targetClass.subjectId);
          
          // Test each possible numeric class_id
          const possibleIds = [
            targetClass.id,
            targetClass.class_id,
            targetClass.classId,
            targetClass.subject_id,
            targetClass.subjectId
          ].filter(id => id !== undefined && id !== null && !isNaN(Number(id)));
          
          console.log('Testing possible numeric class_ids:', possibleIds);
          
          for (let i = 0; i < possibleIds.length; i++) {
            const classId = possibleIds[i];
            console.log(`Testing numeric class_id ${i + 1}/${possibleIds.length}:`, classId);
            
            try {
              const testResponse = await apiService.submitExcuseLetter({
                class_id: String(classId),
                date_absent: "2025-08-10",
                reason: "Test to find correct numeric class_id"
              });
              
              if (testResponse.status) {
                console.log('SUCCESS! Correct numeric class_id found:', classId);
                setSuccess(`Correct numeric class_id found: ${classId}`);
                
                // Update the form with the correct class_id
                setSubmitForm(prev => ({
                  ...prev,
                  class_id: String(classId)
                }));
                
                return classId;
              }
            } catch (error) {
              console.log(`Failed with numeric class_id ${classId}:`, error.message);
            }
          }
          
          setError('No working numeric class_id found. Check console for details.');
        } else {
          console.log('Target class not found in API response');
          setError('Database Management System class not found in API response');
        }
      }
    } catch (error) {
      console.error('Error finding correct numeric class_id:', error);
      setError('Error finding correct numeric class_id: ' + error.message);
    }
  };

  // Function to automatically fix class_id mapping for all classes
  const autoFixClassIds = async () => {
    try {
      console.log('=== AUTO FIXING CLASS_ID MAPPING ===');
      
      // Reload classes with improved mapping
      await loadStudentClasses();
      
      // Test the first class to see if it works
      if (availableClasses.length > 0) {
        const firstClass = availableClasses[0];
        console.log('Testing first class with improved mapping:', firstClass);
        
        try {
          const testResponse = await apiService.submitExcuseLetter({
            class_id: firstClass.class_id,
            date_absent: "2025-08-10",
            reason: "Auto-fix test"
          });
          
          if (testResponse.status) {
            console.log('SUCCESS! Auto-fix worked for first class');
            setSuccess('Auto-fix successful! Form should now work properly.');
          } else {
            console.log('Auto-fix failed for first class');
            setError('Auto-fix failed. Please use the debug buttons to find the correct class_id.');
          }
        } catch (error) {
          console.log('Auto-fix test failed:', error.message);
          setError('Auto-fix failed. Please use the debug buttons to find the correct class_id.');
        }
      }
    } catch (error) {
      console.error('Error in auto-fix:', error);
      setError('Auto-fix error: ' + error.message);
    }
  };

  // Function to manually set the working class_id for testing
  const setWorkingClassId = () => {
    console.log('Setting working class_id to "5" for Database Management System');
    setSubmitForm(prev => ({
      ...prev,
      class_id: "5"
    }));
    setSuccess('Set class_id to "5" (Database Management System)');
  };

  // Function to discover the correct class_id for a specific class
  const discoverCorrectClassId = async (className) => {
    try {
      console.log(`=== DISCOVERING CORRECT CLASS_ID FOR: ${className} ===`);
      
      // Find the class in availableClasses
      const targetClass = availableClasses.find(cls => 
        cls.subject_name === className || 
        cls.subject === className ||
        cls.name === className
      );
      
      if (!targetClass) {
        setError(`Class "${className}" not found in available classes`);
        return;
      }
      
      console.log('Target class found:', targetClass);
      console.log('Possible class_ids to test:', targetClass.possible_class_ids);
      
      // Test each possible class_id
      for (let i = 0; i < targetClass.possible_class_ids.length; i++) {
        const classId = targetClass.possible_class_ids[i];
        console.log(`Testing class_id ${i + 1}/${targetClass.possible_class_ids.length}:`, classId);
        
        try {
          const testResponse = await apiService.submitExcuseLetter({
            class_id: String(classId),
            date_absent: "2025-08-10",
            reason: `Test to find correct class_id for ${className}`
          });
          
          if (testResponse.status) {
            console.log('SUCCESS! Correct class_id found:', classId, 'for class:', className);
            setSuccess(`Correct class_id for "${className}": ${classId}`);
            
            // Update the class mapping
            const updatedClasses = availableClasses.map(cls => {
              if (cls.subject_name === className || cls.subject === className || cls.name === className) {
                return { ...cls, class_id: String(classId) };
              }
              return cls;
            });
            
            setAvailableClasses(updatedClasses);
            return classId;
          }
        } catch (error) {
          console.log(`Failed with class_id ${classId}:`, error.message);
        }
      }
      
      setError(`No working class_id found for "${className}". Check console for details.`);
    } catch (error) {
      console.error('Error discovering correct class_id:', error);
      setError('Error discovering correct class_id: ' + error.message);
    }
  };

  // Function to discover all correct class_ids
  const discoverAllCorrectClassIds = async () => {
    try {
      console.log('=== DISCOVERING ALL CORRECT CLASS_IDS ===');
      
      const results = [];
      
      for (let i = 0; i < availableClasses.length; i++) {
        const cls = availableClasses[i];
        const className = cls.subject_name || cls.subject || cls.name;
        
        console.log(`Testing class ${i + 1}/${availableClasses.length}: ${className}`);
        
        // Skip Database Management System since we know it's 5
        if (className === "Database Management System") {
          console.log(`Skipping ${className} - known to be 5`);
          results.push({ className, classId: "5", status: "known" });
          continue;
        }
        
        // Test each possible class_id for this class
        let foundClassId = null;
        
        for (let j = 0; j < cls.possible_class_ids.length; j++) {
          const classId = cls.possible_class_ids[j];
          console.log(`Testing ${className} with class_id ${j + 1}/${cls.possible_class_ids.length}:`, classId);
          
          try {
            const testResponse = await apiService.submitExcuseLetter({
              class_id: String(classId),
              date_absent: "2025-08-10",
              reason: `Test to find correct class_id for ${className}`
            });
            
            if (testResponse.status) {
              console.log('SUCCESS! Correct class_id found:', classId, 'for class:', className);
              foundClassId = String(classId);
              break;
            }
          } catch (error) {
            console.log(`Failed with class_id ${classId}:`, error.message);
          }
        }
        
        if (foundClassId) {
          results.push({ className, classId: foundClassId, status: "found" });
        } else {
          results.push({ className, classId: "unknown", status: "not_found" });
        }
      }
      
      console.log('Discovery results:', results);
      
      // Update the classes with correct class_ids
      const updatedClasses = availableClasses.map(cls => {
        const className = cls.subject_name || cls.subject || cls.name;
        const result = results.find(r => r.className === className);
        
        if (result && result.status === "found") {
          return { ...cls, class_id: result.classId };
        }
        
        return cls;
      });
      
      setAvailableClasses(updatedClasses);
      
      // Show results
      const foundResults = results.filter(r => r.status === "found");
      const notFoundResults = results.filter(r => r.status === "not_found");
      
      let message = `Discovery complete!\n`;
      if (foundResults.length > 0) {
        message += `Found correct class_ids for: ${foundResults.map(r => `${r.className} (${r.classId})`).join(', ')}\n`;
      }
      if (notFoundResults.length > 0) {
        message += `Could not find correct class_ids for: ${notFoundResults.map(r => r.className).join(', ')}`;
      }
      
      setSuccess(message);
      
    } catch (error) {
      console.error('Error discovering all correct class_ids:', error);
      setError('Error discovering all correct class_ids: ' + error.message);
    }
  };

  // Comprehensive test function to find the correct class_id format
  const testAllPossibleClassIds = async () => {
    try {
      setSubmitLoading(true);
      clearMessages();
      
      console.log('=== COMPREHENSIVE CLASS_ID TEST ===');
      
      if (!availableClasses || availableClasses.length === 0) {
        setError('No classes available for testing');
        return;
      }
      
      const testClass = availableClasses[0]; // Use the first available class
      console.log('Testing with class:', testClass);
      
      // All possible field combinations to test
      const testCases = [
        // String versions
        { field: 'class_id', value: testClass.original.class_id, description: 'class_id (string)' },
        { field: 'subject_id', value: testClass.original.subject_id, description: 'subject_id (string)' },
        { field: 'section_id', value: testClass.original.section_id, description: 'section_id (string)' },
        { field: 'id', value: testClass.original.id, description: 'id (string)' },
        
        // Numeric versions
        { field: 'class_id', value: Number(testClass.original.class_id), description: 'class_id (numeric)' },
        { field: 'subject_id', value: Number(testClass.original.subject_id), description: 'subject_id (numeric)' },
        { field: 'section_id', value: Number(testClass.original.section_id), description: 'section_id (numeric)' },
        { field: 'id', value: Number(testClass.original.id), description: 'id (numeric)' },
        
        // Different field names
        { field: 'classId', value: testClass.original.class_id, description: 'classId (string)' },
        { field: 'subjectId', value: testClass.original.subject_id, description: 'subjectId (string)' },
        { field: 'sectionId', value: testClass.original.section_id, description: 'sectionId (string)' },
        
        // Try without field name (just the value)
        { field: null, value: testClass.original.class_id, description: 'class_id value only' },
        { field: null, value: testClass.original.subject_id, description: 'subject_id value only' },
        { field: null, value: testClass.original.section_id, description: 'section_id value only' }
      ];
      
      const testData = {
        date_absent: "2024-01-15",
        reason: "Comprehensive test for correct class_id format"
      };
      
      for (let i = 0; i < testCases.length; i++) {
        const testCase = testCases[i];
        console.log(`\n--- Test ${i + 1}/${testCases.length}: ${testCase.description} ---`);
        
        try {
          let requestData;
          
          if (testCase.field) {
            requestData = {
              ...testData,
              [testCase.field]: testCase.value
            };
          } else {
            // Try sending just the value without a field name
            requestData = {
              ...testData,
              class_id: testCase.value
            };
          }
          
          console.log('Request data:', requestData);
          console.log('Request URL:', `${API_BASE}/excuse-letters/submit`);
          
          // Make the request directly to see the exact response
          const token = localStorage.getItem('token');
          const response = await fetch(`${API_BASE}/excuse-letters/submit`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(requestData)
          });
          
          const responseData = await response.json();
          console.log('Response status:', response.status);
          console.log('Response data:', responseData);
          
          if (response.ok && responseData.status) {
            console.log(`✅ SUCCESS! ${testCase.description} works!`);
            setSuccess(`Found working format: ${testCase.description} with value: ${testCase.value}`);
            return;
          } else {
            console.log(`❌ Failed: ${responseData.message || 'Unknown error'}`);
          }
          
        } catch (error) {
          console.log(`❌ Error: ${error.message}`);
        }
      }
      
      setError('All test cases failed. Backend may have different requirements.');
      
    } catch (error) {
      console.error('Comprehensive test error:', error);
      setError('Test failed: ' + error.message);
    } finally {
      setSubmitLoading(false);
    }
  };

  // Test function to find the correct field for excuse letter submission
  const testExactApiStructure = async () => {
    try {
      setSubmitLoading(true);
      clearMessages();
      
      console.log('=== TESTING EXACT API STRUCTURE ===');
      
      // Use the exact structure from your API response
      const testPayloads = [
        // Test with class_id (what you're currently sending)
        {
          class_id: "6",
          date_absent: "2024-01-15",
          reason: "Test with class_id: 6"
        },
        // Test with subject_id
        {
          subject_id: "1",
          date_absent: "2024-01-15", 
          reason: "Test with subject_id: 1"
        },
        // Test with section_id
        {
          section_id: "15",
          date_absent: "2024-01-15",
          reason: "Test with section_id: 15"
        },
        // Test with numeric versions
        {
          class_id: 6,
          date_absent: "2024-01-15",
          reason: "Test with class_id: 6 (numeric)"
        },
        {
          subject_id: 1,
          date_absent: "2024-01-15",
          reason: "Test with subject_id: 1 (numeric)"
        },
        {
          section_id: 15,
          date_absent: "2024-01-15", 
          reason: "Test with section_id: 15 (numeric)"
        },
        // Test with different field names
        {
          classId: "6",
          date_absent: "2024-01-15",
          reason: "Test with classId: 6"
        },
        {
          subjectId: "1", 
          date_absent: "2024-01-15",
          reason: "Test with subjectId: 1"
        },
        {
          sectionId: "15",
          date_absent: "2024-01-15",
          reason: "Test with sectionId: 15"
        }
      ];
      
      for (let i = 0; i < testPayloads.length; i++) {
        const payload = testPayloads[i];
        console.log(`\n--- Test ${i + 1}/${testPayloads.length} ---`);
        console.log('Payload:', payload);
        
        try {
          const token = localStorage.getItem('token');
          const response = await fetch(`${API_BASE}/excuse-letters/submit`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
          });
          
          const responseData = await response.json();
          console.log('Response status:', response.status);
          console.log('Response data:', responseData);
          
          if (response.ok && responseData.status) {
            console.log(`✅ SUCCESS! Found working payload:`, payload);
            setSuccess(`Found working format: ${JSON.stringify(payload)}`);
            return;
          } else {
            console.log(`❌ Failed: ${responseData.message || 'Unknown error'}`);
          }
          
        } catch (error) {
          console.log(`❌ Error: ${error.message}`);
        }
      }
      
      setError('All test cases failed. Backend may have different requirements.');
      
    } catch (error) {
      console.error('Test error:', error);
      setError('Test failed: ' + error.message);
    } finally {
      setSubmitLoading(false);
    }
  };

  // Test function to find the correct field for excuse letter submission using your exact API response
  const testYourExactApiResponse = async () => {
    try {
      setSubmitLoading(true);
      clearMessages();
      
      console.log('=== TESTING YOUR EXACT API RESPONSE ===');
      
      // Based on your exact API response for "Advanced OOP"
      const advancedOOPClass = {
        class_id: "6",
        subject_id: "1", 
        teacher_id: "TEA6860CA834786E482",
        section_id: "15",
        semester: "1st Semester",
        school_year: "2024-2025",
        status: "active",
        date_created: "2025-07-31 14:01:36",
        is_active: "1",
        subject_code: "CS101",
        subject_name: "Advanced OOP",
        teacher_name: "Joel Quiambao",
        section_name: "BSIT 1Z",
        class_code: "J56NHD",
        title: "OOP BSIT1z",
        is_enrolled: true
      };
      
      console.log('Testing with Advanced OOP class data:', advancedOOPClass);
      
      // Test all possible field combinations
      const testPayloads = [
        // Test with class_id field
        {
          class_id: advancedOOPClass.class_id,
          date_absent: "2024-01-15",
          reason: "Test with class_id from API"
        },
        // Test with subject_id field
        {
          subject_id: advancedOOPClass.subject_id,
          date_absent: "2024-01-15",
          reason: "Test with subject_id from API"
        },
        // Test with section_id field
        {
          section_id: advancedOOPClass.section_id,
          date_absent: "2024-01-15",
          reason: "Test with section_id from API"
        },
        // Test with class_code field
        {
          class_code: advancedOOPClass.class_code,
          date_absent: "2024-01-15",
          reason: "Test with class_code from API"
        },
        // Test with subject_code field
        {
          subject_code: advancedOOPClass.subject_code,
          date_absent: "2024-01-15",
          reason: "Test with subject_code from API"
        },
        // Test with numeric versions
        {
          class_id: Number(advancedOOPClass.class_id),
          date_absent: "2024-01-15",
          reason: "Test with class_id (numeric) from API"
        },
        {
          subject_id: Number(advancedOOPClass.subject_id),
          date_absent: "2024-01-15",
          reason: "Test with subject_id (numeric) from API"
        },
        {
          section_id: Number(advancedOOPClass.section_id),
          date_absent: "2024-01-15",
          reason: "Test with section_id (numeric) from API"
        },
        // Test with different field names
        {
          classId: advancedOOPClass.class_id,
          date_absent: "2024-01-15",
          reason: "Test with classId from API"
        },
        {
          subjectId: advancedOOPClass.subject_id,
          date_absent: "2024-01-15",
          reason: "Test with subjectId from API"
        },
        {
          sectionId: advancedOOPClass.section_id,
          date_absent: "2024-01-15",
          reason: "Test with sectionId from API"
        },
        // Test with multiple fields (maybe backend expects combination)
        {
          class_id: advancedOOPClass.class_id,
          subject_id: advancedOOPClass.subject_id,
          date_absent: "2024-01-15",
          reason: "Test with class_id + subject_id from API"
        },
        {
          class_id: advancedOOPClass.class_id,
          section_id: advancedOOPClass.section_id,
          date_absent: "2024-01-15",
          reason: "Test with class_id + section_id from API"
        }
      ];
      
      for (let i = 0; i < testPayloads.length; i++) {
        const payload = testPayloads[i];
        console.log(`\n--- Test ${i + 1}/${testPayloads.length} ---`);
        console.log('Payload:', payload);
        
        try {
          const token = localStorage.getItem('token');
          const response = await fetch(`${API_BASE}/excuse-letters/submit`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
          });
          
          const responseData = await response.json();
          console.log('Response status:', response.status);
          console.log('Response data:', responseData);
          
          if (response.ok && responseData.status) {
            console.log(`✅ SUCCESS! Found working payload:`, payload);
            setSuccess(`Found working format: ${JSON.stringify(payload)}`);
            return;
          } else {
            console.log(`❌ Failed: ${responseData.message || 'Unknown error'}`);
          }
          
        } catch (error) {
          console.log(`❌ Error: ${error.message}`);
        }
      }
      
      setError('All test cases failed. Backend may have different requirements.');
      
    } catch (error) {
      console.error('Test error:', error);
      setError('Test failed: ' + error.message);
    } finally {
      setSubmitLoading(false);
    }
  };

  const loadStudentClasses = async () => {
    try {
      setLoadingClasses(true);
      console.log('Loading student classes...');
      const response = await apiService.getStudentClasses();
      console.log('Raw API response:', response);
      
      if (response.status && response.data) {
        console.log('Student classes fetched:', response.data);
        
        // Handle different possible data structures
        let classesData = response.data;
        if (Array.isArray(response.data)) {
          classesData = response.data;
        } else if (response.data.classes && Array.isArray(response.data.classes)) {
          classesData = response.data.classes;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          classesData = response.data.data;
        }
        
        console.log('Processed classes data:', classesData);
        
        // Filter only enrolled classes (is_enrolled === true)
        const enrolledOnly = classesData.filter(cls => cls.is_enrolled === true);
        console.log('Enrolled classes only:', enrolledOnly);
        
        // Transform API data using the correct class_id from the API response
        const transformedClasses = enrolledOnly.map((cls, index) => {
          console.log(`Processing class ${index}:`, cls.subject_name || cls.subject || cls.name);
          
          // Try to find the correct class_id field for excuse letter submission
          // The API might return different field names, so we need to check multiple possibilities
          let classId = null;
          
          // Priority order for class_id fields (based on discovery functions)
          if (cls.id !== undefined && cls.id !== null) {
            classId = String(cls.id);
          } else if (cls.class_id !== undefined && cls.class_id !== null) {
            classId = String(cls.class_id);
          } else if (cls.classId !== undefined && cls.classId !== null) {
            classId = String(cls.classId);
          } else if (cls.subject_id !== undefined && cls.subject_id !== null) {
            classId = String(cls.subject_id);
          } else if (cls.subjectId !== undefined && cls.subjectId !== null) {
            classId = String(cls.subjectId);
          } else if (cls.section_id !== undefined && cls.section_id !== null) {
            classId = String(cls.section_id);
          } else if (cls.sectionId !== undefined && cls.sectionId !== null) {
            classId = String(cls.sectionId);
          }
          
          console.log(`Class ${index} class_id from API:`, classId);
          console.log(`Class ${index} full data:`, cls);
          
          const transformed = {
            original: cls,
            class_id: classId,
            subject_name: cls.subject_name || cls.subject || cls.name || 'Unknown Subject',
            subject_code: cls.subject_code || cls.code || cls.subjectCode || cls.course_code || cls.courseCode || 'N/A',
            section_name: cls.section_name || cls.section || cls.section_name || 'Unknown Section',
            teacher_name: cls.teacher_name || cls.teacher || cls.teacher_name || 'Unknown Teacher',
            class_code: cls.class_code || cls.code || cls.class_code || 'N/A',
            semester: cls.semester || 'N/A',
            school_year: cls.school_year || 'N/A',
            enrolled_at: cls.enrolled_at || 'N/A',
            is_enrolled: cls.is_enrolled || false
          };
          
          console.log(`Final class ${index} with class_id:`, classId);
          return transformed;
        });
        
        console.log('Final transformed classes:', transformedClasses);
        setAvailableClasses(transformedClasses);
        
                  // Show success message if classes were loaded
          if (transformedClasses.length > 0) {
            setSuccess(`Successfully loaded ${transformedClasses.length} class(es)`);
          }
      } else {
        console.log('No classes data received from server');
        setAvailableClasses([]);
      }
    } catch (error) {
      console.error("Error loading student classes:", error);
      setError("Failed to load classes: " + error.message);
      setAvailableClasses([]);
    } finally {
      setLoadingClasses(false);
    }
  };

  const loadExcuseLetters = async () => {
    try {
      setLoading(true);
      clearMessages();
      console.log('Loading excuse letters...');

      const response = await apiService.getStudentExcuseLetters({});
      console.log('Excuse letters response:', response);

      if (response.status && response.data) {
        setExcuseLetters(response.data.excuse_letters || []);
        setSummary(response.data.summary || { pending: 0, approved: 0, rejected: 0, total: 0 });
      } else {
        setError("Failed to load excuse letters");
      }
    } catch (error) {
      console.error("Error loading excuse letters:", error);
      setError(error.message || "Failed to load excuse letters");
    } finally {
      setLoading(false);
    }
  };

  // Function to get status badge
  const getStatusBadge = (status) => {
    const statusColors = {
      'pending': 'warning',
      'approved': 'success',
      'rejected': 'danger'
    };
    
    const statusText = {
      'pending': 'Pending',
      'approved': 'Approved',
      'rejected': 'Rejected'
    };
    
    return (
      <Badge color={statusColors[status] || 'secondary'} className="font-weight-bold">
        {statusText[status] || status}
      </Badge>
    );
  };

  // Helper function to get attachment URL
  const getAttachmentUrl = (letter) => {
    if (letter.image_path) {
      const baseUrl = 'http://localhost/scms_new_backup/';
      return `${baseUrl}${letter.image_path}`;
    }
    return null;
  };

  // Function to open attachment preview
  const openAttachmentPreview = (letter) => {
    const attachmentUrl = getAttachmentUrl(letter);
    if (attachmentUrl) {
      setSelectedAttachment({ letter, url: attachmentUrl });
      setAttachmentModalOpen(true);
    }
  };

  // Handle file input change
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSubmitForm({ ...submitForm, attachment: file });
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log('Form input change:', name, value);
    setSubmitForm(prev => {
      const updated = { ...prev, [name]: value };
      console.log('Updated submitForm:', updated);
      return updated;
    });
  };

  // Handle class selection from dropdown
  const handleClassSelection = (selectedClass) => {
    console.log('Class selected:', selectedClass);
    console.log('Selected class_id:', selectedClass.class_id);
    console.log('Selected class_id type:', typeof selectedClass.class_id);
    
    // Ensure class_id is a string
    const classId = String(selectedClass.class_id);
    console.log('Formatted class_id:', classId);
    
    setSubmitForm(prev => {
      const updated = { ...prev, class_id: classId };
      console.log('Updated submitForm after class selection:', updated);
      return updated;
    });
  };

  // Submit excuse letter
  const handleSubmitExcuseLetter = async (e) => {
    e.preventDefault();
    try {
      setSubmitLoading(true);
      clearMessages();

      console.log('=== FORM SUBMISSION DEBUG ===');
      console.log('Current submitForm:', submitForm);
      console.log('Selected class_id:', submitForm.class_id);
      console.log('Selected class_id type:', typeof submitForm.class_id);
      console.log('Available classes:', availableClasses);
      
      // Find the selected class object
      const selectedClass = availableClasses.find(cls => cls.class_id === submitForm.class_id);
      console.log('Selected class object:', selectedClass);

      // Validate required fields with better error messages
      if (!submitForm.class_id || submitForm.class_id === "") {
        console.error('class_id is missing or empty');
        setError("Please select a class from the dropdown");
        return;
      }
      
      if (!submitForm.date_absent || submitForm.date_absent === "") {
        console.error('date_absent is missing or empty');
        setError("Please select an absent date");
        return;
      }
      
      if (!submitForm.reason || submitForm.reason.trim() === "") {
        console.error('reason is missing or empty');
        setError("Please provide a reason for your absence");
        return;
      }

      console.log('All required fields are present');
      console.log('Submitting with data:', {
        class_id: submitForm.class_id,
        date_absent: submitForm.date_absent,
        reason: submitForm.reason,
        has_attachment: !!submitForm.attachment
      });

      let response;
      
      if (submitForm.attachment) {
        // Submit with attachment using FormData
        const formData = new FormData();
        formData.append('class_id', submitForm.class_id);
        formData.append('date_absent', submitForm.date_absent);
        formData.append('reason', submitForm.reason);
        formData.append('attachment', submitForm.attachment);

        console.log('Submitting with attachment using class_id:', submitForm.class_id);
        response = await apiService.submitExcuseLetterWithAttachment(formData);
      } else {
        // Submit without attachment using JSON
        console.log('Submitting without attachment using class_id:', submitForm.class_id);
        const submitData = {
          class_id: submitForm.class_id,
          date_absent: submitForm.date_absent,
          reason: submitForm.reason
        };
        console.log('Submit data:', submitData);
        response = await apiService.submitExcuseLetter(submitData);
      }

      console.log('Submit response:', response);

      if (response.status) {
        setSuccess("Excuse letter submitted successfully!");
        setSubmitForm({
          class_id: "",
          date_absent: "",
          reason: "",
          attachment: null
        });
        loadExcuseLetters(); // Reload the list
      } else {
        // If the first attempt fails, try with different class_id fields from the original API response
        if (selectedClass && selectedClass.original) {
          console.log('First attempt failed, trying with different class_id fields...');
          
          // Try different possible class_id fields from the original API response
          const possibleClassIds = [
            selectedClass.original.id,
            selectedClass.original.class_id,
            selectedClass.original.classId,
            selectedClass.original.subject_id,
            selectedClass.original.subjectId,
            selectedClass.original.section_id,
            selectedClass.original.sectionId,
            // Also try numeric versions
            selectedClass.original.id ? Number(selectedClass.original.id) : null,
            selectedClass.original.class_id ? Number(selectedClass.original.class_id) : null,
            selectedClass.original.subject_id ? Number(selectedClass.original.subject_id) : null,
            selectedClass.original.section_id ? Number(selectedClass.original.section_id) : null
          ].filter(id => id !== undefined && id !== null && String(id) !== submitForm.class_id);
          
          console.log('Possible class_ids to try:', possibleClassIds);
          
          for (let i = 0; i < possibleClassIds.length; i++) {
            const classId = possibleClassIds[i];
            console.log(`Trying class_id ${i + 1}/${possibleClassIds.length}:`, classId);
            
            try {
              let retryResponse;
              
              if (submitForm.attachment) {
                // Retry with attachment using FormData
                const retryFormData = new FormData();
                retryFormData.append('class_id', String(classId));
                retryFormData.append('date_absent', submitForm.date_absent);
                retryFormData.append('reason', submitForm.reason);
                retryFormData.append('attachment', submitForm.attachment);
                
                retryResponse = await apiService.submitExcuseLetterWithAttachment(retryFormData);
              } else {
                // Retry without attachment using JSON
                const retryData = {
                  class_id: String(classId),
                  date_absent: submitForm.date_absent,
                  reason: submitForm.reason
                };
                console.log('Retry data:', retryData);
                
                retryResponse = await apiService.submitExcuseLetter(retryData);
              }
              
              console.log('Retry response:', retryResponse);
              
              if (retryResponse.status) {
                console.log('SUCCESS! Found working class_id:', classId);
                setSuccess("Excuse letter submitted successfully!");
                setSubmitForm({
                  class_id: "",
                  date_absent: "",
                  reason: "",
                  attachment: null
                });
                loadExcuseLetters(); // Reload the list
                return;
              }
            } catch (retryError) {
              console.log(`Retry attempt ${i + 1} failed:`, retryError.message);
            }
          }
        }
        
        setError(response.message || "Failed to submit excuse letter");
      }
    } catch (error) {
      console.error("Error submitting excuse letter:", error);
      setError(error.message || "Failed to submit excuse letter");
    } finally {
      setSubmitLoading(false);
    }
  };

  // Delete excuse letter
  const handleDeleteExcuseLetter = async () => {
    try {
      setLoading(true);
      clearMessages();

      const response = await apiService.deleteExcuseLetter(letterToDelete.letter_id);

      if (response.status) {
        setSuccess("Excuse letter deleted successfully!");
        setDeleteModalOpen(false);
        setLetterToDelete(null);
        loadExcuseLetters(); // Reload the list
      } else {
        setError(response.message || "Failed to delete excuse letter");
      }
    } catch (error) {
      console.error("Error deleting excuse letter:", error);
      setError(error.message || "Failed to delete excuse letter");
    } finally {
      setLoading(false);
    }
  };

  // Open delete confirmation modal
  const openDeleteModal = (letter) => {
    setLetterToDelete(letter);
    setDeleteModalOpen(true);
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: 24 }}>
      {/* Header */}
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontWeight: 700, fontSize: 22, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span role="img" aria-label="note">📝</span> Submit Excuse Letter
        </div>
        <div style={{ color: '#666', fontSize: 14, marginTop: 2 }}>
          If you were absent, you may upload a valid excuse here for teacher review.
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert color="danger" className="mb-4">
          <i className="fas fa-exclamation-triangle mr-2" />
          {error}
        </Alert>
      )}

      {/* Success Alert */}
      {success && (
        <Alert color="success" className="mb-4">
          <i className="fas fa-check-circle mr-2" />
          {success}
        </Alert>
      )}

      {/* Summary Cards */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        <div style={{ 
          background: '#fff', 
          borderRadius: 8, 
          padding: '16px 20px', 
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)', 
          flex: 1, 
          minWidth: 120,
          textAlign: 'center'
        }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#007bff', marginBottom: 4 }}>
            {summary.total}
          </div>
          <div style={{ fontSize: 12, color: '#666' }}>Total Letters</div>
        </div>
        
        <div style={{ 
          background: '#fff', 
          borderRadius: 8, 
          padding: '16px 20px', 
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)', 
          flex: 1, 
          minWidth: 120,
          textAlign: 'center'
        }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#ff9800', marginBottom: 4 }}>
            {summary.pending}
          </div>
          <div style={{ fontSize: 12, color: '#666' }}>Pending</div>
        </div>
        
        <div style={{ 
          background: '#fff', 
          borderRadius: 8, 
          padding: '16px 20px', 
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)', 
          flex: 1, 
          minWidth: 120,
          textAlign: 'center'
        }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#4caf50', marginBottom: 4 }}>
            {summary.approved}
          </div>
          <div style={{ fontSize: 12, color: '#666' }}>Approved</div>
        </div>
        
        <div style={{ 
          background: '#fff', 
          borderRadius: 8, 
          padding: '16px 20px', 
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)', 
          flex: 1, 
          minWidth: 120,
          textAlign: 'center'
        }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#f44336', marginBottom: 4 }}>
            {summary.rejected}
          </div>
          <div style={{ fontSize: 12, color: '#666' }}>Rejected</div>
        </div>
      </div>

      {/* Loading Spinner */}
      {loading && (
        <div className="text-center mb-4">
          <Spinner color="primary" />
          <span className="ml-2">Loading excuse letters...</span>
        </div>
      )}

      {/* Landscape Flex Layout */}
      <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start', flexWrap: 'wrap' }} className="excuse-landscape-flex">
        {/* Excuse Letter Form */}
                 <form onSubmit={handleSubmitExcuseLetter} style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #0001', padding: 20, marginBottom: 32, flex: 1, minWidth: 320, maxWidth: 480 }}>
           <div style={{ marginBottom: 14 }}>
             <label style={{ fontWeight: 600, fontSize: 14, marginBottom: 8, display: 'block' }}>Class</label>
             {!loadingClasses && availableClasses.length === 0 && (
               <div style={{ marginBottom: 8 }}>
                 <button 
                   type="button" 
                   onClick={retryLoadClasses}
                   style={{ 
                     background: '#007bff', 
                     color: '#fff', 
                     border: 'none', 
                     borderRadius: 4, 
                     padding: '4px 8px', 
                     fontSize: 12, 
                     cursor: 'pointer' 
                   }}
                 >
                   Retry Loading Classes
                 </button>
                                   <button 
                    type="button" 
                    onClick={() => {
                      console.log('Current availableClasses:', availableClasses);
                      console.log('Current submitForm:', submitForm);
                    }}
                    style={{ 
                      background: '#28a745', 
                      color: '#fff', 
                      border: 'none', 
                      borderRadius: 4, 
                      padding: '4px 8px', 
                      fontSize: 12, 
                      cursor: 'pointer',
                      marginLeft: 8
                    }}
                  >
                    Debug Classes
                  </button>
                  <button 
                    type="button" 
                    onClick={() => {
                      console.log('=== FORM STATE DEBUG ===');
                      console.log('submitForm:', submitForm);
                      console.log('submitForm.class_id:', submitForm.class_id);
                      console.log('submitForm.class_id type:', typeof submitForm.class_id);
                      console.log('submitForm.class_id length:', submitForm.class_id ? submitForm.class_id.length : 'undefined');
                      console.log('Available classes:', availableClasses);
                      console.log('Selected class:', availableClasses.find(cls => cls.class_id === submitForm.class_id));
                    }}
                    style={{ 
                      background: '#dc3545', 
                      color: '#fff', 
                      border: 'none', 
                      borderRadius: 4, 
                      padding: '4px 8px', 
                      fontSize: 12, 
                      cursor: 'pointer',
                      marginLeft: 8
                    }}
                  >
                    Debug Form State
                  </button>
                  <button 
                    type="button" 
                    onClick={() => {
                      console.log('=== TEST FORM SUBMISSION ===');
                      console.log('Testing form submission with current data...');
                      console.log('Form data:', submitForm);
                      
                      // Test if we can submit with current data
                      if (submitForm.class_id && submitForm.date_absent && submitForm.reason) {
                        console.log('Form appears to be valid, testing submission...');
                        // Trigger form submission
                        document.querySelector('form[onsubmit]').dispatchEvent(new Event('submit'));
                      } else {
                        console.log('Form is missing required fields:');
                        console.log('- class_id:', submitForm.class_id);
                        console.log('- date_absent:', submitForm.date_absent);
                        console.log('- reason:', submitForm.reason);
                      }
                    }}
                    style={{ 
                      background: '#fd7e14', 
                      color: '#fff', 
                      border: 'none', 
                      borderRadius: 4, 
                      padding: '4px 8px', 
                      fontSize: 12, 
                      cursor: 'pointer',
                      marginLeft: 8
                    }}
                  >
                    Test Form Submission
                  </button>
                  <button 
                    type="button" 
                    onClick={testApiResponse}
                    style={{ 
                      background: '#ff9800', 
                      color: '#fff', 
                      border: 'none', 
                      borderRadius: 4, 
                      padding: '4px 8px', 
                      fontSize: 12, 
                      cursor: 'pointer',
                      marginLeft: 8
                    }}
                  >
                    Test API
                  </button>
                  <button 
                    type="button" 
                    onClick={testClassSubmission}
                    style={{ 
                      background: '#6c757d', 
                      color: '#fff', 
                      border: 'none', 
                      borderRadius: 4, 
                      padding: '4px 8px', 
                      fontSize: 12, 
                      cursor: 'pointer',
                      marginLeft: 8
                    }}
                  >
                    Test Class Submission
                  </button>
                  <button 
                    type="button" 
                    onClick={testManualSubmission}
                    style={{ 
                      background: '#17a2b8', 
                      color: '#fff', 
                      border: 'none', 
                      borderRadius: 4, 
                      padding: '4px 8px', 
                      fontSize: 12, 
                      cursor: 'pointer',
                      marginLeft: 8
                    }}
                  >
                    Test Manual Submission
                  </button>
                  <button 
                    type="button" 
                    onClick={testDirectAPI}
                    style={{ 
                      background: '#4caf50', 
                      color: '#fff', 
                      border: 'none', 
                      borderRadius: 4, 
                      padding: '4px 8px', 
                      fontSize: 12, 
                      cursor: 'pointer',
                      marginLeft: 8
                    }}
                  >
                    Test Direct API
                  </button>
                  <button 
                    type="button" 
                    onClick={checkAuthStatus}
                    style={{ 
                      background: '#17a2b8', 
                      color: '#fff', 
                      border: 'none', 
                      borderRadius: 4, 
                      padding: '4px 8px', 
                      fontSize: 12, 
                      cursor: 'pointer',
                      marginLeft: 8
                    }}
                  >
                    Check Auth Status
                  </button>
                  <button 
                    type="button" 
                    onClick={findCorrectClassId}
                    style={{ 
                      background: '#e83e8c', 
                      color: '#fff', 
                      border: 'none', 
                      borderRadius: 4, 
                      padding: '4px 8px', 
                      fontSize: 12, 
                      cursor: 'pointer',
                      marginLeft: 8
                    }}
                  >
                    Find Correct Class ID
                  </button>
                  <button 
                    type="button" 
                    onClick={findCorrectNumericClassId}
                    style={{ 
                      background: '#17a2b8', 
                      color: '#fff', 
                      border: 'none', 
                      borderRadius: 4, 
                      padding: '4px 8px', 
                      fontSize: 12, 
                      cursor: 'pointer',
                      marginLeft: 8
                    }}
                  >
                    Find Correct Numeric Class ID
                  </button>
                  <button 
                    type="button" 
                    onClick={autoFixClassIds}
                    style={{ 
                      background: '#28a745', 
                      color: '#fff', 
                      border: 'none', 
                      borderRadius: 4, 
                      padding: '4px 8px', 
                      fontSize: 12, 
                      cursor: 'pointer',
                      marginLeft: 8
                    }}
                  >
                    Auto Fix Class IDs
                  </button>
                  <button 
                    type="button" 
                    onClick={setWorkingClassId}
                    style={{ 
                      background: '#fd7e14', 
                      color: '#fff', 
                      border: 'none', 
                      borderRadius: 4, 
                      padding: '4px 8px', 
                      fontSize: 12, 
                      cursor: 'pointer',
                      marginLeft: 8
                    }}
                  >
                    Set Working Class ID
                  </button>
                  <button 
                    type="button" 
                    onClick={testAllPossibleClassIds}
                    style={{ 
                      background: '#dc3545', 
                      color: '#fff', 
                      border: 'none', 
                      borderRadius: 4, 
                      padding: '4px 8px', 
                      fontSize: 12, 
                      cursor: 'pointer',
                      marginLeft: 8
                    }}
                  >
                    Test All Class IDs
                  </button>
                  <button 
                    type="button" 
                    onClick={testExactApiStructure}
                    style={{ 
                      background: '#6f42c1', 
                      color: '#fff', 
                      border: 'none', 
                      borderRadius: 4, 
                      padding: '4px 8px', 
                      fontSize: 12, 
                      cursor: 'pointer',
                      marginLeft: 8
                    }}
                  >
                    Test Exact API Structure
                  </button>
                  <button 
                    type="button" 
                    onClick={testYourExactApiResponse}
                    style={{ 
                      background: '#fd7e14', 
                      color: '#fff', 
                      border: 'none', 
                      borderRadius: 4, 
                      padding: '4px 8px', 
                      fontSize: 12, 
                      cursor: 'pointer',
                      marginLeft: 8
                    }}
                  >
                    Test Your API Response
                  </button>
                  <button 
                    type="button" 
                    onClick={() => discoverCorrectClassId("Design")}
                    style={{ 
                      background: '#6f42c1', 
                      color: '#fff', 
                      border: 'none', 
                      borderRadius: 4, 
                      padding: '4px 8px', 
                      fontSize: 12, 
                      cursor: 'pointer',
                      marginLeft: 8
                    }}
                  >
                    Discover Design Class ID
                  </button>
                  <button 
                    type="button" 
                    onClick={() => discoverCorrectClassId("System")}
                    style={{ 
                      background: '#6f42c1', 
                      color: '#fff', 
                      border: 'none', 
                      borderRadius: 4, 
                      padding: '4px 8px', 
                      fontSize: 12, 
                      cursor: 'pointer',
                      marginLeft: 8
                    }}
                  >
                    Discover System Class ID
                  </button>
                  <button 
                    type="button" 
                    onClick={discoverAllCorrectClassIds}
                    style={{ 
                      background: '#28a745', 
                      color: '#fff', 
                      border: 'none', 
                      borderRadius: 4, 
                      padding: '4px 8px', 
                      fontSize: 12, 
                      cursor: 'pointer',
                      marginLeft: 8
                    }}
                  >
                    Discover All Class IDs
                  </button>
                  <button 
                    type="button" 
                    onClick={() => {
                      const className = prompt("Enter the class name to discover its class_id:");
                      if (className) {
                        discoverCorrectClassId(className);
                      }
                    }}
                    style={{ 
                      background: '#17a2b8', 
                      color: '#fff', 
                      border: 'none', 
                      borderRadius: 4, 
                      padding: '4px 8px', 
                      fontSize: 12, 
                      cursor: 'pointer',
                      marginLeft: 8
                    }}
                  >
                    Discover Custom Class ID
                  </button>
                  <button 
                    type="button" 
                    onClick={() => {
                      console.log('Original API data structure:');
                      availableClasses.forEach((cls, index) => {
                        console.log(`Class ${index} original:`, cls.original);
                        console.log(`Class ${index} possible_class_ids:`, cls.possible_class_ids);
                      });
                    }}
                    style={{ 
                      background: '#17a2b8', 
                      color: '#fff', 
                      border: 'none', 
                      borderRadius: 4, 
                      padding: '4px 8px', 
                      fontSize: 12, 
                      cursor: 'pointer',
                      marginLeft: 8
                    }}
                  >
                    Show Original Data
                  </button>
                  <button 
                    type="button" 
                    onClick={() => {
                      console.log('=== RAW API DATA STRUCTURE ===');
                      availableClasses.forEach((cls, index) => {
                        console.log(`Class ${index} raw data:`, cls.original);
                        console.log(`Class ${index} all keys:`, Object.keys(cls.original));
                        console.log(`Class ${index} subject-related fields:`);
                        console.log('  - subject_code:', cls.original.subject_code);
                        console.log('  - code:', cls.original.code);
                        console.log('  - subjectCode:', cls.original.subjectCode);
                        console.log('  - course_code:', cls.original.course_code);
                        console.log('  - courseCode:', cls.original.courseCode);
                        console.log('  - subject_name:', cls.original.subject_name);
                        console.log('  - subject:', cls.original.subject);
                        console.log('  - name:', cls.original.name);
                      });
                    }}
                    style={{ 
                      background: '#6f42c1', 
                      color: '#fff', 
                      border: 'none', 
                      borderRadius: 4, 
                      padding: '4px 8px', 
                      fontSize: 12, 
                      cursor: 'pointer',
                      marginLeft: 8
                    }}
                  >
                    Show Raw Data Structure
                  </button>
                  <button 
                    type="button" 
                    onClick={() => {
                      // Manually set class_id to "5" since that worked in the API test
                      if (availableClasses.length > 0) {
                        const testClass = availableClasses[0];
                        console.log('Manually setting class_id to "5" for testing');
                        setSubmitForm(prev => ({
                          ...prev,
                          class_id: "5"
                        }));
                        setSuccess('Manually set class_id to "5" for testing');
                      }
                    }}
                    style={{ 
                      background: '#e83e8c', 
                      color: '#fff', 
                      border: 'none', 
                      borderRadius: 4, 
                      padding: '4px 8px', 
                      fontSize: 12, 
                      cursor: 'pointer',
                      marginLeft: 8
                    }}
                  >
                    Set Class ID to "5"
                  </button>
                  <button 
                    type="button" 
                    onClick={() => {
                      // Set the exact data that worked in Postman
                      console.log('Setting exact Postman test data');
                      setSubmitForm(prev => ({
                        ...prev,
                        class_id: "5",
                        date_absent: "2025-08-10",
                        reason: "Aguinaldo Day"
                      }));
                      setSuccess('Set exact Postman test data');
                    }}
                    style={{ 
                      background: '#28a745', 
                      color: '#fff', 
                      border: 'none', 
                      borderRadius: 4, 
                      padding: '4px 8px', 
                      fontSize: 12, 
                      cursor: 'pointer',
                      marginLeft: 8
                    }}
                  >
                    Set Postman Test Data
                  </button>
               </div>
             )}
                           <Dropdown>
                <Dropdown.Toggle 
                  variant="secondary" 
                  id="dropdown-basic"
                  disabled={loadingClasses}
                  style={{ 
                    width: "100%", 
                    maxWidth: "100%",
                    textAlign: "left",
                    padding: '8px 12px',
                    borderRadius: 8,
                    border: '1px solid #bbb',
                    fontSize: 14,
                    background: '#fff',
                    color: '#333'
                  }}
                >
                 {submitForm.class_id ? 
                   (() => {
                     const selectedClass = availableClasses.find(cls => cls.class_id === submitForm.class_id);
                     console.log('Selected class for display:', selectedClass, 'submitForm.class_id:', submitForm.class_id);
                     return selectedClass ? 
                       `${selectedClass.subject_name} (${selectedClass.subject_code}) - ${selectedClass.section_name} [ID: ${selectedClass.class_id}]` : 
                       'Invalid class selected';
                   })()
                   : loadingClasses ? 'Loading classes...' : availableClasses.length > 0 ? 'Select class' : 'No classes available'}
               </Dropdown.Toggle>

                                                               <Dropdown.Menu style={{ width: '100%', maxWidth: '100%', maxHeight: '200px', overflowY: 'auto' }}>
                  {(() => {
                    console.log('Rendering dropdown with classes:', availableClasses);
                    
                    return availableClasses.length > 0 ? (
                      availableClasses.map((cls) => (
                       <Dropdown.Item 
                         key={cls.class_id}
                         href="#" 
                         onClick={(e) => { 
                           e.preventDefault(); 
                           console.log('Selected class:', cls);
                           handleClassSelection(cls); 
                         }}
                       >
                         {cls.subject_name} ({cls.subject_code}) - {cls.section_name} [ID: {cls.class_id}]
                       </Dropdown.Item>
                                           ))
                    ) : (
                      <Dropdown.Item disabled>
                        {loadingClasses ? 'Loading...' : 'No classes available'}
                      </Dropdown.Item>
                    );
                 })()}
               </Dropdown.Menu>
             </Dropdown>
           </div>
           

           
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontWeight: 600, fontSize: 14 }}>Absent Date</label><br />
            <input 
              type="date" 
              value={submitForm.date_absent} 
              onChange={handleInputChange}
              name="date_absent"
              required 
              style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #bbb', fontSize: 14 }} 
            />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontWeight: 600, fontSize: 14 }}>Reason</label><br />
            <textarea 
              value={submitForm.reason} 
              onChange={handleInputChange}
              name="reason"
              required 
              maxLength={300} 
              rows={3} 
              style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #bbb', fontSize: 14, resize: 'vertical' }} 
              placeholder="State your reason (max 300 characters)" 
            />
            <div style={{ textAlign: 'right', fontSize: 12, color: '#888' }}>{submitForm.reason.length}/300</div>
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontWeight: 600, fontSize: 14 }}>Supporting Photo</label><br />
            <input 
              type="file" 
              accept="image/jpeg,image/png,application/pdf" 
              onChange={handleFileChange} 
              style={{ fontSize: 14 }} 
            />
          </div>
          <button 
            type="submit" 
            disabled={submitLoading} 
            style={{ 
              width: '100%', 
              background: submitLoading ? '#bbb' : '#1976d2', 
              color: '#fff', 
              fontWeight: 700, 
              fontSize: 15, 
              border: 'none', 
              borderRadius: 8, 
              padding: '10px 0', 
              cursor: submitLoading ? 'not-allowed' : 'pointer', 
              marginTop: 8 
            }}
          >
            {submitLoading ? 'Submitting...' : 'Submit Excuse Letter'}
          </button>
        </form>

        {/* Submitted Excuses */}
                 <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #0001', padding: 18, flex: 1, minWidth: 320, maxWidth: 700 }}>
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 12 }}>Submitted Excuses</div>
          
          {loading && (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <Spinner color="primary" />
              <span style={{ marginLeft: 8 }}>Loading excuse letters...</span>
            </div>
          )}

          {!loading && excuseLetters.length === 0 && (
            <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
              No excuse letters found.
            </div>
          )}

          {!loading && excuseLetters.length > 0 && (
                         <div style={{ width: '100%' }}>
               <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
                <thead>
                  <tr style={{ background: '#f7fafd' }}>
                    <th style={{ textAlign: 'left', padding: '10px 8px', fontSize: 13, color: '#888', fontWeight: 700, width: '12%' }}>Date</th>
                    <th style={{ textAlign: 'left', padding: '10px 8px', fontSize: 13, color: '#888', fontWeight: 700, width: '18%' }}>Class</th>
                    <th style={{ textAlign: 'left', padding: '10px 8px', fontSize: 13, color: '#888', fontWeight: 700, width: '35%' }}>Reason</th>
                    <th style={{ textAlign: 'left', padding: '10px 8px', fontSize: 13, color: '#888', fontWeight: 700, width: '20%' }}>Status</th>
                    <th style={{ textAlign: 'left', padding: '10px 8px', fontSize: 13, color: '#888', fontWeight: 700, width: '15%' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {excuseLetters.map((letter) => (
                    <tr key={letter.letter_id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                      <td style={{ padding: '8px 8px', fontSize: 14 }}>
                        {new Date(letter.date_absent).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '8px 8px', fontSize: 14 }}>
                        {letter.subject_name}
                      </td>
                      <td style={{ padding: '8px 8px', fontSize: 14, wordWrap: 'break-word', wordBreak: 'break-word' }}>
                        {letter.reason}
                      </td>
                      <td style={{ padding: '8px 8px', fontSize: 14 }}>
                        {getStatusBadge(letter.status)}
                      </td>
                      <td style={{ padding: '8px 8px', fontSize: 14 }}>
                        <div style={{ display: 'flex', gap: 8 }}>
                          {letter.image_path && (
                            <button
                              onClick={() => openAttachmentPreview(letter)}
                              style={{ 
                                background: 'none', 
                                border: 'none', 
                                cursor: 'pointer', 
                                color: '#007bff',
                                fontSize: '16px'
                              }}
                              title="View attachment"
                            >
                              📎
                            </button>
                          )}
                          {letter.status === 'pending' && (
                            <button
                              onClick={() => openDeleteModal(letter)}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc3545' }}
                              title="Delete"
                            >
                              🗑️
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={deleteModalOpen} toggle={() => setDeleteModalOpen(!deleteModalOpen)}>
        <ModalHeader toggle={() => setDeleteModalOpen(!deleteModalOpen)}>
          Confirm Delete
        </ModalHeader>
        <ModalBody>
          Are you sure you want to delete this excuse letter? This action cannot be undone.
          <br />
          <strong>Date Absent:</strong> {letterToDelete && new Date(letterToDelete.date_absent).toLocaleDateString()}
          <br />
          <strong>Subject:</strong> {letterToDelete && letterToDelete.subject_name}
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={() => setDeleteModalOpen(false)}>
            Cancel
          </Button>
          <Button 
            color="danger" 
            onClick={handleDeleteExcuseLetter}
            disabled={loading}
          >
            {loading ? (
              <>
                <Spinner size="sm" className="mr-2" />
                Deleting...
              </>
            ) : (
              <>
                <FaTrash className="mr-2" />
                Delete
              </>
            )}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Attachment Preview Modal */}
      <Modal isOpen={attachmentModalOpen} toggle={() => setAttachmentModalOpen(!attachmentModalOpen)} size="lg" centered>
        <ModalHeader toggle={() => setAttachmentModalOpen(!attachmentModalOpen)}>
          Attachment Preview
        </ModalHeader>
        <ModalBody>
          {selectedAttachment && (
            <div>
              <div style={{ marginBottom: '16px' }}>
                <strong>Date:</strong> {new Date(selectedAttachment.letter.date_absent).toLocaleDateString()}
                <br />
                <strong>Subject:</strong> {selectedAttachment.letter.subject_name}
                <br />
                <strong>Reason:</strong> {selectedAttachment.letter.reason}
              </div>
              <div style={{ textAlign: 'center' }}>
                <img
                  src={selectedAttachment.url}
                  alt="Attachment"
                  style={{ 
                    maxWidth: '100%', 
                    maxHeight: '400px', 
                    cursor: 'zoom-in', 
                    borderRadius: '8px',
                    border: '1px solid #dee2e6'
                  }}
                  onClick={() => window.open(selectedAttachment.url, '_blank')}
                />
                <div style={{ marginTop: '8px', fontSize: '14px', color: '#666' }}>
                  Click the image to open in full size
                </div>
              </div>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={() => setAttachmentModalOpen(!attachmentModalOpen)}>
            Close
          </Button>
          <Button 
            color="primary" 
            onClick={() => selectedAttachment && window.open(selectedAttachment.url, '_blank')}
          >
            Open in New Tab
          </Button>
        </ModalFooter>
      </Modal>

      <style>{`
        @media (max-width: 900px) {
          .excuse-landscape-flex { flex-direction: column !important; gap: 18px !important; }
          form, .excuse-mobile-list, .excuse-landscape-flex > div { max-width: 100% !important; }
        }
                 @media (max-width: 600px) {
           table { font-size: 11px; }
           form, .excuse-mobile-list { padding: 8px !important; }
           
           /* Center the form exactly in mobile */
           .excuse-landscape-flex {
             justify-content: center !important;
             align-items: center !important;
           }
           
           .excuse-landscape-flex form {
             margin: 0 auto !important;
             max-width: 98% !important;
             min-width: auto !important;
           }
           
           .excuse-landscape-flex > div:last-child {
             margin: 0 auto !important;
             max-width: 98% !important;
             min-width: auto !important;
           }
           
           /* Mobile table adjustments */
           table th, table td {
             padding: 6px 4px !important;
             font-size: 11px !important;
           }
           
           /* Adjust column widths for mobile */
           table th:nth-child(1) { width: 12% !important; } /* Date */
           table th:nth-child(2) { width: 15% !important; } /* Class */
           table th:nth-child(3) { width: 35% !important; } /* Reason */
           table th:nth-child(4) { width: 20% !important; } /* Status */
           table th:nth-child(5) { width: 18% !important; } /* Actions */
           
           /* Ensure text wrapping in mobile */
           table td {
             word-wrap: break-word !important;
             word-break: break-word !important;
             white-space: normal !important;
           }
         }
         
         @media (max-width: 480px) {
           table { font-size: 10px; }
           
           table th, table td {
             padding: 4px 2px !important;
             font-size: 10px !important;
           }
           
           /* Even smaller column widths for very small screens */
           table th:nth-child(1) { width: 12% !important; } /* Date */
           table th:nth-child(2) { width: 15% !important; } /* Class */
           table th:nth-child(3) { width: 33% !important; } /* Reason */
           table th:nth-child(4) { width: 20% !important; } /* Status */
           table th:nth-child(5) { width: 20% !important; } /* Actions */
         }
      `}</style>
    </div>
  );
};

export default StudentExcuseLetter; 