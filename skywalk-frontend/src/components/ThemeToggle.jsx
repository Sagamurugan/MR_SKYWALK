
import React from 'react';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="theme-toggle-container">
      <span>☀️</span>
      <label className="switch">
        <input
          type="checkbox"
          onChange={toggleTheme}
          checked={theme === 'dark'}
        />
        <span className="slider"></span>
      </label>
      <span>🌙</span>
    </div>
  );
};

export default ThemeToggle;