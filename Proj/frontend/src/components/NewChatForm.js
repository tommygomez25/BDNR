import React, { useState, useContext } from 'react';
import axios from 'axios';
import Header from './Header';
import Footer from './Footer';
import { useParams } from 'react-router-dom';
import { TokenContext } from './TokenContext';

function NewChatForm() {
    const [formData, setFormData] = useState({
        title: '',
        id: '',
    });

    const { currentUser } = useContext(TokenContext);
    const { username } = useParams();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    const id = `${currentUser}:${username}`;
    formData.id = id;

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.put('http://localhost:5000/create-chat', formData);
            // clean form after submit
            setFormData({
                title: '',
                id: '',
            });
            alert('Chat created successfully!');
        } catch (error) {
            console.error('Error creating chat:', error);
            alert('Error creating chat. Please try again later.');
        }
    };

    return (
        <div className='h-screen flex flex-col'>
            <Header />
                <div className='mx-auto my-auto flex flex-col gap-y-2 w-5/12'>
                    <h1 className='text-2xl font-semibold mt-10'>Create a New Chat</h1>
                    <form onSubmit={handleSubmit} className='flex flex-col items-center gap-4 shadow-lg bg-white p-6 rounded'>
                        <input
                            type='text'
                            placeholder='Chat Title'
                            name='title'
                            value={formData.title}
                            onChange={handleChange}
                            className='rounded-md p-2.5 w-full border-gray-300 border mx-5'
                        />
                        <button
                            type='submit'
                            className='rounded-md bg-sky-700 text-white p-2.5 w-full font-semibold transition hover:bg-sky-700/75'
                        >
                            Create Chat
                        </button>
                    </form>
                </div>
            <Footer />
        </div>
    );

}

export default NewChatForm;