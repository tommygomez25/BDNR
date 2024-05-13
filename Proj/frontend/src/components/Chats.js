import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import Header from './Header';
import Footer from './Footer';
import { useParams } from 'react-router-dom';
import { TokenContext } from './TokenContext';

const Chats = () => {

    const [messages, setMessages] = useState([]);
    const username = useParams().username;
    const { currentUser } = useContext(TokenContext);

    useEffect(() => {
        const fetchMessages = async () => {
            try {

                const response = await axios.get(`http://localhost:5000/chats/${username}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                console.log('Messages:', response.data);
                setMessages(response.data);
            } catch (error) {
                console.error('Error fetching messages:', error);
            }
        };

        fetchMessages();
    }, [username]);


    return (
        <div className='h-screen flex flex-col'>
            <Header />
            <div className='mx-auto my-auto flex flex-col gap-y-2 w-5/12'>
                <h1 className='text-2xl font-semibold'>Messages</h1>
                <div className='flex flex-col items-center gap-4 shadow-lg bg-white p-6 rounded'>
                    {messages.map((chat) => (
                        <div className='flex gap-x-4 w-full' key={chat.id}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-sky-700">
                                <path fillRule="evenodd" d="M4.848 2.771A49.144 49.144 0 0 1 12 2.25c2.43 0 4.817.178 7.152.52 1.978.292 3.348 2.024 3.348 3.97v6.02c0 1.946-1.37 3.678-3.348 3.97a48.901 48.901 0 0 1-3.476.383.39.39 0 0 0-.297.17l-2.755 4.133a.75.75 0 0 1-1.248 0l-2.755-4.133a.39.39 0 0 0-.297-.17 48.9 48.9 0 0 1-3.476-.384c-1.978-.29-3.348-2.024-3.348-3.97V6.741c0-1.946 1.37-3.68 3.348-3.97Z" clipRule="evenodd" />
                            </svg>
                            <div className='bg-neutral-100 p-4 rounded-md w-full'>
                                <a href={`/chat/${chat.id}`} className='text-xl transition font-medium hover:text-sky-700/75 text-sky-700'>{chat.title}</a>
                                <p className='font-medium'>Chatting with: {chat.id.split(':').filter(user => user !== currentUser)[0]}</p>
                                <div className='flex gap-x-2 text-sm text-neutral-400'>
                                    <p className='font-medium'>Date Created: {chat.dateCreated}</p>
                                    <p className='font-medium'>Time Created: {chat.timeCreated}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <Footer />
        </div>
    );
}

export default Chats;