// This tells Next.js that this page is interactive (it will have a search bar).
"use client"; 

// 'useState' is our "memory" for this component.
import { useState } from 'react';

// This is our main page
export default function Home() {
  
  // Create two "memory boxes"
  // 1. 'results' will remember the data we get from our API.
  // 2. 'isLoading' will remember if we are currently searching.
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // This function will run when a user clicks "Search"
  const handleSearch = async (postcode) => {
    setIsLoading(true); // Tell the app we are loading
    setResults(null); // Clear old results
    
    // We'll make this part work in a later step
    console.log("Searching for:", postcode);
    
    setIsLoading(false); // Tell the app we are done loading
  };

  // This is the HTML structure of our page
  return (
    <main className="max-w-3xl mx-auto p-4 md:p-8">
      
      {/* Header Section */}
      <header className="text-center my-10">
        <h1 className="text-4xl md:text-5xl font-bold text-white">
          Seasons Insights
        </h1>
        <p className="text-lg md:text-xl text-gray-400 mt-2">
          Mental health data for your community
        </p>
      </header>

      {/* Search Section (This is a placeholder for now) */}
      <div className="mb-8">
        <div className="flex gap-2">
          <input 
            type="text" 
            placeholder="Enter a UK Postcode (e.g., SW1A 0AA)"
            className="flex-grow text-lg p-3 rounded-lg border border-gray-700 bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button className="text-lg font-semibold p-3 px-6 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors">
            Search
          </button>
        </div>
      </div>

      {/* Results Section */}
      <div>
        {/* If we are loading, show a "Loading..." message */}
        {isLoading && <p className="text-center text-gray-400">Loading...</p>}
        
        {/* Later, we will put our <Results> component here */}
        {/* {results && <Results data={results} />} */}
      </div>

    </main>
  );
}