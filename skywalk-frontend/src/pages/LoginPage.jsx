// src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { toast } from 'react-hot-toast';
import EyeIcon from '../components/EyeIcon'; // <-- IMPORT NEW ICON
import EyeSlashIcon from '../components/EyeSlashIcon'; // <-- IMPORT NEW ICON

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const { email, password } = formData;
  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success('Login successful!');
      navigate('/');
    } catch (error) {
      console.error("Login error:", error);
      toast.error(error.message);
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={onSubmit}>
        <h2>Welcome Back!</h2>
        <p>Log in to view the skywalk dashboard.</p>
        <input type="email" name="email" value={email} onChange={onChange} placeholder="Email Address" required />
        <div className="password-wrapper">
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            value={password}
            onChange={onChange}
            placeholder="Password"
            required
          />
          <span onClick={() => setShowPassword(!showPassword)} className="password-toggle-icon">
            {showPassword ? <EyeSlashIcon /> : <EyeIcon />} {/* <-- USE ICON COMPONENTS */}
          </span>
        </div>
        <button type="submit" className="auth-button">Login</button>
        <p className="auth-switch">
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
      </form>
    </div>
  );
};

export default LoginPage;

