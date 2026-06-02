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

    const apiKey = process.env.TRIPADVISOR_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          error: "TripAdvisor API key not configured",
          message:
            "Please add TRIPADVISOR_API_KEY to your environment variables",
        },
        { status: 503 }
      );
    }

    // TripAdvisor Content API: Search locations
    const tripAdvisorUrl = `https://api.content.tripadvisor.com/api/v1/location/search?searchQuery=${encodeURIComponent(
      query
    )}&key=${apiKey}`;

    const response = await fetch(tripAdvisorUrl, {
      headers: {
        Accept: "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("TripAdvisor API error:", data);
      return NextResponse.json(
        { error: "Failed to search businesses" },
        { status: 500 }
      );
    }

    // Transform results
    const businesses = data.data?.map((location: any) => ({
      id: location.location_id,
      name: location.name,
      address: location.address_obj
        ? `${location.address_obj.street1 || ""} ${
            location.address_obj.city || ""
          }`.trim()
        : "N/A",
      rating: location.rating ? parseFloat(location.rating) : 0,
      reviewCount: location.num_reviews || 0,
      photoUrl: location.photo?.images?.medium?.url || null,
      platform: "tripadvisor",
    }));

    return NextResponse.json({
      businesses: businesses || [],
      count: businesses?.length || 0,
    });
  } catch (error) {
    console.error("Error searching TripAdvisor businesses:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
