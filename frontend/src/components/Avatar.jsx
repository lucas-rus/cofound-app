import React from 'react';

const Avatar = ({ user, size = 40, className = '' }) => {
  const url = user.profilePictureUrl;
  const username = user.username || '?';
  const initial = username.charAt(0).toUpperCase();
  
  // Deterministic color based on username length/char
  const colors = ['bg-primary', 'bg-secondary', 'bg-success', 'bg-danger', 'bg-warning', 'bg-info', 'bg-dark'];
  const colorIndex = username.charCodeAt(0) % colors.length;
  const bgColor = colors[colorIndex];

  if (url) {
    return (
      <img 
        src={url} 
        alt={username} 
        className={`rounded-circle border ${className}`} 
        style={{ width: size, height: size, objectFit: 'cover' }}
      />
    );
  }

  return (
    <div 
      className={`rounded-circle ${bgColor} text-white d-flex align-items-center justify-content-center fw-bold ${className}`} 
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {initial}
    </div>
  );
};

export default Avatar;
