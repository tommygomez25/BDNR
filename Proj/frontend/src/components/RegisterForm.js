// RegisterForm.js

import React, { useState } from 'react';
import axios from 'axios';

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/register', formData);
      // Após o registro bem-sucedido, você pode redirecionar o usuário para a página de login
      // history.push('/login');
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" name="username" placeholder="Username" value={formData.username} onChange={handleChange} />
      <input type="text" name="firstName" placeholder="First Name" value={formData.firstName} onChange={handleChange} />
      <input type="text" name="lastName" placeholder="Last Name" value={formData.lastName} onChange={handleChange} />
      <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} />
      <input type="text" name="gender" placeholder="Gender" value={formData.gender} onChange={handleChange} />
      <input type="text" name="bio" placeholder="Bio" value={formData.bio} onChange={handleChange} />
      <input type="text" name="phoneNumber" placeholder="Phone Number" value={formData.phoneNumber} onChange={handleChange} />
      <input type="text" name="birthday" placeholder="Birthday" value={formData.birthday} onChange={handleChange} />
      <input type="text" name="location" placeholder="Location" value={formData.location} onChange={handleChange} />
      <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} />
      <label>
        Profile Visibility:
        <input type="checkbox" name="profileVisibility" checked={formData.profileVisibility} onChange={() => setFormData({ ...formData, profileVisibility: !formData.profileVisibility })} />
      </label>
      <label>
        Message Privacy:
        <input type="checkbox" name="messagePrivacy" checked={formData.messagePrivacy} onChange={() => setFormData({ ...formData, messagePrivacy: !formData.messagePrivacy })} />
      </label>
      <button type="submit">Register</button>
    </form>
  );
};

export default RegisterForm;
