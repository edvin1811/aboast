"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Search,
  Star,
  MapPin,
  Loader2,
  Download,
  Filter,
} from "lucide-react";
import Link from "next/link";

interface Business {
  id: string;
  name: string;
  address: string;
  rating: number;
  reviewCount: number;
  photoUrl?: string;
  platform: string;
}

interface Review {
  id: string;
  author: string;
  rating: number;
  text: string;
  date: string;
  authorPhoto?: string;
  selected?: boolean;
}

export default function ImportFromAPIPage() {
  const router = useRouter();
  const selectedPlatform = "google";
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [importing, setImporting] = useState(false);
  const [minRating, setMinRating] = useState<number>(0);

  const handleSearchBusinesses = async () => {
    if (!searchQuery.trim()) return;

    setSearching(true);
    setSelectedBusiness(null);
    setReviews([]);

    try {
      const response = await fetch(
        `/api/import/${selectedPlatform}/search?query=${encodeURIComponent(searchQuery)}`
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(errorData.error || `Search failed with status ${response.status}`);
      }

      const data = await response.json();
      setBusinesses(data.businesses || []);
    } catch (error) {
      console.error("Search error:", error);
      alert(`Failed to search businesses: ${error instanceof Error ? error.message : "Please try again."}`);
    } finally {
      setSearching(false);
    }
  };

  const handleSelectBusiness = async (business: Business) => {
    setSelectedBusiness(business);
    setLoadingReviews(true);

    try {
      const response = await fetch(
        `/api/import/${selectedPlatform}/reviews?businessId=${encodeURIComponent(business.id)}`
      );

      if (!response.ok) throw new Error("Failed to fetch reviews");

      const data = await response.json();
      setReviews(
        data.reviews.map((r: Review) => ({ ...r, selected: true }))
      );
    } catch (error) {
      console.error("Error fetching reviews:", error);
      alert("Failed to fetch reviews. Please try again.");
    } finally {
      setLoadingReviews(false);
    }
  };

  const toggleReviewSelection = (reviewId: string) => {
    setReviews((prev) =>
      prev.map((r) =>
        r.id === reviewId ? { ...r, selected: !r.selected } : r
      )
    );
  };

  const toggleAllReviews = (selected: boolean) => {
    setReviews((prev) => prev.map((r) => ({ ...r, selected })));
  };

  const handleImport = async () => {
    const selectedReviews = reviews.filter((r) => r.selected);

    if (selectedReviews.length === 0) {
      alert("Please select at least one review to import");
      return;
    }

    setImporting(true);
    try {
      const testimonials = selectedReviews.map((review) => ({
        content: review.text,
        rating: review.rating,
        authorName: review.author,
        authorImage: review.authorPhoto,
        source: selectedPlatform,
        isValid: true,
      }));

      const response = await fetch("/api/testimonials/bulk-import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ testimonials }),
      });

      if (!response.ok) throw new Error("Import failed");

      router.push("/dashboard/testimonials");
      router.refresh();
    } catch (error) {
      console.error("Import error:", error);
      alert("Failed to import reviews. Please try again.");
    } finally {
      setImporting(false);
    }
  };

  const filteredReviews = reviews.filter((r) =>
    minRating > 0 ? r.rating >= minRating : true
  );

  const selectedCount = filteredReviews.filter((r) => r.selected).length;

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 animate-slide-in-top">
        <Link
          href="/dashboard/testimonials/import"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-4 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Import Reviews
          </h1>
          <p className="text-muted-foreground">
            Search for your business and import reviews from Google
          </p>
        </div>
      </div>

      {/* Search Section */}
      <Card className="mb-6 shadow-sm border-border">
        <CardContent className="p-6">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search for your business (e.g., 'Starbucks New York')"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearchBusinesses()}
                className="pl-10 h-12 text-base"
              />
            </div>
            <Button
              onClick={handleSearchBusinesses}
              disabled={searching || !searchQuery.trim()}
              className="h-12 px-8 shadow-lg shadow-primary/20"
            >
              {searching ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="h-5 w-5 mr-2" />
                  Search
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Business Results */}
      {businesses.length > 0 && !selectedBusiness && (
        <div className="mb-6 animate-slide-in-bottom">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Found {businesses.length} businesses
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {businesses.map((business) => (
              <Card
                key={business.id}
                className="cursor-pointer hover:border-primary hover:shadow-lg transition-all"
                onClick={() => handleSelectBusiness(business)}
              >
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    {business.photoUrl && (
                      <img
                        src={business.photoUrl}
                        alt={business.name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground mb-1 truncate">
                        {business.name}
                      </h3>
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-2">
                        <MapPin className="h-3.5 w-3.5" />
                        <span className="truncate">{business.address}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-primary fill-primary" />
                          <span className="font-medium text-sm">{business.rating.toFixed(1)}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {business.reviewCount.toLocaleString()} reviews
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Selected Business & Reviews */}
      {selectedBusiness && (
        <div className="space-y-6 animate-slide-in-bottom">
          {/* Business Info Header */}
          <Card className="shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {selectedBusiness.photoUrl && (
                    <img
                      src={selectedBusiness.photoUrl}
                      alt={selectedBusiness.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                  )}
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-1">
                      {selectedBusiness.name}
                    </h3>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-primary fill-primary" />
                        <span className="font-medium">{selectedBusiness.rating.toFixed(1)}</span>
                      </div>
                      <span className="text-muted-foreground">
                        {selectedBusiness.reviewCount.toLocaleString()} reviews
                      </span>
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedBusiness(null);
                    setReviews([]);
                  }}
                >
                  Change Business
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Reviews Section */}
          {loadingReviews ? (
            <Card className="shadow-sm">
              <CardContent className="p-12 text-center">
                <Loader2 className="h-12 w-12 text-primary mx-auto mb-4 animate-spin" />
                <p className="text-muted-foreground">Loading reviews...</p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Filter & Select Bar */}
              <Card className="shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="select-all"
                          checked={filteredReviews.length > 0 && filteredReviews.every((r) => r.selected)}
                          onCheckedChange={(checked) => toggleAllReviews(checked as boolean)}
                        />
                        <label htmlFor="select-all" className="text-sm font-medium cursor-pointer">
                          Select All ({selectedCount} selected)
                        </label>
                      </div>
                      <div className="h-5 w-px bg-border" />
                      <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-muted-foreground" />
                        <Select value={minRating.toString()} onValueChange={(v) => setMinRating(parseInt(v))}>
                          <SelectTrigger className="w-32 h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0">All Ratings</SelectItem>
                            <SelectItem value="3">3+ Stars</SelectItem>
                            <SelectItem value="4">4+ Stars</SelectItem>
                            <SelectItem value="5">5 Stars</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button
                      onClick={handleImport}
                      disabled={importing || selectedCount === 0}
                      className="shadow-lg shadow-primary/20"
                    >
                      {importing ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Importing...
                        </>
                      ) : (
                        <>
                          <Download className="h-4 w-4 mr-2" />
                          Import {selectedCount} Reviews
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Reviews Grid */}
              <div className="space-y-4">
                {filteredReviews.map((review) => (
                  <Card
                    key={review.id}
                    className={`cursor-pointer transition-all ${
                      review.selected
                        ? "border-primary bg-primary/5"
                        : "hover:border-border-muted"
                    }`}
                    onClick={() => toggleReviewSelection(review.id)}
                  >
                    <CardContent className="p-5">
                      <div className="flex items-start gap-3 mb-3">
                        <Checkbox
                          checked={review.selected}
                          onCheckedChange={() => toggleReviewSelection(review.id)}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-foreground truncate">
                                {review.author}
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <div className="flex gap-0.5">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`h-3.5 w-3.5 ${
                                        i < review.rating
                                          ? "text-primary fill-primary"
                                          : "text-muted-foreground/30"
                                      }`}
                                    />
                                  ))}
                                </div>
                                <span className="text-xs text-muted-foreground">{review.date}</span>
                              </div>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                            {review.text}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
