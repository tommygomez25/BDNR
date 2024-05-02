import React, { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TokenContext } from './TokenContext';
import axios from 'axios';

const Header = () => {

    const { token, setToken } = useContext(TokenContext);
    const [currentUser, setCurrentUser] = useState(null);

    const handleLogout = () => {
        const confirmLogout = window.confirm('Are you sure you want to logout?');
        if (confirmLogout) {
            localStorage.removeItem('token');
            setToken(null);
        }
    };

    useEffect(() => {
        const fetchCurrentUser = async () => {
            try {
                const response = await axios.get('http://localhost:5000/current-user', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setCurrentUser(response.data.username);
            } catch (error) {
                console.error('Error fetching current user:', error);
            }
        };

        if (token !== null) {
            fetchCurrentUser();
        }
    }, [token]);

    return (
        // create a header element with an h1 element inside
        <header>
            <div className='flex gap-x-4 p-5 bg-neutral-900 text-white'>
                <Link to="/">Home</Link>
                <Link to="/search">Search</Link>

                {currentUser &&
                    <Link to="/messages">Messages</Link>
                }
                {currentUser &&
                    <Link to="/favorites">Favorites</Link>
                }
                {currentUser && 
                    <Link to={`/user/${currentUser}`}>Profile</Link>
                }
                {token !== "null" && 
                    <button className='button-logout' onClick={handleLogout}>Logout</button>
                }
                {token === "null" && 
                    <Link to="/login">Login</Link>
                }
                {token === "null" && 
                    <Link to="/register">Register</Link>
                }
            </div>
        </header>

    );
}

export default Header;