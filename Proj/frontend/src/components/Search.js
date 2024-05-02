import React, { useState, useEffect } from 'react';

import axios from 'axios';
import '../css/Search.css';

const Search = () => {

    return (
        <div className="search-container">
            <h2 className="search-heading">Search</h2>
            <div className="search-posts">
                <form>
                    <input type="text" placeholder="Search for posts..." />
                    <button type="submit">Search</button>
                </form>
            </div>
        </div>
    );
}

export default Search;