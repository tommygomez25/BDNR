import React, { useState, useEffect } from 'react';
import Header from './Header';
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
    <>
      <Header />
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <textarea placeholder="Content" value={content} onChange={(e) => setContent(e.target.value)} />
        <label>
          Post Privacy:
          <input type="checkbox" checked={postPrivacy} onChange={() => setPostPrivacy(!postPrivacy)} />
        </label>
        <button type="submit">Update Post</button>
      </form>
    </>

  );
};

export default UpdatePost;
