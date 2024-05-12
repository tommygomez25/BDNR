import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import Header from './Header.js'
import Footer from './Footer.js';
import { useParams } from 'react-router-dom';
import '../css/UserProfile.css';
import '../index.css';
import { TokenContext } from './TokenContext';

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
    const { currentUser } = useContext(TokenContext);

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

        console.log(currentUser);
        
        
        // if has no posts, show a message
        if (posts.length === 0) {
            activeContent = <p className='p-4'>No posts yet.</p>;
        }
        else {
            // if has posts, show them
            console.log(posts);

            activeContent = (
                <div className='grid grid-cols-2'>
                    {posts.map((post) => (
                        !post.postPrivacy || post.username === currentUser ?
                        <div className='bg-neutral-100 p-4 mx-5 mb-5 rounded-md' key={post.id}>
                            <div className='flex gap-x-2'>
                                <a href={`/post/${post.id}`} className='text-xl transition font-medium hover:text-sky-700/75 text-sky-700'>{post.title}</a>
                                {post.postPrivacy && (
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 mt-1.5">
                                        <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 0 0-5.25 5.25v3a3 3 0 0 0-3 3v6.75a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3v-6.75a3 3 0 0 0-3-3v-3c0-2.9-2.35-5.25-5.25-5.25Zm3.75 8.25v-3a3.75 3.75 0 1 0-7.5 0v3h7.5Z" clipRule="evenodd" />
                                    </svg>
                                )}
                            </div>
                            <p className='text-gray-600 text-xs'>{post.postDate} {post.postTime}</p>
                            <p className='text-gray-700'>{post.content.length > 100 ? post.content.substring(0, 100) + '...' : post.content}</p>
                            <div className='flex gap-x-2'>
                                <p className='text-gray-600 text-xs'>{post.numLikes} likes</p>
                            </div>
                        </div>
                        : null
                    ))}
                </div>
            );
        }
    } else if (activeTab === 'comments') {
         if (comments.length === 0) {
            activeContent = <p className='p-4'>No comments yet.</p>;
        }
        else {
            activeContent = (
                <div className='grid grid-cols-2'>

                    {comments.map((comment) => (
                        <div className='bg-neutral-100 p-4 mx-5 mb-5 rounded-md' key={comment.id}>
                            <a href={`/post/${comment.postId}`} className='hover:text-gray-700/75 text-gray-700'>{comment.content.length > 100 ? comment.content.substring(0, 100) + '...' : comment.content}</a>
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
            activeContent = <p className='p-4'>No favorites yet.</p>;
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
            <div className="shadow-lg bg-white p-4 my-4 my-auto mx-auto w-7/12 rounded">
                <div className="profile-header">
                    <div className='flex flex-col'>
                        <div className='flex justify-between'>
                            <h1 className='text-3xl text-sky-700'>{user.username}</h1>
                            {currentUser !== user.username && (
                                <a href={`/new-chat/${username}`} className='block rounded-md bg-sky-700 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-sky-700/75'>Send Message</a>
                            )}
                        </div>

                        <p className='text-xl italic'>{user.bio}</p>
                        <div className='flex gap-x-7 text-neutral-400 text-md'>
                            <div className='flex gap-x-1'>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Zm6-10.125a1.875 1.875 0 1 1-3.75 0 1.875 1.875 0 0 1 3.75 0Zm1.294 6.336a6.721 6.721 0 0 1-3.17.789 6.721 6.721 0 0 1-3.168-.789 3.376 3.376 0 0 1 6.338 0Z" />
                                </svg>
                                <p>{user.firstName} {user.lastName}</p>
                            </div>
                            <div className='flex gap-x-1'>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                                </svg>
                                <p>{user.location}</p>
                            </div>
                            <div className='flex gap-x-1'>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.871c1.355 0 2.697.056 4.024.166C17.155 8.51 18 9.473 18 10.608v2.513M15 8.25v-1.5m-6 1.5v-1.5m12 9.75-1.5.75a3.354 3.354 0 0 1-3 0 3.354 3.354 0 0 0-3 0 3.354 3.354 0 0 1-3 0 3.354 3.354 0 0 0-3 0 3.354 3.354 0 0 1-3 0L3 16.5m15-3.379a48.474 48.474 0 0 0-6-.371c-2.032 0-4.034.126-6 .371m12 0c.39.049.777.102 1.163.16 1.07.16 1.837 1.094 1.837 2.175v5.169c0 .621-.504 1.125-1.125 1.125H4.125A1.125 1.125 0 0 1 3 20.625v-5.17c0-1.08.768-2.014 1.837-2.174A47.78 47.78 0 0 1 6 13.12M12.265 3.11a.375.375 0 1 1-.53 0L12 2.845l.265.265Zm-3 0a.375.375 0 1 1-.53 0L9 2.845l.265.265Zm6 0a.375.375 0 1 1-.53 0L15 2.845l.265.265Z" />
                                </svg>
                                <p>{user.birthday}</p>
                            </div>
                            <div className='flex gap-x-1'>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                                </svg>
                                <a href={`mailto:${user.email}`} className='hover:text-sky-700'>{user.email}</a>
                            </div>
                        </div>
                        <div className='flex gap-x-2'>
                            <p><b>{following}</b> Following</p>
                            <p><b>{followers}</b> Followers</p>
                            <p><b>{totalLikes}</b> Likes</p>
                        </div>
                    </div>
                    <hr className='border-neutral-300 mt-4' />
                </div>
                <div className="flex justify-around mx-auto px-4 py-2">
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

