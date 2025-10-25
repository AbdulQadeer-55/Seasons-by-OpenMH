"use client";

import HealthChart from '@/components/HealthChart';
import CharityListItem from '@/components/CharityListItem';
import dynamic from 'next/dynamic';

// Dynamic import for CharityMap (unchanged)
const CharityMap = dynamic(() => import('@/components/CharityMap'), {
  ssr: false,
  loading: () => <p className="text-center text-[color:var(--text-secondary)] py-4">Loading map...</p>
});

// Helper component for styled cards (unchanged)
const ResultCard = ({ title, children }) => (
  <div className="p-6 bg-[color:var(--bg-secondary)] border border-[color:var(--border-primary)] rounded-xl shadow-md">
    <h3 className="text-xl font-semibold text-[color:var(--text-primary)] mb-4">
      {title}
    </h3>
    {children}
  </div>
);

// --- NEW: Warning Message Component ---
const MockDataWarning = ({ serviceName }) => (
    <div className="mb-4 p-3 bg-yellow-900/50 border border-yellow-700/80 rounded-md text-yellow-300 text-sm">
        ⚠️ The {serviceName} API is currently unavailable. Showing example data. Live data will appear automatically when the service recovers.
    </div>
);
// --- END NEW COMPONENT ---

export default function Results({ data }) {
  // Destructure the new mock flags from the data prop
  const {
      areaName,
      region,
      healthData,
      isHealthDataMock,
      charities,
      isCharityDataMock,
      recommendations,
      isInsightDataMock // This will usually match isHealthDataMock
  } = data;

  return (
    <div className="space-y-12">

      {/* 1. AI Recommendations Section */}
      <ResultCard title={`Key Insights for ${areaName}`}>
        {/* Show warning if insights are based on mock data */}
        {isInsightDataMock && <MockDataWarning serviceName="PHE Data" />}
        <ul className="list-disc pl-5 space-y-2 text-[color:var(--text-secondary)]">
          {recommendations.map((rec, index) => (
            <li key={index}>{rec}</li>
          ))}
        </ul>
      </ResultCard>

      {/* 2. Health Chart Section */}
      <ResultCard title="Local Health Indicators">
        {/* Show warning if chart data is mock */}
        {isHealthDataMock && <MockDataWarning serviceName="PHE Data" />}
        {/* Pass healthData (could be real or mock) to the chart component */}
        <HealthChart healthData={healthData} />
      </ResultCard>

      {/* 3. Charities Section */}
      <ResultCard title={`Local Support Services in ${region || areaName}`}>
         {/* Show warning if charity data is mock */}
        {isCharityDataMock && <MockDataWarning serviceName="CharityBase" />}

        {/* Map */}
        <div className="mb-6 rounded-lg overflow-hidden border border-[color:var(--border-primary)]">
          {/* Pass charities (could be real or mock) to the map */}
          <CharityMap charities={charities} areaName={areaName} />
        </div>

        {/* List */}
        <div className="space-y-4">
          {charities.length > 0 ? (
            charities.map((charity) => (
              <CharityListItem key={charity.id} charity={charity} />
            ))
          ) : (
             // Show a more specific message if CharityBase failed and returned empty mock []
            isCharityDataMock ? (
                 <p className="text-[color:var(--text-secondary)]">Could not load charities due to API issues. Example data shown above may not have charities.</p>
            ) : (
                 <p className="text-[color:var(--text-secondary)]">No specific charities found matching your search.</p>
            )
          )}
        </div>
      </ResultCard>

    </div>
  );
}