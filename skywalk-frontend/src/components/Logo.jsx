// src/components/Logo.jsx
import React from 'react';
import { useTheme } from '../context/ThemeContext'; // <-- IMPORT THEME HOOK

const Logo = () => {
  const { theme } = useTheme(); // <-- GET CURRENT THEME
  const textColor = theme === 'dark' ? 'white' : '#111827'; // Set text color based on theme

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <svg width="40" height="40" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M40 150 C60 100, 140 100, 160 150" stroke="#3b82f6" strokeWidth="16" strokeLinecap="round"/>
        <path d="M100 150 V 60" stroke="#3b82f6" strokeWidth="16" strokeLinecap="round"/>
        <path d="M100 60 L120 80" stroke="#3b82f6" strokeWidth="16" strokeLinecap="round"/>
        <path d="M100 60 L80 80" stroke="#3b82f6" strokeWidth="16" strokeLinecap="round"/>
        <path d="M100 40 m -5, 0 a 5,5 0 1,0 10,0 a 5,5 0 1,0 -10,0" fill="#3b82f6"/>
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: '1.2' }}>
        <span style={{ fontSize: '1.5rem', fontWeight: '700', color: textColor }}>MR SKYWALK</span>
      </div>
    </div>
  );
};

export default Logo;
