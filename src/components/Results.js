import HealthChart from '@/components/HealthChart';
// This component will receive all the data from our API
export default function Results({ data }) {
  
  // 'data' will look like this:
  // { areaName: "Westminster", region: "London", ... }

  return (
    <div className="space-y-8">
      
      {/* 1. AI Recommendations Section */}
      <div className="p-4 bg-gray-800 border border-gray-700 rounded-lg">
        <h3 className="text-2xl font-bold text-white mb-3">
          Key Insights for {data.areaName}
        </h3>
        <ul className="list-disc pl-5 space-y-2 text-gray-300">
          {data.recommendations.map((rec, index) => (
            <li key={index}>{rec}</li>
          ))}
        </ul>
      </div>

      {/* 2. Health Chart Section */}
<div className="p-4 bg-gray-800 border border-gray-700 rounded-lg">
  <h3 className="text-2xl font-bold text-white mb-3">
    Local Health Indicators
  </h3>

  {/* This now uses our new component, passing the data to it */}
  <HealthChart healthData={data.healthData} />

</div>

      {/* 3. Charities Section (Placeholder) */}
      <div className="p-4 bg-gray-800 border border-gray-700 rounded-lg">
        <h3 className="text-2xl font-bold text-white mb-3">
          Local Support Services
        </h3>
        {/* We will replace this with our <CharityMap> component */}
        <div className="text-center text-gray-400">
          Map will go here.
        </div>
      </div>

    </div>
  );
}