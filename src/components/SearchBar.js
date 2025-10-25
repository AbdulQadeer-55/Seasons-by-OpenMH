"use client";
import { useState } from 'react';

export default function SearchBar({ onSearch, isLoading }) {
  const [postcode, setPostcode] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (postcode) {
      onSearch(postcode);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-3">
      <input
        type="text"
        id="postcode-input" // For the label
        placeholder="e.g., SW1A 0AA"
        value={postcode}
        onChange={(e) => setPostcode(e.target.value)}
        // Use new palette colors and slightly improved styling
        className="flex-grow text-lg p-3 rounded-md border border-[color:var(--border-primary)] bg-[color:var(--bg-primary)] text-[color:var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-primary)] focus:border-transparent disabled:opacity-50 placeholder:text-gray-500" // Added placeholder color
        disabled={isLoading}
      />
      <button
        type="submit"
        // Use new palette colors, add padding, transition, center content
        className="text-lg font-semibold py-3 px-6 rounded-md bg-[color:var(--accent-primary)] text-white hover:bg-[color:var(--accent-hover)] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        style={{ minWidth: '100px' }} // Give button a minimum width
        disabled={isLoading}
      >
        {/* Use our CSS dots animation */}
        {isLoading ? (
          <span className="loading-dots text-white"> {/* Set dot color */}
            <span></span>
            <span></span>
            <span></span>
          </span>
        ) : (
          'Search'
        )}
      </button>
    </form>
  );
}