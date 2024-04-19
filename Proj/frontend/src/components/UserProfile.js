// UserProfile.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import '../css/UserProfile.css';

function UserProfile() {
    const [user, setUser] = useState(null);
    const [posts, setPosts] = useState([]);
    const [comments, setComments] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [activeTab, setActiveTab] = useState('posts');
    const [following, setFollowing] = useState(0);
    const [followers, setFollowers] = useState(0);
    const { username } = useParams();

    useEffect(() => {
        fetchUserData(username);
    }, [username]);

    const fetchUserData = async (username) => {
        try {
            const response = await axios.get(`http://localhost:5000/user/${username}`);
            setUser(response.data[0]);
            setPosts(response.data[1]);
            setComments(response.data[2]);
            setFollowing(response.data[3]);
            setFollowers(response.data[4]);
            setFavorites(response.data[5]);
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
                <ul className="content-list">
                    {posts.map((post) => (
                        <li key={post.id}>{post.content}</li>
                    ))}
                </ul>
            );
        }
    } else if (activeTab === 'comments') {
         if (comments.length === 0) {
            activeContent = <p>No comments yet.</p>;
        }
        else {
            // if has comments, show them
            activeContent = (
                <ul className="content-list">
                    {comments.map((comment) => (
                        <li key={comment.id}>{comment.content}</li>
                    ))}
                </ul>
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
                <ul className="content-list">
                    {favorites.map((favorite) => (
                        <li key={favorite.id}>{favorite.content}</li>
                    ))}
                </ul>
            );
        }
    }

    return (
        <div className="user-profile"> <div className="profile-header"> <div className="profile-info"> <h1>{user.username}</h1> <p>Nome: {user.firstName} {user.lastName}</p> <p>Email: {user.email}</p> <p>Following: {following}</p> <p>Followers: {followers}</p> </div> </div>
            <div className="tabs">
                <button className={activeTab === 'posts' ? 'active' : ''} onClick={() => handleTabClick('posts')}>Posts</button>
                <button className={activeTab === 'comments' ? 'active' : ''} onClick={() => handleTabClick('comments')}>Comments</button>
                <button className={activeTab === 'favorites' ? 'active' : ''} onClick={() => handleTabClick('favorites')}>Favorites</button>
            </div>
            {activeContent}
        </div>
    );
}

export default UserProfile;
