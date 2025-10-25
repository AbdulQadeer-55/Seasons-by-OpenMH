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

  // --- THIS CHECK IS NOW SIMPLER ---
  // We only need to check if the array exists and has at least two items
  // (We don't expect null anymore, only real or mock data)
  if (!Array.isArray(healthData) || healthData.length < 2) {
    // This message should rarely appear now, unless the API structure is broken
    return (
      <div className="text-center text-red-400 py-4">
        Invalid chart data format received.
      </div>
    );
  }
  // --- END OF UPDATED CHECK ---

  // Format data for Chart.js
  const data = {
    labels: healthData.map(d => d?.label || 'Unknown'),
    datasets: [
      {
        label: 'Indicator Value',
        data: healthData.map(d => d?.value || 0),
        backgroundColor: [
          'rgba(88, 166, 255, 0.7)', // Accent blue
          'rgba(139, 148, 158, 0.7)', // Secondary gray
        ],
        borderColor: [
          'rgb(88, 166, 255)',
          'rgb(139, 148, 158)',
        ],
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };

  // Chart options (unchanged)
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: 'Local vs. National Comparison',
        color: '#E6EDF3',
        font: { size: 16 }
      },
      tooltip: {
        backgroundColor: '#0D1117',
        titleColor: '#E6EDF3',
        bodyColor: '#E6EDF3',
        borderColor: '#30363D',
        borderWidth: 1,
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { color: '#8B949E' },
        grid: { color: 'rgba(48, 54, 61, 0.5)' }
      },
      x: {
        ticks: { color: '#8B949E' },
        grid: { display: false }
      }
    }
  };

  return (
      <div style={{ height: '300px' }}>
          <Bar options={options} data={data} />
      </div>
  );
}