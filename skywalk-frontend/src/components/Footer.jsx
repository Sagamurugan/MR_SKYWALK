
import React from 'react';

const Footer = () => {
  
  const currentYear = new Date().getFullYear();

  return (
    <footer className="app-footer">
      <p>&copy; {currentYear} MR SKYWALK. All Rights Reserved.</p>
      <div className="footer-links">
        <a href="#">Privacy Policy</a>
        <span>|</span>
        <a href="#">Terms of Service</a>
        <span>|</span>
        <a href="#">Contact Us</a>
      </div>
    </footer>
  );
};

export default Footer;