
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../firebase';
import { toast } from 'react-hot-toast';
import EyeIcon from '../components/EyeIcon'; 
import EyeSlashIcon from '../components/EyeSlashIcon'; 

const RegisterPage = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const { name, email, password } = formData;
  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name });
      toast.success('Registration successful!');
      navigate('/login');
    } catch (error) {
      console.error("Registration error:", error);
      toast.error(error.message);
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={onSubmit}>
        <h2>Create Account</h2>
        <p>Get started with your own monitoring dashboard.</p>
        <input type="text" name="name" value={name} onChange={onChange} placeholder="Full Name" required />
        <input type="email" name="email" value={email} onChange={onChange} placeholder="Email Address" required />
        <div className="password-wrapper">
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            value={password}
            onChange={onChange}
            placeholder="Password"
            required
            minLength="6"
          />
          <span onClick={() => setShowPassword(!showPassword)} className="password-toggle-icon">
            {showPassword ? <EyeSlashIcon /> : <EyeIcon />} {/* <-- USE ICON COMPONENTS */}
          </span>
        </div>
        <button type="submit" className="auth-button">Register</button>
        <p className="auth-switch">
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </form>
    </div>
  );
};

export default RegisterPage;
