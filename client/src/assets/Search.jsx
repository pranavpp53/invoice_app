import React from "react";

const Search = ({ searchTerm, onSearchChange, placeholder = "Search..." }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-2">Filter</h3>
      <hr className="mb-4" />
      <div>
        <label htmlFor="search" className="font-medium text-gray-700 mb-2 block">
          Search:
        </label>
        <input
          type="text"
          id="search"
          className="border border-gray-300 rounded-lg p-2 w-full sm:w-48 mb-4 sm:mb-0 focus:outline-none focus:ring-2 focus:ring-blue"
          placeholder={placeholder}
          value={searchTerm}
          autoComplete="off"
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
    </div>
  );
};

export default Search;
