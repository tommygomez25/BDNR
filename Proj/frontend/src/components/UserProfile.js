// UserProfile.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

function UserProfile() {
    const [user, setUser] = useState(null);
    const [posts, setPosts] = useState([]);
    const [following, setFollowing] = useState(0);
    const [followers, setFollowers] = useState(0);
    const { username } = useParams();

    useEffect(() => {
        fetchUserData(username);
    }, [username]);

    const fetchUserData = async (username) => {
        try {
            const response = await axios.get(`http://localhost:5000/user/${username}`);
            setUser(response.data.user);
            setPosts(response.data.posts);
            setFollowing(response.data.following);
            setFollowers(response.data.followers);
        } catch (error) {
            console.error('Error while getting user details:', error);
        }
    };

    if (!user) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <h1>{user.username}</h1>
            <p>Nome: {user.firstName} {user.lastName}</p>
            <p>Email: {user.email}</p>

            <h2>Posts</h2>
            <ul>
                {posts.map((post) => (
                    <li key={post.id}>
                        <p>{post.content}</p>
                        <p>Data: {post.postDate}</p>
                    </li>
                ))}
            </ul>
            <p>Following: {following}</p>
            <p>Followers: {followers}</p>
        </div>
    );
}

export default UserProfile;
