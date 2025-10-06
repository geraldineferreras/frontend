import React, { useState, useEffect } from "react";
import ApiService from "../../services/api";

const TestUserData = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const testUserData = async () => {
    setLoading(true);
    setError("");
    
    try {
      console.log("=== Testing User Data ===");
      
      // Test getting users by role
      const adminUsers = await ApiService.getUsersByRole('admin');
      console.log("Admin users response:", adminUsers);
      
      if (adminUsers && adminUsers.data && adminUsers.data.length > 0) {
        const firstUser = adminUsers.data[0];
        console.log("First user object:", firstUser);
        console.log("User ID field:", firstUser.id);
        console.log("User user_id field:", firstUser.user_id);
        console.log("User userId field:", firstUser.userId);
        console.log("All user fields:", Object.keys(firstUser));
        
        setUserData(firstUser);
      } else {
        console.log("No admin users found");
        setError("No admin users found");
      }
      
    } catch (err) {
      console.error("Error testing user data:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Test User Data</h2>
      <button onClick={testUserData} disabled={loading}>
        {loading ? 'Testing...' : 'Test User Data'}
      </button>
      
      {error && (
        <div style={{ color: 'red', marginTop: '10px' }}>
          Error: {error}
        </div>
      )}
      
      {userData && (
        <div style={{ marginTop: '20px' }}>
          <h3>User Data Structure:</h3>
          <pre>{JSON.stringify(userData, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default TestUserData; 