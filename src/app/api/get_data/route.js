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

// 2. Fetches data from CharityBase OR returns mock data on failure
async function searchCharities(postcode) {
  const CHARITYBASE_API_KEY = process.env.CHARITY_API_KEY;
  console.log("Reading CHARITY_API_KEY:", CHARITYBASE_API_KEY); // Keep for debugging
  const CHARITYBASE_URL = "https://charitybase.uk/api/graphql";
  const query = `
    query SearchCharities($searchTerm: String) {
      CHC {
        getCharities(filters: { search: $searchTerm }) {
          list(limit: 5) { # Fetch 5 instead of 10 for demo
            id
            names { value }
            activities
            contact { email phone postcode }
            website
            geo { latitude longitude }
          }
        }
      }
    }
  `;
  const searchTerm = `mental health ${postcode}`;

  try {
    const response = await axios.post(
      CHARITYBASE_URL,
      { query: query, variables: { searchTerm: searchTerm } },
      { headers: {
          'Authorization': `Apikey ${CHARITYBASE_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 4000 // Add a timeout (4 seconds)
      }
    );

     if (response.data.errors) {
       console.error("CharityBase GraphQL Error:", response.data.errors);
       throw new Error("CharityBase GraphQL Error"); // Trigger catch block
     }

    const charityList = response.data?.data?.CHC?.getCharities?.list;
    if (!charityList) {
        console.error("CharityBase response missing expected data path:", response.data);
         throw new Error("CharityBase data format error"); // Trigger catch block
    }
    // Success: return real data and isMock: false
    return { charities: charityList, isMock: false };

  } catch (error) {
    console.warn("Using MOCK charity data due to error:", error.message);
    // --- MOCK DATA FALLBACK ---
    const mockCharities = [
      { id: "mock-1", names: [{ value: "Example Mental Health Hub (Mock)" }], activities: "Providing example support services for the local community.", contact: { email: "contact@example.org", phone: "01234 567890", postcode: postcode }, geo: { latitude: 51.50 + (Math.random()-0.5)*0.1, longitude: -0.12 + (Math.random()-0.5)*0.1 }, website: "#" },
      { id: "mock-2", names: [{ value: "Community Wellbeing Centre (Mock)" }], activities: "Offering example workshops, counseling, and group sessions.", contact: { email: "info@example.org", phone: "01987 654321", postcode: postcode }, geo: { latitude: 51.50 + (Math.random()-0.5)*0.1, longitude: -0.12 + (Math.random()-0.5)*0.1 }, website: "#" },
      { id: "mock-3", names: [{ value: "Youth Mind Matters (Mock)" }], activities: "Example services focused on young people's mental health.", contact: { email: null, phone: "01112 223344", postcode: postcode }, geo: { latitude: 51.50 + (Math.random()-0.5)*0.1, longitude: -0.12 + (Math.random()-0.5)*0.1 }, website: null },
    ];
    // Return mock data and isMock: true
    return { charities: mockCharities, isMock: true };
    // --- END MOCK DATA ---
  }
}

// 3. Fetches REAL data from PHE Fingertips OR returns mock data on failure
async function fetchIndicatorData(indicatorId, areaCode, areaName = "Local Area") {
  const areaTypeId = 152;
  const url = `https://fingertips.phe.org.uk/api/latest_data/single_indicator_for_all_areas?indicator_id=${indicatorId}&child_area_type_id=${areaTypeId}&parent_area_code=E92000001`;

  try {
    const response = await axios.get(url, { timeout: 4000 }); // Add timeout
    const allData = response.data;
    const localData = allData.find(d => d.AreaCode === areaCode);
    const nationalData = allData.find(d => d.AreaCode === "E92000001");

    if (!localData || !nationalData) {
      console.warn(`PHE Data Warning: Could not find local (${areaCode}) or national data for indicator ${indicatorId}.`);
       throw new Error("PHE data incomplete"); // Trigger catch block
    }
    // Success: return real data and isMock: false
    return {
        healthData: [{ label: localData.AreaName, value: localData.Val }, { label: "England", value: nationalData.Val }],
        isMock: false
    };

  } catch (error) {
    console.warn(`Using MOCK health data for indicator ${indicatorId} due to error: ${error.message}`);
    // --- MOCK DATA FALLBACK ---
    const mockValueLocal = Math.round((4 + Math.random() * 4) * 10) / 10; // Random value between 4.0 and 8.0
    const mockValueNational = Math.round((4 + Math.random() * 4) * 10) / 10;
    // Return mock data and isMock: true
    return {
        healthData: [{ label: `${areaName} (Mock)`, value: mockValueLocal }, { label: "England (Mock)", value: mockValueNational }],
        isMock: true
    };
    // --- END MOCK DATA ---
  }
}

// 4. Generates recommendations based on potentially mocked data
function getSimpleAiRecommendations(healthDataResult, areaName) {
  // Use healthData from the result object
  const healthData = healthDataResult?.healthData;
  const isMock = healthDataResult?.isMock; // Get the mock flag

  if (!healthData || healthData.length < 2) {
      return { recommendations: ["Could not generate insights for this data. Data may be unavailable for this area."], isMock: isMock };
  }

  const local = healthData[0];
  const national = healthData[1];
  const recommendations = [];
  const difference = local.value - national.value;
  let comparison = "similar to";

  if (difference > (national.value * 0.1)) { comparison = "higher than"; }
  else if (difference < -(national.value * 0.1)) { comparison = "lower than"; }

  recommendations.push(
    `The rate in ${local.label} (${local.value.toFixed(1)}) is ${comparison} the national average (${national.value.toFixed(1)}).`
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
  // Return recommendations and pass the mock flag along
  return { recommendations: recommendations, isMock: isMock };
}

// --- Main API Function (Updated to handle mock flags) ---
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

    // Fetch data, functions now return { data, isMock } objects
    const [charityResult, healthDataResult] = await Promise.all([
        searchCharities(postcode),
        fetchIndicatorData(indicatorId, areaCode, areaName) // Pass areaName for mock label
    ]);

    // Generate recommendations using the healthDataResult object
    const recommendationResult = getSimpleAiRecommendations(healthDataResult, areaName);

    // Return combined data, including the mock flags
    return NextResponse.json({
      areaName: areaName,
      region: postcodeInfo.region,
      healthData: healthDataResult.healthData,
      isHealthDataMock: healthDataResult.isMock, // Send flag to frontend
      charities: charityResult.charities,
      isCharityDataMock: charityResult.isMock, // Send flag to frontend
      recommendations: recommendationResult.recommendations,
      // Pass the health data mock status for insights as well
      isInsightDataMock: recommendationResult.isMock
    });

  } catch (error) {
    console.error("Main API Process Error:", error);
    // Attempt to return a response even if postcode lookup failed, showing mock data
    const mockHealth = { healthData: [{ label: `Area (Mock)`, value: 5.0 }, { label: "England (Mock)", value: 4.5 }], isMock: true };
    const mockCharities = { charities: [], isMock: true }; // Empty list if postcode fails early
    const mockRecs = { recommendations: ["Could not process request due to an internal error."], isMock: true };
    return NextResponse.json({
        areaName: "Unknown Area",
        region: "Unknown Region",
        healthData: mockHealth.healthData,
        isHealthDataMock: mockHealth.isMock,
        charities: mockCharities.charities,
        isCharityDataMock: mockCharities.isMock,
        recommendations: mockRecs.recommendations,
        isInsightDataMock: mockRecs.isMock
    }, { status: 500 }); // Indicate server error but still provide mock structure
  }
}