import React from 'react';

const Avatar = ({ user, size = 40, className = '' }) => {
  const url = user.profilePictureUrl;
  const username = user.username || '?';
  const initial = username.charAt(0).toUpperCase();
  
  // Generate a deterministic color from the username
  const generateColor = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // HSL: Hue = hash % 360, Saturation = 65-75%, Lightness = 35-45% (Darker for white text)
    const h = Math.abs(hash % 360); 
    const s = 70; 
    const l = 40; 
    return `hsl(${h}, ${s}%, ${l}%)`;
  };

  const bgColor = generateColor(username);

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
      className={`rounded-circle text-white d-flex align-items-center justify-content-center fw-bold ${className}`} 
      style={{ 
        width: size, 
        height: size, 
        fontSize: size * 0.4, 
        backgroundColor: bgColor,
        textShadow: '0 1px 2px rgba(0,0,0,0.2)', // subtle shadow for better readability
        userSelect: 'none'
      }}
    >
      {initial}
    </div>
  );
};

export default Avatar;