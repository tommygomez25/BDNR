import React, { useState, useEffect } from 'react';
import Header from './Header';
import axios from 'axios';
import '../css/Search.css';

const Search = () => {

    const [posts, setPosts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchPosts = async (e) => {
        e.preventDefault();
        const keywords = searchTerm.split(' ').join(',');

        try {
            const response = await axios.get(`http://localhost:5000/search-post?keywords=${keywords}`);
            setPosts(response.data);
        } catch (error) {
            console.error('Error fetching posts:', error);
        }
    }

    return (
        <div>
            <Header />
            <form className='flex ms-5 mt-5 gap-x-4' onSubmit={fetchPosts}>
                <input type='text' placeholder='Search for posts...' onChange={(e) => {setSearchTerm(e.target.value)}} className='p-2 bg-neutral-200 rounded w-4/6' />
                <button className='search-button'>Search</button>
            </form>
            <div className='flex flex-col ms-5 mt-5 gap-y-4'>
                {posts.map(post => (
                    <div key={post._id} className='bg-neutral-200 p-4 rounded'>
                        <h2>{post.title}</h2>
                        <p>{post.content}</p>
                    </div>
                ))}
            </div>
        </div>

    );
}

export default Search;