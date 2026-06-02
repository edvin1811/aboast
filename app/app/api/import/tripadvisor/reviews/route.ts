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

    const apiKey = process.env.TRIPADVISOR_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          error: "TripAdvisor API key not configured",
        },
        { status: 503 }
      );
    }

    // TripAdvisor Content API: Get reviews
    const reviewsUrl = `https://api.content.tripadvisor.com/api/v1/location/${encodeURIComponent(
      businessId
    )}/reviews?key=${apiKey}&language=en`;

    const response = await fetch(reviewsUrl, {
      headers: {
        Accept: "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("TripAdvisor API error:", data);
      return NextResponse.json(
        { error: "Failed to fetch reviews" },
        { status: 500 }
      );
    }

    // Transform reviews
    const reviews =
      data.data?.map((review: any) => ({
        id: review.id,
        author: review.user?.username || "Anonymous",
        rating: review.rating,
        text: review.text || review.title,
        date: new Date(review.published_date).toLocaleDateString(),
        authorPhoto: review.user?.avatar?.medium?.url || null,
      })) || [];

    return NextResponse.json({
      reviews,
      count: reviews.length,
    });
  } catch (error) {
    console.error("Error fetching TripAdvisor reviews:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
