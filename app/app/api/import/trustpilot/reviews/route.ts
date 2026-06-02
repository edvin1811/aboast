import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";

export async function GET(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const businessId = searchParams.get("businessId");

    if (!businessId) {
      return NextResponse.json(
        { error: "businessId parameter is required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.TRUSTPILOT_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          error: "Trustpilot API key not configured",
        },
        { status: 503 }
      );
    }

    // Fetch reviews from Trustpilot
    const reviewsUrl = `https://api.trustpilot.com/v1/business-units/${encodeURIComponent(
      businessId
    )}/reviews?apikey=${apiKey}&perPage=100`;

    const response = await fetch(reviewsUrl);
    const data = await response.json();

    if (!response.ok) {
      console.error("Trustpilot API error:", data);
      return NextResponse.json(
        { error: "Failed to fetch reviews" },
        { status: 500 }
      );
    }

    // Transform reviews
    const reviews =
      data.reviews?.map((review: any) => ({
        id: review.id,
        author: review.consumer?.displayName || "Anonymous",
        rating: review.stars,
        text: review.text || review.title,
        date: new Date(review.createdAt).toLocaleDateString(),
        authorPhoto: null,
      })) || [];

    return NextResponse.json({
      reviews,
      count: reviews.length,
    });
  } catch (error) {
    console.error("Error fetching Trustpilot reviews:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
