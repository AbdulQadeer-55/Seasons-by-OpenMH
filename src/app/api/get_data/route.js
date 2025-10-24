import { NextResponse } from 'next/server';
import axios from 'axios';

// --- API Helper Functions ---

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

// 2. Fetches data from CharityBase
async function searchCharities(region) {
  // We use your personal API key from the .env.local file
  const CHARITYBASE_API_KEY = process.env.CHARITY_API_KEY; 
  const CHARITYBASE_URL = "https://charitybase.uk/api/graphql";

  // --- THIS QUERY IS NOW UPDATED ---
  // We added "geo { latitude longitude }" to the contact section
  const query = `
    query SearchCharities($region: String) {
      CHC {
        getCharities(filters: { search: "mental health", geo: { region: $region } }) {
          list(limit: 10) {
            id
            names { value }
            activities
            contact { 
              email 
              phone 
              postcode 
              geo { 
                latitude 
                longitude 
              } 
            }
            website
          }
        }
      }
    }
  `;
  // --- END OF UPDATE ---

  try {
    const response = await axios.post(
      CHARITYBASE_URL,
      { query: query, variables: { region: region } },
      { headers: { 
          'Authorization': `Apikey ${CHARITYBASE_API_KEY}`,
          'Content-Type': 'application/json'
      }}
    );
    return response.data.data.CHC.getCharities.list;
  } catch (error) {
    console.error("Error fetching charity data:", error.message);
    return [];
  }
}

// 3. Fetches REAL data from PHE Fingertips
async function fetchIndicatorData(indicatorId, areaCode) {
  const areaTypeId = 152; // Upper Tier Local Authority
  const url = `https://fingertips.phe.org.uk/api/latest_data/single_indicator_for_all_areas?indicator_id=${indicatorId}&child_area_type_id=${areaTypeId}&parent_area_code=E92000001`;

  try {
    const response = await axios.get(url);
    const allData = response.data;
    
    const localData = allData.find(d => d.AreaCode === areaCode);
    const nationalData = allData.find(d => d.AreaCode === "E92000001");
    
    if (!localData || !nationalData) {
      console.warn("Could not find local or national data for this indicator.");
      return [
        { label: areaCode, value: 0 },
        { label: "England", value: 0 }
      ];
    }
    return [
      { label: localData.AreaName, value: localData.Val },
      { label: "England", value: nationalData.Val }
    ];
    
  } catch (error) {
    console.error("Error fetching PHE data:", error.message);
    return null;
  }
}

// 4. Generates recommendations based on REAL data
function getSimpleAiRecommendations(healthData, areaName) {
  if (!healthData || healthData.length < 2 || healthData[0].value === 0) {
    return ["Could not generate insights for this data. Data may be unavailable for this area."];
  }

  const local = healthData[0];
  const national = healthData[1];
  const recommendations = [];

  const difference = local.value - national.value;
  let comparison = "similar to";
  
  if (difference > 0.5) {
    comparison = "higher than";
  } else if (difference < -0.5) {
    comparison = "lower than";
  }

  recommendations.push(
    `The rate in ${areaName} (${local.value.toFixed(1)}) is ${comparison} the national average (${national.value.toFixed(1)}).`
  );

  if (comparison === "higher than") {
    recommendations.push(
      "This suggests a higher local need. Focusing on community outreach and local support services (listed below) is recommended."
    );
  } else {
    recommendations.push(
      "This is a positive sign. Continue supporting local services to maintain this trend."
    );
  }
  return recommendations;
}

// --- Main API Function ---
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const postcode = searchParams.get('postcode');
  const indicatorId = searchParams.get('indicatorId');

  if (!postcode || !indicatorId) {
    return NextResponse.json({ error: 'Postcode and Indicator ID are required' }, { status: 400 });
  }

  try {
    const postcodeInfo = await getPostcodeInfo(postcode);
    if (!postcodeInfo) {
      return NextResponse.json({ error: 'Invalid postcode' }, { status: 404 });
    }
    
    const areaCode = postcodeInfo.codes.admin_district;
    const areaName = postcodeInfo.admin_district;

    const [charities, healthData] = await Promise.all([
        searchCharities(postcodeInfo.region),
        fetchIndicatorData(indicatorId, areaCode)
    ]);
    
    const recommendations = getSimpleAiRecommendations(healthData, areaName);

    return NextResponse.json({
      areaName: areaName,
      region: postcodeInfo.region,
      healthData: healthData,
      charities: charities, // This now includes geo-coordinates
      recommendations: recommendations
    });

  } catch (error) {
    console.error("Main API Error:", error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}