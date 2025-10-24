"use client";

// We import the 'Bar' chart component
import { Bar } from 'react-chartjs-2';

// We MUST import and register the parts of chart.js we want to use
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// This "registers" the parts, telling chart.js we're going to use them
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// This is our chart component. It receives the 'healthData' from our API.
export default function HealthChart({ healthData }) {

  // 1. We format our API data into the structure Chart.js needs
  const data = {
    labels: healthData.map(d => d.label), // e.g., ["Local", "England"]
    datasets: [
      {
        label: 'Indicator Value',
        data: healthData.map(d => d.value), // e.g., [4.5, 3.8]
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

  // 2. We set options to make the chart look good in dark mode
  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false, // We don't need the legend for this simple chart
      },
      title: {
        display: true,
        text: 'Local vs. National Comparison',
        color: '#EAEAEA', // Light text
        font: { size: 16 }
      },
    },
    scales: {
      y: {
        ticks: { color: '#EAEAEA' }, // Light text for Y-axis labels
        grid: { color: 'rgba(255, 255, 255, 0.1)' } // Faint grid lines
      },
      x: {
        ticks: { color: '#EAEAEA' }, // Light text for X-axis labels
        grid: { color: 'rgba(255, 255, 255, 0.1)' } // Faint grid lines
      }
    }
  };

  // 3. We return the <Bar /> component with our data and options
  return <Bar options={options} data={data} />;
}