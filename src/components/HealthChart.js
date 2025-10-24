"use client";

import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function HealthChart({ healthData }) {

  // --- THIS IS THE NEW CHECK ---
  // If healthData is null, empty, or doesn't have the expected structure,
  // show an error message instead of trying to render the chart.
  if (!healthData || !Array.isArray(healthData) || healthData.length < 2) {
    return (
      <div className="text-center text-red-400 py-4">
        Could not load chart data. The data source may be unavailable.
      </div>
    );
  }
  // --- END OF NEW CHECK ---

  // Format data for Chart.js
  const data = {
    // Check if labels exist before mapping
    labels: healthData.map(d => d?.label || 'Unknown'), 
    datasets: [
      {
        label: 'Indicator Value',
         // Check if values exist before mapping
        data: healthData.map(d => d?.value || 0),
        backgroundColor: [
          'rgba(74, 144, 226, 0.6)', // Blue
          'rgba(156, 163, 175, 0.6)', // Gray
        ],
        borderColor: [
          'rgba(74, 144, 226, 1)',
          'rgba(156, 163, 175, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Chart options (unchanged)
  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: 'Local vs. National Comparison',
        color: '#EAEAEA', 
        font: { size: 16 }
      },
    },
    scales: {
      y: {
        ticks: { color: '#EAEAEA' }, 
        grid: { color: 'rgba(255, 255, 255, 0.1)' } 
      },
      x: {
        ticks: { color: '#EAEAEA' }, 
        grid: { color: 'rgba(255, 255, 255, 0.1)' } 
      }
    }
  };

  return <Bar options={options} data={data} />;
}