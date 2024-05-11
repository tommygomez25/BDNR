import React, { useState } from 'react';
import Header from './Header';
import axios from 'axios';
import '../css/CreatePost.css';

const CreatePost = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [postPrivacy, setPostPrivacy] = useState(true);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('You must be logged in to create a post');
        return;
      }

      await axios.post('http://localhost:5000/create-post', { title, content, postPrivacy }, { headers: { Authorization: `Bearer ${token}` } });

      setTitle('');
      setContent('');
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  return (
    <>
      <h1 className='text-2xl font-semibold mt-10'>Create a New Post!</h1>
      <form className='flex flex-col items-center gap-4 shadow-lg bg-white p-6 rounded' onSubmit={handleSubmit}>
        <label className='flex flex-col w-full gap-y-1'>
          Title:
          <input 
            type="text" 
            placeholder="Title" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            className='rounded-md p-2.5 w-full border-gray-300 border'
          />
        </label>
        <label className='flex flex-col w-full gap-y-1'>
          Content:
          <textarea 
            placeholder="Content" 
            value={content} 
            onChange={(e) => setContent(e.target.value)} 
            className='rounded-md p-2.5 w-full border-gray-300 border'
          />
        </label>
        
        <label className='flex gap-x-1 justify-start w-full'>
          Post Privacy:
          <input type="checkbox" checked={postPrivacy} onChange={() => setPostPrivacy(!postPrivacy)} />
        </label>
        <button 
          type="submit"
          className='rounded-md bg-sky-700 text-white p-2.5 w-full font-semibold transition hover:bg-sky-700/75'>
          Create Post
        </button>
      </form>
    </>

  );
}

export default CreatePost;
