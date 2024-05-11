import React, { useState } from 'react';
import axios from 'axios';
import Header from './Header';
import Footer from './Footer';
import { useNavigate } from 'react-router-dom';
import '../css/RegisterForm.css';

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    gender: '',
    bio: '',
    phoneNumber: '',
    birthday: '',
    location: '',
    profileVisibility: false,
    messagePrivacy: true
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/register', formData);
      navigate('/login');
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };

  return (
    <div className='h-screen flex flex-col'>
      <Header />
      <div className='mx-auto my-auto flex flex-col gap-y-2 w-3/12 mb-6'>
        <h1 className='text-2xl font-semibold mt-10'>Register a New Account!</h1>
        <form className="flex flex-col items-center gap-4 shadow-lg bg-white p-6 rounded" onSubmit={handleSubmit}>
          <input type="text" className='rounded-md p-2.5 w-full border-gray-300 border mx-5' name="username" placeholder="Username" value={formData.username} onChange={handleChange} />
          <input type="text" className='rounded-md p-2.5 w-full border-gray-300 border mx-5' name="firstName" placeholder="First Name" value={formData.firstName} onChange={handleChange} />
          <input type="text" className='rounded-md p-2.5 w-full border-gray-300 border mx-5' name="lastName" placeholder="Last Name" value={formData.lastName} onChange={handleChange} />
          <input type="email" className='rounded-md p-2.5 w-full border-gray-300 border mx-5' name="email" placeholder="Email" value={formData.email} onChange={handleChange} />
          <label className='flex flex-col w-full gap-y-1'>
            <p>Gender</p>
            <select className='rounded-md p-2.5 border-gray-300 border text-gray-600' name="gender" placeholder="Gender" value={formData.gender} onChange={handleChange}>
              <option value="Female">Female</option>
              <option value="Male">Male</option>
              <option value="Other">Other</option>
            </select>
          </label>

          <input type="text" className='rounded-md p-2.5 w-full border-gray-300 border mx-5' name="bio" placeholder="Bio" value={formData.bio} onChange={handleChange} />
          <input type="text" className='rounded-md p-2.5 w-full border-gray-300 border mx-5' name="phoneNumber" placeholder="Phone Number" value={formData.phoneNumber} onChange={handleChange} />
          <input type="text" className='rounded-md p-2.5 w-full border-gray-300 border mx-5' name="birthday" placeholder="Birthday" value={formData.birthday} onChange={handleChange} />
          <input type="text" className='rounded-md p-2.5 w-full border-gray-300 border mx-5' name="location" placeholder="Location" value={formData.location} onChange={handleChange} />
          <input type="password" className='rounded-md p-2.5 w-full border-gray-300 border mx-5' name="password" placeholder="Password" value={formData.password} onChange={handleChange} />
          <div className='flex gap-x-4 w-full'>
            <label className='flex gap-x-1 justify-start'>
              <p>Profile Visibility:</p>
              <input type="checkbox" name="profileVisibility" checked={formData.profileVisibility} onChange={() => setFormData({ ...formData, profileVisibility: !formData.profileVisibility })} />
            </label>
            <label className='flex gap-x-1 justify-start'>
              <p>Message Privacy:</p>
              <input type="checkbox" name="messagePrivacy" checked={formData.messagePrivacy} onChange={() => setFormData({ ...formData, messagePrivacy: !formData.messagePrivacy })} />
            </label>
          </div>
          <button className='rounded-md bg-sky-700 text-white p-2.5 w-full font-semibold transition hover:bg-sky-700/75' 
            type="submit">Register
          </button>
        </form>
      </div>
      <Footer />
    </div>

  );
};

export default RegisterForm;
