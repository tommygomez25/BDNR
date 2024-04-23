import React from 'react';
import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { TokenContext } from './TokenContext';

function Navbar() {
    const { token, setToken } = useContext(TokenContext);

    const handleLogout = () => {
        const confirmLogout = window.confirm('Are you sure you want to logout?');
        if (confirmLogout) {
            localStorage.removeItem('token');
            setToken(null);
        }
    };

    return (
        <nav>
            <ul>
                {!token && <li><Link to="/login">Login</Link></li>}
                {!token && <li><Link to="/register">Register</Link></li>}
                {token && <li><button onClick={handleLogout}>Logout</button></li>}
            </ul>
        </nav>
    );
}

export default Navbar;
