import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from './Header';
import Footer from './Footer';
import { useParams } from 'react-router-dom';

const Chat = () => {
    const [chat, setChat] = useState(null);
    const { id } = useParams();
    
    useEffect(() => {
        const fetchChat = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/messages/${id}`, { headers
        : { Authorization: `Bearer ${localStorage.getItem('token')}` } });
            console.log('Chat:', response.data);
            setChat(response.data);
        } catch (error) {
            console.error('Error fetching chat:', error);
        }
        };
    
        fetchChat();
    }, [id]);
    
    return (
        <div className='h-screen flex flex-col'>
        <Header />
        <div className='mx-auto my-auto flex flex-col gap-y-2 w-3/12'>
            <h1 className='text-2xl font-semibold mt-10'>Chat</h1>
            <div className='flex flex-col items-center gap-4 shadow-lg bg-white p-6 rounded'>
            {chat && chat.map((message, index) => (
                <div key={index} className='flex flex-col gap-y-1'>
                    <p>{message.content}</p>
                </div>
            ))}
            </div>
        </div>
        <Footer />
        </div>
    );
}

export default Chat;