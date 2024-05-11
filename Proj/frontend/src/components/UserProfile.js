import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from './Header.js'
import Footer from './Footer.js';
import { useParams } from 'react-router-dom';
import '../css/UserProfile.css';
import '../index.css';

function UserProfile() {
    const [user, setUser] = useState(null);
    const [posts, setPosts] = useState([]);
    const [comments, setComments] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [activeTab, setActiveTab] = useState('posts');
    const [following, setFollowing] = useState(0);
    const [followers, setFollowers] = useState(0);
    const [totalLikes, setTotalLikes] = useState(0);
    const { username } = useParams();

    useEffect(() => {
        fetchUserData(username);
    }, [username]);

    const fetchUserData = async (username) => {
        try {
            const response = await axios.get(`http://localhost:5000/user/${username}`);
            const likesResponse = await axios.get(`http://localhost:5000/num-likes?username=${username}`);
            setUser(response.data[0]);
            setPosts(response.data[1]);
            setComments(response.data[2]);
            setFollowing(response.data[3]);
            setFollowers(response.data[4]);
            setFavorites(response.data[5]);
            setTotalLikes(likesResponse.data);
        } catch (error) {
            console.error('Error while getting user details:', error);
        }
    };

    const handleTabClick = (tab) => {
        setActiveTab(tab);
    };

    if (!user) {
        return <div>Loading...</div>;
    }

    let activeContent;
    if (activeTab === 'posts') {
        // if has no posts, show a message
        if (posts.length === 0) {
            activeContent = <p>No posts yet.</p>;
        }
        else {
            // if has posts, show them
            activeContent = (
                <div className='grid grid-cols-2'>
                    {posts.map((post) => (
                        <div className='bg-neutral-100 p-4 mx-5 mb-5 rounded-md' key={post.id}>
                            <a href={`/post/${post.id}`} className='text-xl transition font-medium hover:text-sky-700/75 text-sky-700'>{post.title}</a>
                            <p className='text-gray-700'>{post.content}</p>
                            <div className='flex gap-x-2'>
                                <p className='text-gray-600 text-xs'>{post.numLikes} likes</p>
                            </div>
                        </div>
                    ))}
                </div>
            );
        }
    } else if (activeTab === 'comments') {
         if (comments.length === 0) {
            activeContent = <p>No comments yet.</p>;
        }
        else {
            // if has comments, show them
            activeContent = (
                <div className='grid grid-cols-2'>

                    {comments.map((comment) => (
                        <div className='bg-neutral-100 p-4 mx-5 mb-5 rounded-md' key={comment.id}>
                            <a href={`/post/${comment.postId}`} className='text-xl transition font-medium hover:text-sky-700/75 text-sky-700'>{comment.content}</a>
                            <p className='text-gray-700'>{comment.comment}</p>
                            <div className='flex gap-x-2'>
                                <p className='text-gray-600 text-xs'>{comment.numLikes} likes</p>
                            </div>
                        </div>
                    ))}

                </div>
            );
        }
    } else if (activeTab === 'favorites') {
        // if has no favorites, show a message
        if (favorites.length === 0) {
            activeContent = <p>No favorites yet.</p>;
        }
        else {
            // if has favorites, show them
            activeContent = (
                <div className='grid grid-cols-2'>
                    {favorites.map((favorite) => (
                        <div className='bg-neutral-100 p-4 mx-5 mb-5 rounded-md' key={favorite.id}>
                            <a href={`/post/${favorite.id}`} className='text-xl transition font-medium hover:text-sky-700/75 text-sky-700'>{favorite.title}</a>
                            <div className='flex gap-x-2'>
                                <a href={`/user/${favorite.username}`} className='text-gray-600 text-xs hover:text-sky-700'>{favorite.username}</a>
                                <p className='text-gray-600 text-xs'>{favorite.postDate} {favorite.postTime}</p>
                            </div>
                            <p className='text-gray-700'>{favorite.content.length > 100 ? favorite.content.substring(0, 100) + '...' : favorite.content}</p>
                            <div className='flex gap-x-2'>
                                <p className='text-gray-600 text-xs'>{favorite.numLikes} likes</p>
                            </div>
                        </div>
                    ))}

                </div>
            );
        }
    }

    return (
        <div className='h-screen flex flex-col'>
            <Header />
            <div className="shadow-lg bg-white p-4 my-4 mb-auto mx-auto w-7/12 rounded">
                <div className="profile-header">
                    <div className='flex flex-col'>
                        <h1 className='text-3xl text-sky-700'>{user.username}</h1>
                        <p>{user.firstName} {user.lastName}</p>
                        <p className='text-sm text-neutral-400 italic'>{user.bio}</p>
                        <div className='flex gap-x-2'>
                            <p><b>{following}</b> Following</p>
                            <p><b>{followers}</b> Followers</p>
                            <p><b>{totalLikes}</b> Likes</p>
                        </div>
                    </div>
                </div>
                <div className="flex justify-around mx-auto p-4">
                    <button className={activeTab === 'posts' ? 'text-sky-700 font-medium' : 'transition hover:font-medium hover:text-sky-700/75'} onClick={() => handleTabClick('posts')}>Posts</button>
                    <button className={activeTab === 'comments' ? 'text-sky-700 font-medium' : 'transition hover:font-medium hover:text-sky-700/75'} onClick={() => handleTabClick('comments')}>Comments</button>
                    <button className={activeTab === 'favorites' ? 'text-sky-700 font-medium' : 'transition hover:font-medium hover:text-sky-700/75'} onClick={() => handleTabClick('favorites')}>Favorites</button>
                </div>
                {activeContent}
            </div>
            <Footer />
        </div>

    );
}

export default UserProfile;

