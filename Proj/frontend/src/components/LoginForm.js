import React, { useState, useContext } from 'react';
import axios from 'axios';
import Header from './Header';
import Footer from './Footer';
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
    <div className='h-screen flex flex-col'>
      <Header />
      <div className='mx-auto my-auto flex flex-col gap-y-2 w-3/12'>
        <h1 className='text-2xl font-semibold mt-10'>Login into your Account!</h1>
        <form onSubmit={handleSubmit} className='flex flex-col items-center gap-4 shadow-lg bg-white p-6 rounded'>
          <input
            type='text'
            placeholder='Username'
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className='rounded-md p-2.5 w-full border-gray-300 border mx-5'
          />
          <input
            type='password'
            placeholder='Password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className='rounded-md p-2.5 w-full border-gray-300 border'
          />
          <button
            type='submit'
            className='rounded-md bg-sky-700 text-white p-2.5 w-full font-semibold transition hover:bg-sky-700/75'
          >
            Login
          </button>
        </form>
      </div>

      <Footer />
    </div>

  );
};

export default LoginForm;
