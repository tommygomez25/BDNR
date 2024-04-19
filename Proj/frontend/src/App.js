// App.js

import React from 'react';
import * as ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import UserProfile from './components/UserProfile';

function App() {
  return (
    <Router>
      <Routes>
        <Route path={"/user/:username"} element={<UserProfile />} />
      </Routes>
    </Router>
  );
}

export default App;
