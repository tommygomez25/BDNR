import React, { useState } from 'react';
import Header from './Header';
import Footer from './Footer';
import axios from 'axios';
import '../index.css';

const Search = () => {

    const [posts, setPosts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchPosts = async () => {
        const keywords = searchTerm.trim().split(' ').join(',');

        try {
            const response = await axios.get(`http://localhost:5000/search-post?keywords=${keywords}`);
            console.log('Data received:', response.data);
            setPosts(response.data.posts);
        } catch (error) {
            console.error('Error fetching posts:', error);
        }
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        fetchPosts();
    }

    return (
        <div className='h-screen flex flex-col'>
            <Header />
            <div className='shadow-lg bg-white p-4 my-4 mb-auto mx-auto w-7/12 rounded'>
                <form className='flex m-5 gap-x-4' onSubmit={handleSubmit}>
                    <input type='text' placeholder='Search for posts...' onChange={(e) => {setSearchTerm(e.target.value)}} className='px-5 py-2.5 bg-neutral-200 rounded-md block w-full' />
                    <button className='block rounded-md bg-sky-700 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-sky-700/75'>Search</button>
                </form>
                <div className='flex flex-col gap-y-4 mt-4'>
                    {posts.map(post => (
                        <div key={post.id} className='bg-neutral-100 p-4 mx-5 rounded-md'>
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

            <Footer />
        </div>
    );
}

export default Search;
