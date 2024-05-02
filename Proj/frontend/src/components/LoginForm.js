import React, { useState, useContext } from 'react';
import axios from 'axios';
import Header from './Header';
import { useNavigate } from 'react-router-dom';
import { TokenContext } from './TokenContext';
import '../css/LoginForm.css';

const LoginForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { setToken } = useContext(TokenContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/login', { username, password });
      const { token } = response.data;

      setToken(token);

      navigate(`/user/${username}`);

    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <>
      <Header />
      <div className = "login-form-container">
        <form  className = "form-login" onSubmit={handleSubmit} >
          <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)}  />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)}  />
          <button type="submit" >Login</button>
        </form>
      </div>
    </>

  );
};

export default LoginForm;
