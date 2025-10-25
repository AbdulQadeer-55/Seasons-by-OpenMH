"use client";
import { useState } from 'react';
import SearchBar from '@/components/SearchBar';
import Results from '@/components/Results';

// Fallback indicator list (unchanged)
const mentalHealthIndicators = [
  { "Id": 90805, "Name": "Wellbeing: average anxiety score" },
  { "Id": 90248, "Name": "Depression: QOF prevalence (18+)" },
  { "Id": 30501, "Name": "Common mental disorders: prevalence" },
  { "Id": 90247, "Name": "Suicide rate (persons, 10+)" },
  { "Id": 41001, "Name": "Self-harm hospital admissions (10-24)" },
  { "Id": 90806, "Name": "Wellbeing: average life satisfaction score" },
];

export default function Home() {
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [indicatorList, setIndicatorList] = useState(mentalHealthIndicators);
  const [selectedIndicator, setSelectedIndicator] = useState(mentalHealthIndicators[0].Id);

  // handleSearch function (unchanged - includes simulated delay)
  const handleSearch = async (postcode) => {
    setIsLoading(true);
    setResults(null);
    if (!selectedIndicator) {
      alert("Please select a mental health topic.");
      setIsLoading(false);
      return;
    }
    try {
      // Simulate API delay for testing animation
      await new Promise(resolve => setTimeout(resolve, 1500)); 
      
      const response = await fetch(`/api/get_data?postcode=${postcode}&indicatorId=${selectedIndicator}`);
      if (!response.ok) { throw new Error('API fetch failed'); }
      const data = await response.json();
      setResults(data);
      console.log("API Response:", data);
    } catch (error) { console.error(error); }
    setIsLoading(false);
  };

  return (
    <main className="max-w-4xl mx-auto px-4 py-8 md:py-16">
      <header className="text-center mb-12 md:mb-16">
        <h1 className="text-4xl md:text-5xl font-semibold text-[color:var(--text-primary)] tracking-tight">
          Seasons Insights
        </h1>
        <p className="text-lg md:text-xl text-[color:var(--text-secondary)] mt-3">
          Find mental health data and services in your community.
        </p>
      </header>

      <div className="mb-12 p-6 md:p-8 bg-[color:var(--bg-secondary)] border border-[color:var(--border-primary)] rounded-xl shadow-lg space-y-5">
        <div>
          <label htmlFor="topic-select" className="block text-sm font-medium text-[color:var(--text-secondary)] mb-1.5">
            1. Select a Mental Health Topic
          </label>
          <select
            id="topic-select"
            value={selectedIndicator}
            onChange={(e) => setSelectedIndicator(e.target.value)}
            className="w-full text-lg p-3 rounded-md border border-[color:var(--border-primary)] bg-[color:var(--bg-primary)] text-[color:var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-primary)] focus:border-transparent disabled:opacity-50"
          >
            {indicatorList.map((indicator) => (
              <option key={indicator.Id} value={indicator.Id}>
                {indicator.Name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="postcode-input" className="block text-sm font-medium text-[color:var(--text-secondary)] mb-1.5">
            2. Enter Postcode
          </label>
          <SearchBar onSearch={handleSearch} isLoading={isLoading} />
        </div>
      </div>

      {/* Results Section */}
      <div>
        {/* Use the CSS dots animation for main loading */}
        {isLoading && (
          <div className="flex justify-center items-center flex-col text-center py-10">
            {/* Use our CSS dots animation */}
            <span className="loading-dots text-[color:var(--accent-primary)]" style={{ transform: 'scale(1.5)' }}> {/* Make main dots slightly larger */}
              <span></span>
              <span></span>
              <span></span>
            </span>
            <p className="text-[color:var(--text-secondary)] mt-4">Fetching data...</p> {/* Increased margin */}
          </div>
        )}
        
        {/* Only show results if NOT loading */}
        {!isLoading && results && <Results data={results} />}
      </div>
    </main>
  );
}