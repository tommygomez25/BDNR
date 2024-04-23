import React, { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TokenContext } from './TokenContext';
import '../css/NavBar.css';
import axios from 'axios';

const NavBar = () => {
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
        <nav className="navbar">
            <ul>
                <li><Link to="/">Home</Link></li>
                <li><Link to="/search">Search</Link></li>
                {currentUser &&<li><Link to="/messages">Messages</Link></li>}
                {currentUser &&<li><Link to="/favorites">Favorites</Link></li>}
                {currentUser && <li><Link to={`/user/${currentUser}`}>Profile</Link></li>}
                {token !== "null" && <li><button className='button-logout' onClick={handleLogout}>Logout</button></li>}
                {token === "null" && <li><Link to="/login">Login</Link></li>}
                {token === "null" && <li><Link to="/register">Register</Link></li>}
            </ul>
        </nav>
    );
}

export default NavBar;
