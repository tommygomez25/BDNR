import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const PostDetailed = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [postNotFound, setPostNotFound] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/post/${id}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }});
        setPost(response.data);
      } catch (error) {
        console.error('Error fetching post:', error);
        if (error.response && error.response.status === 404) {
          setPostNotFound(true);
        }
      }
    };

    fetchPost();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        const response = await axios.delete(`http://localhost:5000/post/${id}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }});
        if (response.status === 204) {
          alert('Post deleted successfully');
          setPost(null);
        }
      } catch (error) {
        console.error('Error deleting post:', error);
      }
    }
  };

  const handleUpdate = () => {
    navigate(`/update-post/${id}`);
  }

  return (
    <div>
      {postNotFound ? (
        <p>Couldn't find post</p>
      ) : post ? (
        <div>
          <h1>{post.title}</h1>
          <p>{post.content}</p>
          <p>Post Date: {post.postDate}</p>
          <p>Post Time: {post.postTime}</p>
          <p>Likes: {post.numLikes}</p>
          <p>Favorites: {post.numFavs}</p>
          <p>Privacy: {post.postPrivacy ? 'Private' : 'Public'}</p>
          <p>Was Edited: {post.wasEdited ? 'Yes' : 'No'}</p>
          <p>Username: {post.username}</p>
          {post.isAuthor && (
            <>
              <button onClick={handleUpdate}>Edit Post</button>
              <button onClick={handleDelete}>Delete Post</button>
            </>
          )}
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default PostDetailed;
