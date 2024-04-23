// CreatePost.js

import React, { useState } from 'react';
import axios from 'axios';

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
    <form onSubmit={handleSubmit}>
      <input type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
      <textarea placeholder="Content" value={content} onChange={(e) => setContent(e.target.value)} />
      <label>
        Post Privacy:
        <input type="checkbox" checked={postPrivacy} onChange={() => setPostPrivacy(!postPrivacy)} />
      </label>
      <button type="submit">Create Post</button>
    </form>
  );
}

export default CreatePost;
