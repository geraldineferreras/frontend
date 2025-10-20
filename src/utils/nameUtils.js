/**
 * Utility functions for name formatting and sorting
 * Ensures consistent "Last name, First name" format across all tables
 */

/**
 * Formats a user's name to "Last name, First name" format
 * Handles compound surnames like "De Jesus", "De Vera", "Dela Cruz"
 * @param {Object} user - User object with name fields
 * @returns {string} Formatted name in "Last name, First name" format
 */
export const formatUserName = (user) => {
  if (!user) return '';

  // If user has separate first_name and last_name fields
  if (user.first_name && user.last_name) {
    return `${user.last_name}, ${user.first_name}`;
  }

  // If user has full_name, try to parse it
  if (user.full_name) {
    return parseAndFormatName(user.full_name);
  }

  // Fallback to name field
  if (user.name) {
    return parseAndFormatName(user.name);
  }

  return '';
};

/**
 * Parses a full name string and formats it to "Last name, First name" format
 * Handles compound surnames with prefixes like "De", "Dela", "Del", "Van", "Von"
 * @param {string} fullName - Full name string to parse
 * @returns {string} Formatted name in "Last name, First name" format
 */
const parseAndFormatName = (fullName) => {
  if (!fullName || typeof fullName !== 'string') return fullName || '';

  const nameParts = fullName.trim().split(' ').filter(part => part.length > 0);
  
  if (nameParts.length < 2) {
    return fullName; // Return as-is if can't parse
  }

  // Common surname prefixes that should be combined with the following word
  const surnamePrefixes = ['de', 'dela', 'del', 'van', 'von', 'da', 'dos', 'das'];
  
  // Start from the end and work backwards to find the surname
  let surnameParts = [];
  let i = nameParts.length - 1;
  
  // Get the last part (always part of surname)
  surnameParts.unshift(nameParts[i]);
  i--;
  
  // Check if the previous part is a surname prefix
  while (i >= 0 && surnamePrefixes.includes(nameParts[i].toLowerCase())) {
    surnameParts.unshift(nameParts[i]);
    i--;
  }
  
  // Everything remaining is the first name
  const firstName = i >= 0 ? nameParts.slice(0, i + 1).join(' ') : '';
  const lastName = surnameParts.join(' ');
  
  return firstName ? `${lastName}, ${firstName}` : lastName;
};

/**
 * Extracts last name from a user object for sorting purposes
 * Handles compound surnames properly
 * @param {Object} user - User object with name fields
 * @returns {string} Last name for sorting
 */
export const getLastNameForSorting = (user) => {
  if (!user) return '';

  // If user has separate first_name and last_name fields
  if (user.last_name) {
    return user.last_name.toLowerCase();
  }

  // Extract last name using the same logic as formatting
  const fullName = user.full_name || user.name || '';
  if (fullName) {
    return extractLastName(fullName).toLowerCase();
  }

  return '';
};

/**
 * Extracts last name from a full name string, handling compound surnames
 * @param {string} fullName - Full name string
 * @returns {string} Last name (including prefixes like "De", "Dela")
 */
const extractLastName = (fullName) => {
  if (!fullName || typeof fullName !== 'string') return '';

  const nameParts = fullName.trim().split(' ').filter(part => part.length > 0);
  
  if (nameParts.length < 2) {
    return fullName;
  }

  // Common surname prefixes that should be combined with the following word
  const surnamePrefixes = ['de', 'dela', 'del', 'van', 'von', 'da', 'dos', 'das'];
  
  // Start from the end and work backwards to find the surname
  let surnameParts = [];
  let i = nameParts.length - 1;
  
  // Get the last part (always part of surname)
  surnameParts.unshift(nameParts[i]);
  i--;
  
  // Check if the previous part is a surname prefix
  while (i >= 0 && surnamePrefixes.includes(nameParts[i].toLowerCase())) {
    surnameParts.unshift(nameParts[i]);
    i--;
  }
  
  return surnameParts.join(' ');
};

/**
 * Extracts first name from a user object for sorting purposes
 * Handles compound surnames properly
 * @param {Object} user - User object with name fields
 * @returns {string} First name for sorting
 */
export const getFirstNameForSorting = (user) => {
  if (!user) return '';

  // If user has separate first_name and last_name fields
  if (user.first_name) {
    return user.first_name.toLowerCase();
  }

  // Extract first name using the same logic as formatting
  const fullName = user.full_name || user.name || '';
  if (fullName) {
    return extractFirstName(fullName).toLowerCase();
  }

  return '';
};

/**
 * Extracts first name from a full name string, handling compound surnames
 * @param {string} fullName - Full name string
 * @returns {string} First name (everything before the compound surname)
 */
const extractFirstName = (fullName) => {
  if (!fullName || typeof fullName !== 'string') return '';

  const nameParts = fullName.trim().split(' ').filter(part => part.length > 0);
  
  if (nameParts.length < 2) {
    return fullName;
  }

  // Common surname prefixes that should be combined with the following word
  const surnamePrefixes = ['de', 'dela', 'del', 'van', 'von', 'da', 'dos', 'das'];
  
  // Start from the end and work backwards to find the surname
  let i = nameParts.length - 1;
  
  // Get the last part (always part of surname)
  i--;
  
  // Check if the previous part is a surname prefix
  while (i >= 0 && surnamePrefixes.includes(nameParts[i].toLowerCase())) {
    i--;
  }
  
  // Everything remaining is the first name
  return i >= 0 ? nameParts.slice(0, i + 1).join(' ') : '';
};

/**
 * Sorts an array of users alphabetically by last name, then by first name
 * @param {Array} users - Array of user objects
 * @returns {Array} Sorted array of users
 */
export const sortUsersByName = (users) => {
  if (!Array.isArray(users)) return [];

  return [...users].sort((a, b) => {
    const lastNameA = getLastNameForSorting(a);
    const lastNameB = getLastNameForSorting(b);
    
    // First sort by last name
    if (lastNameA < lastNameB) return -1;
    if (lastNameA > lastNameB) return 1;
    
    // If last names are equal, sort by first name
    const firstNameA = getFirstNameForSorting(a);
    const firstNameB = getFirstNameForSorting(b);
    
    if (firstNameA < firstNameB) return -1;
    if (firstNameA > firstNameB) return 1;
    
    return 0;
  });
};

/**
 * Filters users based on search term (searches both formatted and original names)
 * @param {Array} users - Array of user objects
 * @param {string} searchTerm - Search term
 * @returns {Array} Filtered array of users
 */
export const filterUsersByName = (users, searchTerm) => {
  if (!Array.isArray(users) || !searchTerm) return users;

  const lowerSearchTerm = searchTerm.toLowerCase();
  
  return users.filter(user => {
    const formattedName = formatUserName(user);
    const originalName = user.full_name || user.name || '';
    
    return formattedName.toLowerCase().includes(lowerSearchTerm) ||
           originalName.toLowerCase().includes(lowerSearchTerm);
  });
};

/**
 * Creates a display name with proper formatting for table cells
 * @param {Object} user - User object with name fields
 * @param {string} id - User ID to display as secondary text
 * @returns {Object} Object with formatted name and ID for display
 */
export const createDisplayName = (user, id = null) => {
  const formattedName = formatUserName(user);
  const displayId = id || user.id || '';
  
  return {
    formattedName,
    displayId,
    fullDisplay: `${formattedName}${displayId ? ` (ID: ${displayId})` : ''}`
  };
};
