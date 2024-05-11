import React, { useState } from 'react';
import axios from 'axios';

function NewPostForm() {
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        postPrivacy: false
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleCheckboxChange = (e) => {
        const { name, checked } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: checked
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.put('http://localhost:5000/post', formData);
            // clean form after submit
            setFormData({
                title: '',
                content: '',
                postPrivacy: false
            });
            alert('Post created successfully!');
        } catch (error) {
            console.error('Error creating post:', error);
            alert('Error creating post. Please try again later.');
        }
    };

    return (
        <>
            <h1 className='text-2xl font-semibold mt-10'>Create a New Post!</h1>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="title">Title:</label>
                    <input type="text" id="title" name="title" value={formData.title} onChange={handleChange} required />
                </div>
                <div>
                    <label htmlFor="content">Content:</label>
                    <textarea id="content" name="content" value={formData.content} onChange={handleChange} required />
                </div>
                <div>
                    <label htmlFor="postPrivacy">Private:</label>
                    <input type="checkbox" id="postPrivacy" name="postPrivacy" checked={formData.postPrivacy} onChange={handleCheckboxChange} />
                </div>
                <button type="submit">Create Post</button>
            </form>
        </>

    );
}

export default NewPostForm;
