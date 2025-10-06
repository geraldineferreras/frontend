import React from "react";

// Custom FastGradeIcon: QR code with a small pencil above
const FastGradeIcon = ({ className = "", style = {}, ...props }) => (
  <svg
    width="1.5em"
    height="1.5em"
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={style}
    {...props}
  >
    {/* QR code base */}
    <rect x="4" y="10" width="24" height="18" rx="3" fill="#17a2b8"/>
    <rect x="7" y="13" width="4" height="4" rx="1" fill="#fff"/>
    <rect x="21" y="13" width="4" height="4" rx="1" fill="#fff"/>
    <rect x="7" y="23" width="4" height="4" rx="1" fill="#fff"/>
    <rect x="15" y="18" width="2" height="2" rx="0.5" fill="#fff"/>
    <rect x="19" y="19" width="2" height="2" rx="0.5" fill="#fff"/>
    <rect x="11" y="19" width="2" height="2" rx="0.5" fill="#fff"/>
    {/* Pencil above QR code */}
    <rect x="13.5" y="4" width="5" height="1.2" rx="0.6" fill="#ffc107"/>
    <rect x="17.5" y="2.5" width="1.2" height="3" rx="0.6" fill="#ffc107"/>
    <polygon points="14,5.2 18,5.2 16,8 14,5.2" fill="#6c757d"/>
  </svg>
);

export default FastGradeIcon; 