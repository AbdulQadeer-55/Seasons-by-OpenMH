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

  // Error handling (unchanged)
  if (!healthData || !Array.isArray(healthData) || healthData.length < 2) {
    return (
      <div className="text-center text-red-400 py-4">
        Could not load chart data. The data source may be unavailable.
      </div>
    );
  }

  // Format data for Chart.js
  const data = {
    labels: healthData.map(d => d?.label || 'Unknown'),
    datasets: [
      {
        label: 'Indicator Value',
        data: healthData.map(d => d?.value || 0),
        // Use palette colors
        backgroundColor: [
          'rgba(88, 166, 255, 0.7)', // Accent blue with transparency
          'rgba(139, 148, 158, 0.7)', // Secondary text gray with transparency
        ],
        borderColor: [
          'rgb(88, 166, 255)', // Accent blue
          'rgb(139, 148, 158)', // Secondary text gray
        ],
        borderWidth: 1,
        borderRadius: 4, // Add slight rounding to bars
      },
    ],
  };

  // Update options for new palette
  const options = {
    responsive: true,
    maintainAspectRatio: false, // Allow height adjustment
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: 'Local vs. National Comparison',
        color: '#E6EDF3', // Primary text
        font: { size: 16 }
      },
      tooltip: { // Style tooltips
        backgroundColor: '#0D1117', // Primary bg
        titleColor: '#E6EDF3',
        bodyColor: '#E6EDF3',
        borderColor: '#30363D', // Border
        borderWidth: 1,
      }
    },
    scales: {
      y: {
        beginAtZero: true, // Ensure Y axis starts at 0
        ticks: { color: '#8B949E' }, // Secondary text
        grid: { color: 'rgba(48, 54, 61, 0.5)' } // Lighter border color for grid
      },
      x: {
        ticks: { color: '#8B949E' }, // Secondary text
        grid: { display: false } // Hide vertical grid lines for cleaner look
      }
    }
  };

  // Add a wrapper div to control height
  return (
      <div style={{ height: '300px' }}> {/* Set a fixed height */}
          <Bar options={options} data={data} />
      </div>
  );
}