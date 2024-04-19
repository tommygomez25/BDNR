import logo from './logo.svg';
import './App.css';

import React from 'react';
import UserDetails from './UserDetails';


function App() {

  const username = 'ckettoelx';
  return (
    <div>
      <UserDetails username={username}/>
    </div>
  );
}

export default App;