"use client"; 
import { useState } from 'react'; // Removed useEffect
import SearchBar from '@/components/SearchBar';
import Results from '@/components/Results';

// --- THIS IS THE FALLBACK LIST ---
// We put the hardcoded list back temporarily
const mentalHealthIndicators = [
  { "Id": 90805, "Name": "Wellbeing: average anxiety score" },
  { "Id": 90248, "Name": "Depression: QOF prevalence (18+)" },
  { "Id": 30501, "Name": "Common mental disorders: prevalence" },
  { "Id": 90247, "Name": "Suicide rate (persons, 10+)" },
  { "Id": 41001, "Name": "Self-harm hospital admissions (10-24)" },
  { "Id": 90806, "Name": "Wellbeing: average life satisfaction score" },
];
// --- END OF FALLBACK LIST ---

export default function Home() {
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // --- THIS IS UPDATED ---
  // We use the hardcoded list directly
  const [indicatorList, setIndicatorList] = useState(mentalHealthIndicators); 
  // We default to the first ID from the hardcoded list
  const [selectedIndicator, setSelectedIndicator] = useState(mentalHealthIndicators[0].Id);
  // --- END OF UPDATE ---

  // --- THIS IS REMOVED ---
  // useEffect(() => { ... }); 
  // We deleted the useEffect hook that called /api/get_indicators
  // --- END OF REMOVED ---

  const handleSearch = async (postcode) => {
    setIsLoading(true); 
    setResults(null); 
    
    // We still check if a topic is selected (should always be true now)
    if (!selectedIndicator) {
      alert("Please select a mental health topic.");
      setIsLoading(false);
      return;
    }
    
    try {
      const response = await fetch(`/api/get_data?postcode=${postcode}&indicatorId=${selectedIndicator}`);
      if (!response.ok) { throw new Error('API fetch failed'); }
      const data = await response.json();
      setResults(data); 
      console.log("API Response:", data);
    } catch (error) { console.error(error); }
    
    setIsLoading(false); 
  };

  return (
    <main className="max-w-4xl mx-auto p-4 md-p-8">
      <header className="text-center my-12">
        <h1 className="text-3xl font-semibold text-white">Seasons Insights</h1>
        <p className="text-lg text-gray-400 mt-1">
          Find mental health data and services in your community.
        </p>
      </header>

      {/* This search card now uses the hardcoded list */}
      <div className="mb-12 p-6 bg-gray-800 border border-gray-700 rounded-lg space-y-4">
        <div>
          <label htmlFor="topic-select" className="block text-sm font-medium text-gray-300 mb-1">
            1. Select a Mental Health Topic
          </label>
          <select
            id="topic-select"
            value={selectedIndicator}
            onChange={(e) => setSelectedIndicator(e.target.value)}
            // --- THIS IS UPDATED ---
            // The dropdown is never disabled now
            className="w-full text-lg p-3 rounded-lg border border-gray-600 bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {/* We map directly over our hardcoded list */}
            {indicatorList.map((indicator) => (
              <option key={indicator.Id} value={indicator.Id}>
                {indicator.Name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="postcode-input" className="block text-sm font-medium text-gray-300 mb-1">
            2. Enter Postcode
          </label>
          <SearchBar onSearch={handleSearch} isLoading={isLoading} />
        </div>
      </div>

      <div>
        {isLoading && <div className="text-center py-10"><p className="text-gray-400">Loading...</p></div>}
        {results && <Results data={results} />}
      </div>
    </main>
  );
}