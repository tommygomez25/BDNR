import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { TokenContext } from './TokenContext';

const Header = () => {

    const { token, setToken, currentUser, setCurrentUser } = useContext(TokenContext);
    const handleLogout = () => {
        const confirmLogout = window.confirm('Are you sure you want to logout?');
        if (confirmLogout) {
            localStorage.removeItem('token');
            setToken(null);
            setCurrentUser(null);
        }
    };

    return (

        <header className="bg-white">
            <div className="mx-auto flex h-16 max-w-screen-xl items-center gap-8 px-4 sm:px-6 lg:px-8">
                <Link to="/" className="flex items-center gap-2">
                    <span className="sr-only">Home</span>
                    <img src="/SocialSchema_2.svg" alt="Logo" className="h-8 w-8" />
                </Link>

                <div className="flex flex-1 items-center justify-end md:justify-between">
                    <nav aria-label="Global" className="hidden md:block">
                        <ul className="flex items-center gap-6 text-sm">
                            <li>
                                <Link to="/">Home</Link>
                            </li>

                            <li>
                                <Link to="/search">Search</Link>
                            </li>

                            <li>
                                {currentUser && <Link to="/create-post">Create Post</Link>}
                            </li>

                            <li>
                                {currentUser && <Link to={`/chats/${currentUser}`}>Messages</Link>}
                            </li>

                            <li>
                                {currentUser && <Link to={`/user/${currentUser}`}>Profile</Link>}
                            </li>
                        </ul>
                    </nav>

                    <div className="flex items-center gap-4">
                        <div className="sm:flex sm:gap-4">

                            {currentUser && token !== null && 

                                <button
                                    className="block rounded-md bg-sky-700 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-sky-700/75"
                                    onClick={handleLogout}
                                >
                                    Logout
                                </button>
                            }

                            {token === null && 
                                <Link
                                    className="block rounded-md bg-sky-700 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-sky-700/75"
                                    to="/login"
                                >
                                    Login
                                </Link>
                            }

                            {token === null &&
                                <Link
                                    className="hidden rounded-md bg-gray-100 px-5 py-2.5 text-sm font-medium text-sky-700 transition hover:text-sky-700/75 sm:block"
                                    to="/register"
                                >
                                    Register
                                </Link>
                            }
                        </div>

                        <button
                            className="block rounded bg-gray-100 p-2.5 text-gray-600 transition hover:text-gray-600/75 md:hidden"
                        >
                            <span className="sr-only">Toggle menu</span>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth="2"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </header>

    );
}

export default Header;