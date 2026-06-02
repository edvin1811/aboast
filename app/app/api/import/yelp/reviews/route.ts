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

    const apiKey = process.env.YELP_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          error: "Yelp API key not configured",
        },
        { status: 503 }
      );
    }

    // Yelp Fusion API: Get reviews
    const reviewsUrl = `https://api.yelp.com/v3/businesses/${encodeURIComponent(
      businessId
    )}/reviews`;

    const response = await fetch(reviewsUrl, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Yelp API error:", data);
      return NextResponse.json(
        { error: "Failed to fetch reviews" },
        { status: 500 }
      );
    }

    // Transform reviews
    const reviews =
      data.reviews?.map((review: any) => ({
        id: review.id,
        author: review.user?.name || "Anonymous",
        rating: review.rating,
        text: review.text,
        date: new Date(review.time_created).toLocaleDateString(),
        authorPhoto: review.user?.image_url || null,
      })) || [];

    return NextResponse.json({
      reviews,
      count: reviews.length,
    });
  } catch (error) {
    console.error("Error fetching Yelp reviews:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
