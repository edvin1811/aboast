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

    const apiKey = process.env.TRUSTPILOT_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          error: "Trustpilot API key not configured",
          message:
            "Please add TRUSTPILOT_API_KEY to your environment variables",
        },
        { status: 503 }
      );
    }

    // Trustpilot API: Search for businesses
    const trustpilotUrl = `https://api.trustpilot.com/v1/business-units/search?query=${encodeURIComponent(
      query
    )}&apikey=${apiKey}`;

    const response = await fetch(trustpilotUrl);
    const data = await response.json();

    if (!response.ok) {
      console.error("Trustpilot API error:", data);
      return NextResponse.json(
        { error: "Failed to search businesses" },
        { status: 500 }
      );
    }

    // Transform results
    const businesses = data.businessUnits?.map((business: any) => ({
      id: business.id,
      name: business.displayName,
      address: business.contact?.country || "N/A",
      rating: business.score?.stars || 0,
      reviewCount: business.numberOfReviews?.total || 0,
      photoUrl: business.logo || null,
      platform: "trustpilot",
    }));

    return NextResponse.json({
      businesses: businesses || [],
      count: businesses?.length || 0,
    });
  } catch (error) {
    console.error("Error searching Trustpilot businesses:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
