// App.js

import {React, useEffect, useState} from 'react';
import * as ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import UserProfile from './components/UserProfile';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import PostDetailed from './components/PostDetailed';
import UpdatePost from './components/UpdatePost';
import { TokenProvider } from './components/TokenContext';
import NavBar from './components/NavBar';
import axios from 'axios';


function App() {

  return (
    <TokenProvider>
      <Router>
        <NavBar />
        <Routes>
          <Route path={"/user/:username"} element={<UserProfile />} />
          <Route path={"/login"} element={<LoginForm />} />
          <Route path={"/register"} element={<RegisterForm />} />
          <Route path={"/post/:id"} element={<PostDetailed />} />
          <Route path={"/update-post/:id"} element={<UpdatePost />} />
        </Routes>
      </Router>
    </TokenProvider>
  );
}

export default App;
