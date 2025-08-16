import React, { useEffect, useState } from 'react';
import ApiService from '../services/api';

const ROLE_LABELS = {
  admin: 'Admins',
  teacher: 'Teachers',
  student: 'Students',
};

const UserList = () => {
  const [role, setRole] = useState('admin');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // Add state for sections
  const [sections, setSections] = useState({});

  useEffect(() => {
    setLoading(true);
    setError(null);
    
    const fetchUsersAndSections = async () => {
      try {
        const data = await ApiService.getUsersByRole(role);
        console.log('API response for users:', data);
        
        // Try to handle various possible response formats
        let usersArr = [];
        if (Array.isArray(data)) {
          usersArr = data;
        } else if (Array.isArray(data.users)) {
          usersArr = data.users;
        } else if (Array.isArray(data.data)) {
          usersArr = data.data;
        } else {
          usersArr = [];
        }
        
        // If we're fetching students, also fetch section information
        if (role === 'student') {
          const sectionIds = [...new Set(usersArr.map(user => user.section_id).filter(Boolean))];
          const sectionsData = {};
          
          for (const sectionId of sectionIds) {
            try {
              const sectionData = await ApiService.getSectionById(sectionId);
              if (sectionData && sectionData.data) {
                sectionsData[sectionId] = sectionData.data;
              }
            } catch (error) {
              console.error(`Failed to fetch section ${sectionId}:`, error);
              sectionsData[sectionId] = { name: `Section ${sectionId}`, id: sectionId };
            }
          }
          
          setSections(sectionsData);
        }
        
        setUsers(usersArr);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    
    fetchUsersAndSections();
  }, [role]);

  // Add helper function to get section name
  const getSectionName = (sectionId) => {
    if (!sectionId) return 'N/A';
    const section = sections[sectionId];
    if (section) {
      return section.name || section.section_name || `Section ${sectionId}`;
    }
    return `Section ${sectionId}`;
  };

  // Add helper function to format course and section display
  const getCourseAndSectionDisplay = (user) => {
    if (role !== 'student') {
      return user.program || 'N/A';
    }
    
    // Get course abbreviation
    const courseAbbr = getCourseAbbreviation(user.program);
    const sectionName = getSectionName(user.section_id);
    
    // Extract year level and section letter from section name
    let yearLevel = '';
    let sectionLetter = '';
    
    if (sectionName) {
      // Look for patterns like "1st Year A", "2nd Year B", etc.
      const yearMatch = sectionName.match(/(\d+)(?:st|nd|rd|th)\s+Year/);
      if (yearMatch) {
        yearLevel = yearMatch[1];
      }
      
      // Look for section letter at the end
      const letterMatch = sectionName.match(/([A-Z])$/);
      if (letterMatch) {
        sectionLetter = letterMatch[1];
      }
    }
    
    // If we couldn't extract from section name, try to get from section_id
    if (!yearLevel && !sectionLetter && user.section_id) {
      // For section_id like "15", assume it's year 1, section 5
      const sectionId = user.section_id;
      if (sectionId.length >= 2) {
        yearLevel = sectionId[0];
        sectionLetter = String.fromCharCode(64 + parseInt(sectionId.slice(1))); // Convert number to letter (1=A, 2=B, etc.)
      }
    }
    
    // Format: "BSIT 1Z"
    if (courseAbbr && yearLevel && sectionLetter) {
      return `${courseAbbr} ${yearLevel}${sectionLetter}`;
    } else if (courseAbbr && yearLevel) {
      return `${courseAbbr} ${yearLevel}`;
    } else if (courseAbbr) {
      return courseAbbr;
    }
    
    return 'N/A';
  };

  // Add helper function to get course abbreviation
  const getCourseAbbreviation = (course) => {
    if (!course) return '';
    
    const abbreviations = {
      'Bachelor of Science in Information Technology': 'BSIT',
      'Bachelor of Science in Computer Science': 'BSCS',
      'Bachelor of Science in Information Systems': 'BSIS',
      'Associate in Computer Technology': 'ACT',
      'Bachelor of Science in Information Technology': 'BSIT',
      'BSIT': 'BSIT',
      'BSCS': 'BSCS',
      'BSIS': 'BSIS',
      'ACT': 'ACT'
    };
    
    return abbreviations[course] || course;
  };

  const renderTableRows = () => {
    return users.map((user) => (
      <tr key={user.id}>
        <td>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <img
              src={user.profile_image_url || user.avatar || '/default-avatar.png'}
              alt={user.name}
              style={{ width: 40, height: 40, borderRadius: '50%', marginRight: 8 }}
            />
            <div>
              <div style={{ fontWeight: 600 }}>{user.name}</div>
              <div style={{ fontSize: 12, color: '#888' }}>ID: {user.id}</div>
            </div>
          </div>
        </td>
        <td>{user.email}</td>
        <td>
          {getCourseAndSectionDisplay(user)}
        </td>
        <td>
          <span style={{
            color: user.status === 'ACTIVE' ? '#10b981' : '#a0aec0',
            fontWeight: 500,
          }}>
            {user.status}
          </span>
        </td>
        <td>{user.last_login || '-'}</td>
        <td>
          <button style={{ marginRight: 8, background: '#4f8cff', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 12px' }}>Edit</button>
          <button style={{ background: '#ff4d4f', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 12px' }}>Delete</button>
        </td>
      </tr>
    ));
  };

  return (
    <div style={{ background: '#fff', borderRadius: 8, padding: 24 }}>
      <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
        {Object.keys(ROLE_LABELS).map((r) => (
          <button
            key={r}
            onClick={() => setRole(r)}
            style={{
              background: role === r ? '#2563eb' : '#f1f5f9',
              color: role === r ? '#fff' : '#222',
              border: 'none',
              borderRadius: 6,
              padding: '8px 24px',
              fontWeight: 600,
              fontSize: 16,
              cursor: 'pointer',
            }}
          >
            {ROLE_LABELS[r]}
          </button>
        ))}
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div style={{ color: 'red' }}>{error}</div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f9fafb' }}>
              <th style={{ textAlign: 'left', padding: 8 }}>NAME</th>
              <th style={{ textAlign: 'left', padding: 8 }}>EMAIL</th>
              <th style={{ textAlign: 'left', padding: 8 }}>{role === 'student' ? 'COURSE/YEAR/SECTION' : 'PROGRAM'}</th>
              <th style={{ textAlign: 'left', padding: 8 }}>STATUS</th>
              <th style={{ textAlign: 'left', padding: 8 }}>LAST LOGIN</th>
              <th style={{ textAlign: 'left', padding: 8 }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {renderTableRows()}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default UserList; 