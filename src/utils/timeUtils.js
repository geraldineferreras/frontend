// Utility functions for time formatting

/**
 * Format a timestamp as relative time (e.g., "Just now", "5 minutes ago")
 * @param {string|Date} dateStr - The timestamp to format
 * @returns {string} Formatted relative time string
 */
export const timeAgo = (dateStr) => {
  const now = new Date();
  let date;
  
  // Handle different timestamp formats
  if (typeof dateStr === 'string') {
    // If it's a MySQL timestamp format (YYYY-MM-DD HH:mm:ss)
    if (dateStr.match(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/)) {
      // Backend sends UTC timestamps, so parse as UTC by converting to ISO format
      date = new Date(dateStr.replace(' ', 'T') + 'Z');
    } else {
      // For ISO strings or other formats, parse normally
      date = new Date(dateStr);
    }
  } else {
    date = new Date(dateStr);
  }
  
  // Ensure we have a valid date
  if (isNaN(date.getTime())) {
    return "Unknown time";
  }
  
  const diff = (now - date) / 1000;
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  if (diff < 172800) return "Yesterday";
  return date.toLocaleDateString();
};

/**
 * Format a timestamp as a readable date and time
 * @param {string|Date} dateStr - The timestamp to format
 * @returns {string} Formatted date and time string
 */
export const formatDateTime = (dateStr) => {
  let date;
  
  if (typeof dateStr === 'string') {
    // If it's a MySQL timestamp format (YYYY-MM-DD HH:mm:ss)
    if (dateStr.match(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/)) {
      // Backend sends UTC timestamps, so parse as UTC by converting to ISO format
      date = new Date(dateStr.replace(' ', 'T') + 'Z');
    } else {
      // For ISO strings or other formats, parse normally
      date = new Date(dateStr);
    }
  } else {
    date = new Date(dateStr);
  }
  
  if (isNaN(date.getTime())) {
    return "Invalid date";
  }
  
  return date.toLocaleString();
};

/**
 * Check if a timestamp is recent (within the last hour)
 * @param {string|Date} dateStr - The timestamp to check
 * @returns {boolean} True if the timestamp is recent
 */
export const isRecent = (dateStr) => {
  const now = new Date();
  let date;
  
  if (typeof dateStr === 'string') {
    if (dateStr.match(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/)) {
      date = new Date(dateStr.replace(' ', 'T') + 'Z');
    } else {
      date = new Date(dateStr);
    }
  } else {
    date = new Date(dateStr);
  }
  
  if (isNaN(date.getTime())) {
    return false;
  }
  
  const diff = (now - date) / 1000;
  return diff < 3600; // Less than 1 hour
};
