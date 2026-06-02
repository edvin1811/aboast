import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";

export async function GET(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("query");

    if (!query) {
      return NextResponse.json(
        { error: "Query parameter is required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.YELP_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          error: "Yelp API key not configured",
          message: "Please add YELP_API_KEY to your environment variables",
        },
        { status: 503 }
      );
    }

    // Yelp Fusion API: Search businesses
    const yelpUrl = `https://api.yelp.com/v3/businesses/search?term=${encodeURIComponent(
      query
    )}&limit=20`;

    const response = await fetch(yelpUrl, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Yelp API error:", data);
      return NextResponse.json(
        { error: "Failed to search businesses" },
        { status: 500 }
      );
    }

    // Transform results
    const businesses = data.businesses?.map((business: any) => ({
      id: business.id,
      name: business.name,
      address: business.location?.display_address?.join(", ") || "N/A",
      rating: business.rating || 0,
      reviewCount: business.review_count || 0,
      photoUrl: business.image_url || null,
      platform: "yelp",
    }));

    return NextResponse.json({
      businesses: businesses || [],
      count: businesses?.length || 0,
    });
  } catch (error) {
    console.error("Error searching Yelp businesses:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
