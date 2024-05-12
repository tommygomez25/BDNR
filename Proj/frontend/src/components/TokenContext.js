import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

const TokenContext = createContext();

const TokenProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    
    const fetchCurrentUser = async () => {
      try {
          const response = await axios.get('http://localhost:5000/current-user', {
              headers: { Authorization: `Bearer ${token}` }
          });
          setCurrentUser(response.data.username);
      } catch (error) {
          console.error('Error fetching current user:', error);
          // reset token if error fetching current user
          localStorage.removeItem('token');
          setToken(null);
      }
  };
  
    if(token) {
      fetchCurrentUser();
    } else {
      setCurrentUser(null);
    }
  }, [token]);



  const updateToken = (newToken) => {
    setToken(newToken);
    localStorage.setItem('token', newToken);
  };

  return (
    <TokenContext.Provider value={{ token, currentUser, setCurrentUser, setToken: updateToken }}>
      {children}
    </TokenContext.Provider>
  );
};

export { TokenContext, TokenProvider };
