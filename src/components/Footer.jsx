import React from 'react';
import './Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h4>MobiBlog</h4>
          <p>A platform for knowledge and ideas.</p>
        </div>
        <div className="footer-section">
          <h4>Contact Us</h4>
          <p>Email: shubhammobiblog.com</p>
        </div>
        <div className="footer-section">
          <h4>Follow Us</h4>
          <div className="social-links">
            <a href="https://www.linkedin.com/in/shubham-teli-2415s">Linkedin</a> | <a href="https://github.com/shubh2415">Github</a> | <a href="https://www.instagram.com/shubham_maratha9990/">Instagram</a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} MobiBlog. All Rights Reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;
