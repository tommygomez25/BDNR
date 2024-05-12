// App.js

import {React, useEffect, useState} from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import UserProfile from './components/UserProfile';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import PostDetailed from './components/PostDetailed';
import UpdatePost from './components/UpdatePost';
import Home from './components/Home';
import { TokenProvider } from './components/TokenContext';
import Timeline from './components/Timeline';
import Search from './components/Search';
import Chats from './components/Chats';
import Chat from './components/Chat';
import NewChatForm from './components/NewChatForm';

function App() {

  return (
    <TokenProvider>
      <Router>
        <Routes>
          <Route path={"/"} element={<Home />} />
          <Route path={"/timeline/:username"} element={<Timeline />} />
          <Route path={"/user/:username"} element={<UserProfile />} />
          <Route path={"/login"} element={<LoginForm />} />
          <Route path={"/register"} element={<RegisterForm />} />
          <Route path={"/post/:id"} element={<PostDetailed />} />
          <Route path={"/update-post/:id"} element={<UpdatePost />} />
          <Route path={"/search"} element={<Search />} />
          <Route path={"/chats/:username"} element={<Chats />} />
          <Route path={"/chat/:id"} element={<Chat />} />
          <Route path={"/new-chat/:username"} element={<NewChatForm />} />
        </Routes>
      </Router>
    </TokenProvider>
  );
}

export default App;
