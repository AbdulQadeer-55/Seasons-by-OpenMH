"use client";

import HealthChart from '@/components/HealthChart';
import CharityListItem from '@/components/CharityListItem';
import dynamic from 'next/dynamic';

// Dynamic import for CharityMap (unchanged)
const CharityMap = dynamic(() => import('@/components/CharityMap'), {
  ssr: false,
  loading: () => <p className="text-center text-[color:var(--text-secondary)] py-4">Loading map...</p>
});

// Helper component for styled cards
const ResultCard = ({ title, children }) => (
  <div className="p-6 bg-[color:var(--bg-secondary)] border border-[color:var(--border-primary)] rounded-xl shadow-md">
    <h3 className="text-xl font-semibold text-[color:var(--text-primary)] mb-4">
      {title}
    </h3>
    {children}
  </div>
);


export default function Results({ data }) {

  return (
    // Increased spacing between cards
    <div className="space-y-12">

      {/* 1. AI Recommendations Section */}
      <ResultCard title={`Key Insights for ${data.areaName}`}>
        <ul className="list-disc pl-5 space-y-2 text-[color:var(--text-secondary)]">
          {data.recommendations.map((rec, index) => (
            <li key={index}>{rec}</li>
          ))}
        </ul>
      </ResultCard>

      {/* 2. Health Chart Section */}
      <ResultCard title="Local Health Indicators">
        <HealthChart healthData={data.healthData} />
      </ResultCard>

      {/* 3. Charities Section */}
      <ResultCard title={`Local Support Services in ${data.region || data.areaName}`}>
        {/* Map */}
        <div className="mb-6 rounded-lg overflow-hidden border border-[color:var(--border-primary)]"> {/* Added border */}
          <CharityMap charities={data.charities} areaName={data.areaName} />
        </div>

        {/* List */}
        <div className="space-y-4">
          {data.charities.length > 0 ? (
            data.charities.map((charity) => (
              <CharityListItem key={charity.id} charity={charity} />
            ))
          ) : (
            <p className="text-[color:var(--text-secondary)]">No specific charities found for this search.</p>
          )}
        </div>
      </ResultCard>

    </div>
  );
}