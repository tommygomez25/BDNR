import React, { useState, useEffect } from 'react';
import Header from './Header';
import Footer from './Footer';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const UpdatePost = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [postPrivacy, setPostPrivacy] = useState(true);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPost = async () => {
      try {
        console.log(id)
        const response = await axios.get(`http://localhost:5000/post/${id}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
        const postData = response.data;
        setTitle(postData.title);
        setContent(postData.content);
        setPostPrivacy(postData.postPrivacy);
      } catch (error) {
        console.error('Error fetching post:', error);
      }
    };

    fetchPost();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('You must be logged in to update a post');
        return;
      }

      await axios.put(`http://localhost:5000/post/${id}`, { title, content, postPrivacy }, { headers: { Authorization: `Bearer ${token}` } });

    navigate(`/post/${id}`);
    } catch (error) {
      console.error('Error updating post:', error);
    }
  };

  return (
    <div className='h-screen flex flex-col'>
      <Header />
      <div className='mx-auto my-auto flex flex-col gap-y-2 w-3/12'>
        <h1 className='text-2xl font-semibold mt-10'>Edit your Post!</h1>
        <form onSubmit={handleSubmit} className='flex flex-col items-center gap-4 shadow-lg bg-white p-6 rounded'>
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
              Update Post
          </button>
        </form>
      </div>

      <Footer />
    </div>

  );
};

export default UpdatePost;
