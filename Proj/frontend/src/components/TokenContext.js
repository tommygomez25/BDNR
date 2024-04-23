import React, { createContext, useState } from 'react';

const TokenContext = createContext();

const TokenProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'));

  const updateToken = (newToken) => {
    setToken(newToken);
    localStorage.setItem('token', newToken);
  };

  return (
    <TokenContext.Provider value={{ token, setToken: updateToken }}>
      {children}
    </TokenContext.Provider>
  );
};

export { TokenContext, TokenProvider };
