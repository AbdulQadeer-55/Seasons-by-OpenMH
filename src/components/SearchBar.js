"use client";
import { useState } from 'react';

// This is our SearchBar "Lego brick."
// It receives two "wires" (props) from our page: onSearch and isLoading
export default function SearchBar({ onSearch, isLoading }) {
  
  // This component has its *own* memory to store what the user is typing.
  const [postcode, setPostcode] = useState('');

  // This runs when the user clicks the "Search" button
  const handleSubmit = (e) => {
    e.preventDefault(); // Stops the page from doing a full reload
    if (postcode) {
      onSearch(postcode); // Sends the typed postcode up the "wire" to our main page
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input 
        type="text" 
        placeholder="Enter a UK Postcode (e.g., SW1A 0AA)"
        value={postcode} // The input's value is tied to our 'postcode' memory
        onChange={(e) => setPostcode(e.target.value)} // Update the memory on every keystroke
        className="flex-grow text-lg p-3 rounded-lg border border-gray-700 bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        disabled={isLoading} // Disable the input while loading
      />
      <button 
        type="submit"
        className="text-lg font-semibold p-3 px-6 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:bg-gray-500"
        disabled={isLoading} // Disable the button while loading
      >
        {/* Show a spinner or "Search" text */}
        {isLoading ? '...' : 'Search'}
      </button>
    </form>
  );
}