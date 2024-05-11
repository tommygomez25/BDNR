import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import Header from './Header';
import Footer from './Footer';
import { TokenContext } from './TokenContext';
import { useParams, useNavigate } from 'react-router-dom';
import '../index.css'

const PostDetailed = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [postNotFound, setPostNotFound] = useState(false);
  const [postFavorited, setPostFavorited] = useState(false);
  const { token } = useContext(TokenContext);
  const navigate = useNavigate();

  const handleFavorite = async () => {
    try {
      const response = await axios.post('http://localhost:5000/add-favorite-post', { postId: id }, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }});
      if (response.status === 201) {
        setPostFavorited(true);
      }
    } catch (error) {
      console.error('Error favoriting post:', error);
    }
  };

  const handleDeleteFavorite = async () => {
    try {
      const response = await axios.delete(`http://localhost:5000/delete-favorite-post/${id}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }});
      if (response.status === 204) {
        setPostFavorited(false);
      }
    } catch (error) {
      console.error('Error deleting favorite:', error);
    }
  };

  const handleLike = async () => {
    console.log('Liking post');
    try {
      const response = await axios.post(`http://localhost:5000/like-post/${id}`, {}, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }});
      if (response.status === 200) {
        setPost(prevPost => ({ ...prevPost, numLikes: prevPost.numLikes + 1 }));
      }
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };
  
  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/post/${id}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }});
        console.log('Post:', response.data);
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

  useEffect(() => {
    const checkPostFavoited = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/check-favorite/${id}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }});
        setPostFavorited(response.data.isFavorited);
      } catch (error) {
        console.error('Error checking if post is favorited:', error);
      }
    };

    checkPostFavoited();
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
  <div className='h-screen flex flex-col'>
    <Header />
    <div className='shadow-lg bg-white p-4 my-4 my-auto mx-auto w-7/12 rounded'>
      {postNotFound ? (
        <p className="text-red-500">Couldn't find post</p>
      ) : post ? (
        <div>
          <div className='p-4 mx-5'>
            <div className='flex gap-x-2'>
              <h1 className="text-2xl font-bold text-sky-700">{post.title}</h1>
              {token !== 'null' && (
              <div className='flex gap-x-1'>
                <button onClick={handleLike}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                  </svg>
                </button>
                {postFavorited ? (
                  <button onClick={handleDeleteFavorite}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="gold" className="w-6 h-6">
                      <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z" clipRule="evenodd" />
                    </svg>
                  </button>
                ) : (
                  <button onClick={handleFavorite}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
                    </svg>
                  </button>
                )}
                {post.isAuthor && (
                  <>
                    <button onClick={handleUpdate}> 
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                      </svg>
                    </button>
                    <button onClick={handleDelete}>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                      </svg>
                    </button>
                  </>
                )}
              </div>
            )}
            </div>
            <div className='flex gap-x-2'>
              <a href={`/user/${post.username}`} className="text-gray-600 text-xs hover:text-sky-700">{post.username}</a>
              <p className='text-gray-600 text-xs'>{post.postDate} {post.postTime}</p>
            </div>
            <p className="text-gray-700">{post.content}</p>
            <p className="text-gray-600 text-xs">Likes: {post.numLikes}</p>
          </div>
          <div className='p-4'>
            <h2 className="text-xl font-semibold mt-2 mx-5">Comments:</h2>
            {post.comments?.map(comment => (
              <div key={comment.id} className="comment rounded p-4 mx-0">
                <p className="text-gray-700 bg-neutral-100 p-4 rounded">{comment.content}</p>
                <div className="flex gap-x-2 mt-2">
                  <a href={`/user/${comment.username}`} className="text-gray-600 text-xs hover:text-sky-700">{comment.username}</a>
                  <p className="text-gray-600 text-xs">{comment.commentDate} {comment.commentTime}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-gray-600">Loading...</p>
      )}
    </div>
    <Footer />
  </div>

  );
};

export default PostDetailed;
