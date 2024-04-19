import React, { useState, useEffect } from 'react';
import axios from 'axios';

function UserDetails({ username }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/user/${username}`);
        setUser(response.data);
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };

    fetchUser();
  }, [username]);

  return (
    <div>
      {user ? (
        <div>
          <h2>User Details</h2>
          <p>Username: {user.username}</p>
          <p>Name: {user.firstName}</p>
          <p>Email: {user.email}</p>
          {/* Add other user details here */}
        </div>
      ) : (
        <p>Loading user details...</p>
      )}
    </div>
  );
}

export default UserDetails;
