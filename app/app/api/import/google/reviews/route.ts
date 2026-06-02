import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get("businessId");

    if (!businessId) {
      return NextResponse.json(
        { error: "Business ID is required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GOOGLE_PLACES_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Google Places API key not configured" },
        { status: 500 }
      );
    }

    // Use Google Places API (New) - Get Place Details with reviews
    const response = await fetch(
      `https://places.googleapis.com/v1/places/${businessId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask": "id,displayName,reviews",
        },
      }
    );

    
    if (!response.ok) {
      const error = await response.text();
      console.error("Google Places API error:", error);
      return NextResponse.json(
        { error: "Failed to fetch reviews" },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Transform reviews to our format
    const reviews = (data.reviews || []).map((review: any, index: number) => ({
      id: `google-${businessId}-${index}`,
      author: review.authorAttribution?.displayName || "Anonymous",
      rating: review.rating || 5,
      text: review.text?.text || review.originalText?.text || "",
      date: review.relativePublishTimeDescription || review.publishTime || "Recently",
      authorPhoto: review.authorAttribution?.photoUri || undefined,
    }));

    return NextResponse.json({ reviews });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
