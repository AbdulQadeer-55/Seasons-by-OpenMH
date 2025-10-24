"use client";

import HealthChart from '@/components/HealthChart';
import CharityListItem from '@/components/CharityListItem';
import dynamic from 'next/dynamic';

// Dynamically import the CharityMap
const CharityMap = dynamic(() => import('@/components/CharityMap'), {
  ssr: false,
  loading: () => <p className="text-center text-gray-400">Loading map...</p>
});

export default function Results({ data }) {
  
  return (
    // --- THIS IS UPDATED ---
    // Add more spacing between cards (space-y-12)
    <div className="space-y-12">
      
      {/* 1. AI Recommendations Section */}
      {/* We make the padding and title cleaner */}
      <div className="p-6 bg-gray-800 border border-gray-700 rounded-lg">
        <h3 className="text-xl font-semibold text-white mb-4">
          Key Insights for {data.areaName}
        </h3>
        <ul className="list-disc pl-5 space-y-2 text-gray-300">
          {data.recommendations.map((rec, index) => (
            <li key={index}>{rec}</li>
          ))}
        </ul>
      </div>

      {/* 2. Health Chart Section */}
      <div className="p-6 bg-gray-800 border border-gray-700 rounded-lg">
        <h3 className="text-xl font-semibold text-white mb-4">
          Local Health Indicators
        </h3>
        <HealthChart healthData={data.healthData} />
      </div>

      {/* 3. Charities Section */}
      <div className="p-6 bg-gray-800 border border-gray-700 rounded-lg">
        <h3 className="text-xl font-semibold text-white mb-4">
          Local Support Services in {data.region}
        </h3>
        
        {/* Map */}
        <div className="mb-6">
          <CharityMap charities={data.charities} areaName={data.areaName} />
        </div>

        {/* List */}
        <div className="space-y-4">
          {data.charities.length > 0 ? (
            data.charities.map((charity) => (
              <CharityListItem key={charity.id} charity={charity} />
            ))
          ) : (
            <p className="text-gray-400">No specific charities found for this search.</p>
          )}
        </div>
      </div>

    </div>
  );
}