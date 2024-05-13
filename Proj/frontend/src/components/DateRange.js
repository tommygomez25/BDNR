import React, { useState } from 'react';
import Header from './Header';
import Footer from './Footer';
import axios from 'axios';

const DateRange = () => {
    
        const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
        const [posts, setPosts] = useState([]);

        const formatDate = (date) => {
            // make sure the date is in the format DD/MM/YYYY
            const auxDate = new Date(date);
            const day = auxDate.getDate();
            const month = auxDate.getMonth() + 1;
            const year = auxDate.getFullYear();

            return `${day}/${month}/${year}`;
        }
    
        const handleSubmit = async (e) => {
            e.preventDefault();

            if(!dateRange.startDate || !dateRange.endDate) return alert('Please select a start and end date.');

            // convert startDate and endDate to timestamps not in milliseconds but in seconds
            const auxDateRange = { ...dateRange };
            auxDateRange.startDate = new Date(dateRange.startDate).getTime() / 1000;
            auxDateRange.endDate = new Date(dateRange.endDate).getTime() / 1000;
    
            try {
                const response = await axios.get('http://localhost:5000/posts-by-date', { params: auxDateRange });
                console.log('Data received:', response.data);
                setPosts(response.data);

                setDateRange({ startDate: '', endDate: '' });

                

                

            } catch (error) {
                console.error('Error submitting date range:', error);
            }
        }
    
        return (
            <div className='h-screen flex flex-col'>
                <Header />
                <div className='shadow-lg overflow-y-auto max-h-[70vh] bg-white p-4 my-4 my-auto mx-auto w-7/12 rounded'>
                    <form className='flex m-5 gap-x-4' onSubmit={handleSubmit}>
                        <input type='date' placeholder='Start Date' onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })} className='px-5 py-2.5 bg-neutral-200 rounded-md block w-full' />
                        <input type='date' placeholder='End Date' onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })} className='px-5 py-2.5 bg-neutral-200 rounded-md block w-full' />
                        <button className='block rounded-md bg-sky-700 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-sky-700/75'>Submit</button>
                    </form>
                    <div className='flex flex-col gap-y-4 mt-4'>
                        {posts.map(post => (
                            <div key={post.id} className='bg-neutral-100 p-4 mx-5 rounded-md'>
                                <a href={`/post/${post.id}`} className='text-xl transition font-medium hover:text-sky-700/75 text-sky-700'>{post.title}</a>
                                <div className='flex gap-x-2'>
                                    <a href={`/user/${post.username}`} className='text-gray-600 text-xs hover:text-sky-700'>{post.username}</a>
                                    <p className='text-gray-600 text-xs'>{formatDate(post.postDate)} {post.postTime}</p>
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

export default DateRange;
