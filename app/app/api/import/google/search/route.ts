 import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query");

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    const apiKey = process.env.GOOGLE_PLACES_API_KEY;

    console.log("API Key from env:", apiKey);
    console.log("API Key length:", apiKey?.length);
    console.log("API Key trimmed:", apiKey?.trim());

    if (!apiKey) {
      return NextResponse.json(
        { error: "Google Places API key not configured" },
        { status: 500 }
      );
    }

    // Use Google Places API (New) - Text Search
    const response = await fetch(
      `https://places.googleapis.com/v1/places:searchText`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.photos",
        },
        body: JSON.stringify({
          textQuery: query,
          languageCode: "en",
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error("Google Places API error:", error);
      return NextResponse.json(
        { error: "Failed to search businesses" },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Transform Google Places API response to our format
    const businesses = (data.places || []).map((place: any) => ({
      id: place.id,
      name: place.displayName?.text || "Unknown Business",
      address: place.formattedAddress || "",
      rating: place.rating || 0,
      reviewCount: place.userRatingCount || 0,
      photoUrl: place.photos?.[0]
        ? `https://places.googleapis.com/v1/${place.photos[0].name}/media?key=${apiKey}&maxHeightPx=400&maxWidthPx=400`
        : undefined,
      platform: "google",
    }));

    return NextResponse.json({ businesses });
  } catch (error) {
    console.error("Error searching businesses:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
