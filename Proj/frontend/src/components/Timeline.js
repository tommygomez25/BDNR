import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Header from './Header.js'
import Footer from './Footer.js'
import { TokenContext } from './TokenContext';

const Timeline = () => {
    const [timeline, setTimeline] = useState([]);
    const [loading, setLoading] = useState(true);
    const { username } = useParams();
    const { currentUser } = useContext(TokenContext);

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
        <div className='h-screen flex flex-col'>
            <Header />
            <div className='mx-auto my-auto flex flex-col gap-y-2 w-5/12'>
                {!currentUser && currentUser !== username ? (
                    <h1 className='text-2xl font-semibold'>Please log in to your account.</h1>
                ) : 
                (timeline.length === 0) ? (
                    <h1 className='text-2xl font-semibold'>No posts to show on this timeline :/</h1>
                )
                : (
                    <>
                        <h1 className='text-2xl font-semibold'>Timeline</h1>
                        <div className='flex flex-col overflow-y-auto max-h-[70vh] items-center gap-4 shadow-lg bg-white p-6 rounded'>
                            <div className='flex flex-col gap-y-4 mt-4'>
                                {timeline.map(post => (
                                    <div key={post.id} className='bg-neutral-100 p-4 rounded-md'>
                                        <a href={`/post/${post.id}`} className='text-xl transition font-medium hover:text-sky-700/75 text-sky-700'>{post.title}</a>
                                        <div className='flex gap-x-2'>
                                            <a href={`/user/${post.username}`} className='text-gray-600 text-xs hover:text-sky-700'>{post.username}</a>
                                            <p className='text-gray-600 text-xs'>{post.postDate} {post.postTime}</p>
                                        </div>
                                        <p className='text-gray-700'>{post.content}</p>
                                        <div className='flex gap-x-2'>
                                            <p className='text-gray-600 text-xs'>{post.numLikes} likes</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}

            </div>
            <Footer />
        </div>

    );
};

export default Timeline;
