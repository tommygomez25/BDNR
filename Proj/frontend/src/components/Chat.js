import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import Header from './Header';
import Footer from './Footer';
import { useParams } from 'react-router-dom';
import { TokenContext } from './TokenContext';

const Chat = () => {
    const [chat, setChat] = useState(null);
    const [message, setMessage] = useState('');
    const { currentUser } = useContext(TokenContext);
    const { id } = useParams();

    const sendMessage = async (e) => {
        e.preventDefault();
        
        const receiver = id.split(':').filter(user => user !== currentUser)[0];

        if(!message) return alert('Please type a message!');

        try {
            await axios.post('http://localhost:5000/send-message', {
                id: id,
                sender: currentUser,
                receiver,
                content: message
            }, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

            setMessage('');
        } catch (error) {
            console.error('Error sending message:', error);
        }
    }
    
    useEffect(() => {
        const fetchChat = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/messages/${id}`, { headers
        : { Authorization: `Bearer ${localStorage.getItem('token')}` } });

            console.log('Response:', response);

            console.log('Chat:', response.data);
            setChat(response.data);

            // order chat by date and time
            setChat(chat => chat.sort((a, b) => {
                const dateA = new Date(`${a.dateSent} ${a.timeSent}`);
                const dateB = new Date(`${b.dateSent} ${b.timeSent}`);
                return dateA - dateB;
            }));

        } catch (error) {
            console.error('Error fetching chat:', error);
        }
        };
    
        fetchChat();
    }, [id]);
    
    return (
        <div className='h-screen flex flex-col'>
            <Header />
            <div className='mx-auto my-auto flex flex-col gap-y-2 w-5/12'>
                {!currentUser ? (
                    <h1 className='text-2xl font-semibold'>Please login to view chat!</h1>
                ) : (
                <>
                    <h1 className='text-2xl font-semibold'>Chat</h1>
                    <div className='flex flex-col overflow-y-auto max-h-[70vh] items-center gap-4 shadow-lg bg-white p-6 rounded'>
                        {chat && chat.map((message, index) => (
                            <div key={index} className="flex w-full gap-y-4">
                                {message.senderID === currentUser ? (
                                    <div className='ml-auto w-9/12 flex flex-col items-end mb-4'>
                                        <p className='text-right text-white bg-sky-700 rounded-md p-2.5'>{message.content}</p>
                                        <div className='flex gap-x-2'>
                                            <p className='text-sm text-gray-400'>{message.senderID}</p>
                                            <p className='text-sm text-gray-400'>{message.dateSent}</p>
                                            <p className='text-sm text-gray-400'>{message.timeSent}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className='mr-auto w-9/12 flex flex-col items-start mb-4'>
                                        <p className='text-left bg-gray-200 rounded-md p-2.5'>{message.content}</p>
                                        <div className='flex gap-x-2'>
                                            <p className='text-sm text-gray-400'>{message.senderID}</p>
                                            <p className='text-sm text-gray-400'>{message.dateSent}</p>
                                            <p className='text-sm text-gray-400'>{message.timeSent}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}

                        <form className='flex justify-between w-full gap-x-2 mb-1' onSubmit={sendMessage}>
                            <input
                                type='text'
                                placeholder='Type a message...'
                                className='rounded-md p-2.5 w-full border-gray-300 border'
                                value={message}
                                onChange={(e) => setMessage(e.target.value)} />
                            <button
                                type='submit'
                                className='text-sky-700 transition hover:text-sky-700/75'
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                                    <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
                                </svg>
                            </button>
                        </form>

                    </div>
                    </>
                )}

            </div>
            <Footer />
        </div>
    );
}

export default Chat;