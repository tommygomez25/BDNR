import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import '../css/Timeline.css';

const Timeline = () => {
    const [timeline, setTimeline] = useState([]);
    const [loading, setLoading] = useState(true);
    const { username } = useParams();

    useEffect(() => {
        const fetchTimeline = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/timeline/${username}`);

                setTimeline(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching timeline:', error);
                setLoading(false);
            }
        };

        
        fetchTimeline();
    }, [username]); 

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="timeline-container">
            <h2 className="timeline-heading">Timeline for {username}</h2>
            <div className="timeline-posts">
                {/* Render the timeline posts */}
                {timeline.map(post => (
                    <div key={post.id} className="post-card">
                        <a href={`/post/${post.id}`} className="post-title">{post.title}</a>
                        <p className="post-content">{post.content}</p>
                        <p className="post-date">{post.postDate}</p>
                        <p className='post-likes'>Likes: {post.numLikes}</p>
                        {/* Add more post details as needed */}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Timeline;
