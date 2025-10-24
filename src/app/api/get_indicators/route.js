import { NextResponse } from 'next/server';
import axios from 'axios';

// This function will run when our frontend requests /api/get_indicators
export async function GET(request) {

  // This is the endpoint to get ALL indicator names
  const pheApiUrl = `https://fingertips.phe.org.uk/api/indicator_names`;
  
  console.log("Fetching ALL indicators from:", pheApiUrl); // Log the URL

  try {
    const response = await axios.get(pheApiUrl);
    
    // Check if the response contains data
    if (response.data && Array.isArray(response.data) && response.data.length > 0) {
      
      // --- THIS IS THE NEW FILTERING LOGIC ---
      const allIndicators = response.data;
      const mentalHealthKeywords = [
          'mental', 'anxiety', 'depression', 'wellbeing', 'well-being',
          'suicide', 'self-harm', 'psychological', 'psychiatric', 'stress'
      ];
      
      // Filter the full list
      const filteredIndicators = allIndicators.filter(indicator => 
        mentalHealthKeywords.some(keyword => 
            indicator.Name.toLowerCase().includes(keyword)
        )
      );
      // --- END OF FILTERING LOGIC ---

      if (filteredIndicators.length > 0) {
         console.log(`Successfully fetched ${allIndicators.length} indicators, filtered down to ${filteredIndicators.length} mental health indicators.`);
         return NextResponse.json(filteredIndicators);
      } else {
         console.warn("Fetched indicators, but none matched mental health keywords.");
         return NextResponse.json([]); // Return empty if no matches
      }

    } else {
      console.error("PHE API returned empty or invalid data:", response.data);
      return NextResponse.json([], { status: 500 });
    }

  } catch (error) {
    console.error("Failed to fetch indicators from PHE API:", error.message);
    if (error.response) {
      console.error("Error Status:", error.response.status);
      console.error("Error Data:", error.response.data);
    }
    return NextResponse.json([], { status: 500 });
  }
}