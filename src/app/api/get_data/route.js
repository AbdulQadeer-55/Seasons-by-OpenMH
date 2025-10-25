import { NextResponse } from 'next/server';
import axios from 'axios';

// --- API Helper Functions ---

// 1. Fetches data from postcodes.io (Unchanged)
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

// 2. --- THIS FUNCTION IS UPDATED ---
// Fetches data from CharityBase using search term including postcode
async function searchCharities(postcode) {
  const CHARITYBASE_API_KEY = process.env.CHARITY_API_KEY;
  console.log("Reading CHARITY_API_KEY:", CHARITYBASE_API_KEY);
  const CHARITYBASE_URL = "https://charitybase.uk/api/graphql";

  // --- THIS QUERY IS UPDATED ---
  // We use the 'search' filter including the postcode, and request geo at the top level.
  // We define $searchTerm as the variable.
  const query = `
    query SearchCharities($searchTerm: String) {
      CHC {
        getCharities(filters: { search: $searchTerm }) {
          list(limit: 10) {
            id
            names { value }
            activities
            contact {
              email
              phone
              postcode
            }
            website
            geo {
              latitude
              longitude
            }
          }
        }
      }
    }
  `;
  // --- END OF QUERY UPDATE ---

  // Combine "mental health" and the postcode for the search
  const searchTerm = `mental health ${postcode}`;

  try {
    const response = await axios.post(
      CHARITYBASE_URL,
      {
        query: query,
        variables: { searchTerm: searchTerm } // Pass the combined search term
      },
      {
        headers: {
          'Authorization': `Apikey ${CHARITYBASE_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

     if (response.data.errors) {
       console.error("CharityBase GraphQL Error:", response.data.errors);
       return [];
     }

    const charityList = response.data?.data?.CHC?.getCharities?.list;
    if (!charityList) {
        console.error("CharityBase response missing expected data path:", response.data);
        return [];
    }

    return charityList;

  } catch (error) {
    console.error("Error fetching charity data:", error.message);
     if (error.response) {
       console.error("CharityBase HTTP Error Status:", error.response.status);
       console.error("CharityBase HTTP Error Data:", error.response.data);
     }
    return [];
  }
}
// --- END OF FUNCTION UPDATE ---


// 3. Fetches REAL data from PHE Fingertips (Unchanged but handles errors)
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
      return null;
    }
    return [{ label: localData.AreaName, value: localData.Val }, { label: "England", value: nationalData.Val }];
  } catch (error) {
    console.error(`PHE Data Error for indicator ${indicatorId}: ${error.message}`);
    if (error.response) { console.error("PHE HTTP Error Status:", error.response.status); }
    return null;
  }
}

// 4. Generates recommendations based on REAL data (Unchanged)
function getSimpleAiRecommendations(healthData, areaName) {
  if (!healthData || healthData.length < 2 || healthData[0].value === 0) {
    return ["Could not generate insights for this data. Data may be unavailable for this area."];
  }
  const local = healthData[0];
  const national = healthData[1];
  const recommendations = [];
  const difference = local.value - national.value;
  let comparison = "similar to";
  if (difference > (national.value * 0.1)) { comparison = "higher than"; }
  else if (difference < -(national.value * 0.1)) { comparison = "lower than"; }
  recommendations.push(`The rate in ${areaName} (${local.value.toFixed(1)}) is ${comparison} the national average (${national.value.toFixed(1)}).`);
  if (comparison === "higher than") {
    recommendations.push("This suggests a higher local need. Focusing on community outreach and local support services (listed below) is recommended.");
  } else {
    recommendations.push("This is a positive sign. Continue supporting local services to maintain this trend.");
  }
  return recommendations;
}

// --- Main API Function (Unchanged structure) ---
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
        searchCharities(postcode), // Pass postcode for search term
        fetchIndicatorData(indicatorId, areaCode)
    ]);

    const recommendations = getSimpleAiRecommendations(healthData, areaName);

    return NextResponse.json({
      areaName: areaName,
      region: postcodeInfo.region,
      healthData: healthData,
      charities: charities,
      recommendations: recommendations
    });

  } catch (error) {
    console.error("Main API Process Error:", error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}