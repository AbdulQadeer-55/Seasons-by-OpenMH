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

// 2. --- THIS FUNCTION IS NOW UPDATED ---
// Fetches data from CharityBase using postcode + distance
async function searchCharities(postcode) {
  const CHARITYBASE_API_KEY = process.env.CHARITY_API_KEY; 
  const CHARITYBASE_URL = "https://charitybase.uk/api/graphql";

  // We change the query to accept a postcode ($address)
  // and remove the invalid region filter
  const query = `
    query SearchCharities($address: String) {
      CHC {
        getCharities(filters: { search: "mental health", geo: { address: $address, distance: "10mi" } }) {
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

  try {
    const response = await axios.post(
      CHARITYBASE_URL,
      // We send the postcode in the 'variables' object
      { 
        query: query, 
        variables: { address: postcode } 
      },
      { 
        headers: { 
          'Authorization': `Apikey ${CHARITYBASE_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Check for GraphQL errors in the response
     if (response.data.errors) {
       console.error("CharityBase GraphQL Error:", response.data.errors);
       return [];
     }

    return response.data.data.CHC.getCharities.list;
    
  } catch (error) {
    console.error("Error fetching charity data:", error.message);
    // Log detailed error if available
     if (error.response) {
       console.error("CharityBase HTTP Error Status:", error.response.status);
       console.error("CharityBase HTTP Error Data:", error.response.data);
     }
    return [];
  }
}
// --- END OF UPDATE ---


// 3. Fetches REAL data from PHE Fingertips
async function fetchIndicatorData(indicatorId, areaCode) {
  const areaTypeId = 152;
  const url = `https://fingertips.phe.org.uk/api/latest_data/single_indicator_for_all_areas?indicator_id=${indicatorId}&child_area_type_id=${areaTypeId}&parent_area_code=E92000001`;

  try {
    const response = await axios.get(url);
    const allData = response.data;
    
    const localData = allData.find(d => d.AreaCode === areaCode);
    const nationalData = allData.find(d => d.AreaCode === "E92000001");
    
    if (!localData || !nationalData) {
      console.warn(`PHE Data Warning: Could not find local (${areaCode}) or national data for indicator ${indicatorId}.`);
      return null; // Return null if data is incomplete
    }
    return [
      { label: localData.AreaName, value: localData.Val },
      { label: "England", value: nationalData.Val }
    ];
    
  } catch (error) {
    // Log PHE errors but don't crash the whole API call
    console.error(`PHE Data Error for indicator ${indicatorId}: ${error.message}`);
     if (error.response) {
       console.error("PHE HTTP Error Status:", error.response.status);
     }
    return null; // Return null on error
  }
}

// 4. Generates recommendations based on REAL data
function getSimpleAiRecommendations(healthData, areaName) {
  // Now handles null healthData gracefully
  if (!healthData || healthData.length < 2 || healthData[0].value === 0) {
    return ["Could not generate insights for this data. Data may be unavailable for this area."];
  }

  const local = healthData[0];
  const national = healthData[1];
  const recommendations = [];
  const difference = local.value - national.value;
  let comparison = "similar to";
  
  if (difference > (national.value * 0.1)) { // More than 10% higher
    comparison = "higher than";
  } else if (difference < -(national.value * 0.1)) { // More than 10% lower
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

// --- Main API Function (Updated) ---
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

    // We pass the postcode directly to searchCharities now
    const [charities, healthData] = await Promise.all([
        searchCharities(postcode), // Changed from postcodeInfo.region
        fetchIndicatorData(indicatorId, areaCode)
    ]);
    
    // Recommendations generation is unchanged, handles null healthData
    const recommendations = getSimpleAiRecommendations(healthData, areaName);

    // Return all data, even if some parts failed (like healthData)
    return NextResponse.json({
      areaName: areaName,
      region: postcodeInfo.region, // Still useful for display
      healthData: healthData, // Will be null if PHE failed
      charities: charities, // Should now contain charities
      recommendations: recommendations
    });

  } catch (error) {
    // Catch any unexpected errors during the main process
    console.error("Main API Process Error:", error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}