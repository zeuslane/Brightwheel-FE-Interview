import "./Search.css";
import React from "react";

const Search = ({ onSearch }) => {
  return (
    <form className="Search">
      <label htmlFor="search">Search: </label>
      <input
        id="search"
        type="text"
        className="Search-input"
        onChange={onSearch} />
    </form>
  )
};

export default Search;
