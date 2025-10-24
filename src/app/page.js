"use client"; 
import { useState } from 'react';
import SearchBar from '@/components/SearchBar'; // We created this
import Results from '@/components/Results'; // This is correct

export default function Home() {
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // --- THIS FUNCTION IS NOW UPDATED ---
  const handleSearch = async (postcode) => {
    setIsLoading(true); 
    setResults(null); 
    
    try {
      // 1. Call our own API endpoint
      const response = await fetch(`/api/get_data?postcode=${postcode}`);
      
      if (!response.ok) {
        throw new Error('Something went wrong. Please try again.');
      }
      
      // 2. Get the data and save it in our 'results' memory
      const data = await response.json();
      setResults(data); 
      console.log("API Response:", data); // Log the data to the console

    } catch (error) {
      console.error(error);
    }

    setIsLoading(false); 
  };
  // --- END OF UPDATE ---

  return (
    <main className="max-w-3xl mx-auto p-4 md:p-8">
      
      {/* Header Section (This is correct) */}
      <header className="text-center my-10">
        <h1 className="text-4xl md:text-5xl font-bold text-white">
          Seasons Insights
        </h1>
        <p className="text-lg md:text-xl text-gray-400 mt-2">
          Mental health data for your community
        </p>
      </header>

      {/* Search Section (This is correct) */}
      <div className="mb-8">
        <SearchBar onSearch={handleSearch} isLoading={isLoading} />
      </div>

      {/* --- THIS SECTION IS NOW UPDATED --- */}
      <div>
        {/* 1. Show loading message */}
        {isLoading && <p className="text-center text-gray-400">Loading...</p>}
        
        {/* 2. When we have results, pass them to the Results component */}
        {results && <Results data={results} />}
      </div>
      {/* --- END OF UPDATE --- */}

    </main>
  );
}