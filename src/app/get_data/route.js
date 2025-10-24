import { NextResponse } from 'next/server';
import axios from 'axios';

// --- API Helper Functions (from your Streamlit app) ---

// 1. Fetches data from postcodes.io
async function getPostcodeInfo(postcode) {
  try {
    const url = `https://api.postcodes.io/postcodes/${postcode}`;
    const response = await axios.get(url);
    return response.data.result;
  } catch (error) {
    console.error("Error fetching postcode data:", error.message);
    return null;
  }
}

// 2. Fetches data from CharityBase (using your secret key)
async function searchCharities(region) {
  const CHARITYBASE_API_KEY = process.env.CHARITY_API_KEY;
  const CHARITYBASE_URL = "https://charitybase.uk/api/graphql";

  // This is the same GraphQL query from your Streamlit app
  const query = `
    query SearchCharities($region: String) {
      CHC {
        getCharities(filters: { search: "mental health", geo: { region: $region } }) {
          list(limit: 10) {
            id
            names { value }
            activities
            contact { email phone postcode }
            website
          }
        }
      }
    }
  `;

  try {
    const response = await axios.post(
      CHARITYBASE_URL,
      { 
        query: query, 
        variables: { region: region } 
      },
      { 
        headers: { 
          'Authorization': `Apikey ${CHARITYBASE_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data.data.CHC.getCharities.list;
  } catch (error) {
    console.error("Error fetching charity data:", error.message);
    return [];
  }
}

// 3. Gets the hardcoded PHE data (from your Streamlit app)
function getPheData() {
  // This is the "anxiety in young people" mock data
  // We can add more from your hardcoded list later
  return [
    { label: "Anxiety in Young People (Local)", value: 4.5 },
    { label: "Anxiety in Young People (England)", value: 3.8 }
  ];
}

// 4. Generates simple AI recommendations (from your Streamlit app)
function getSimpleAiRecommendations(pheData) {
  const recommendations = [];
  const localValue = pheData[0].value;
  
  if (localValue > 4.0) {
    recommendations.push(
      "Data shows higher-than-average anxiety in young people. " +
      "Consider focusing resources on youth outreach or school partnerships."
    );
  } else {
    recommendations.push(
      "Data indicates anxiety levels are within the normal range. " +
      "Continue monitoring and supporting existing services."
    );
  }
  return recommendations;
}

// --- Main API Function ---

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const postcode = searchParams.get('postcode');

  if (!postcode) {
    return NextResponse.json({ error: 'Postcode is required' }, { status: 400 });
  }

  try {
    // 1. Get info from postcodes.io
    const postcodeInfo = await getPostcodeInfo(postcode);
    if (!postcodeInfo) {
      return NextResponse.json({ error: 'Invalid postcode' }, { status: 404 });
    }

    // 2. Get data from our helper functions
    const charities = await searchCharities(postcodeInfo.region);
    const healthData = getPheData();
    const recommendations = getSimpleAiRecommendations(healthData);

    // 3. Send all the real data back to the frontend
    return NextResponse.json({
      areaName: postcodeInfo.admin_district,
      region: postcodeInfo.region,
      healthData: healthData,
      charities: charities,
      recommendations: recommendations
    });

  } catch (error) {
    console.error("Main API Error:", error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}