import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Header from './Header';
import { useParams, useNavigate } from 'react-router-dom';
import '../index.css'

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
          navigate('/');
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
  <>
    <Header />
    <div className='post-container'>
      {postNotFound ? (
        <p className="text-red-500">Couldn't find post</p>
      ) : post ? (
        <div className='m-16'>
          <h1 className="text-2xl font-bold">{post.title}</h1>
          <p className="text-gray-600 text-sm">by {post.username}</p>
          <p className="text-gray-600 text-xs">{post.postDate} {post.postTime}</p>
          <p className="text-gray-700">{post.content}</p>
          <div className='flex gap-x-2'>
            <p className="text-gray-600 text-xs">{post.numLikes} likes</p>
          </div>
          <div>
            <h2 className="text-xl font-semibold mt-4">Comments:</h2>
            {post.comments.map(comment => (
              <div key={comment.id} className="comment rounded p-4 mt-4 bg-neutral-200">
                <p className="text-gray-700">{comment.content}</p>
                <p className="text-gray-600 text-sm">by {comment.username}</p>
                <p className="text-gray-600 text-xs">{comment.commentDate} {comment.commentTime}</p>
                <p className="text-gray-600">{comment.numLikes} likes</p>
              </div>
            ))}
          </div>
          {post.isAuthor && (
            <div className="mt-4">
              <button onClick={handleUpdate} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 mr-2 rounded">Edit Post</button>
              <button onClick={handleDelete} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">Delete Post</button>
            </div>
          )}
        </div>
      ) : (
        <p className="text-gray-600">Loading...</p>
      )}
    </div>
  </>

  );
};

export default PostDetailed;
