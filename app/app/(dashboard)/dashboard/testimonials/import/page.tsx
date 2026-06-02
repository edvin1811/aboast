"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowLeft,
  Upload,
  FileText,
  Sparkles,
  Star,
  CheckCircle2,
  XCircle,
  Download,
  Zap,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";

interface ParsedTestimonial {
  id: string;
  content: string;
  rating: number;
  authorName: string;
  authorEmail?: string;
  authorTitle?: string;
  authorCompany?: string;
  authorImage?: string;
  source?: string;
  isValid: boolean;
  errors?: string[];
}

export default function ImportTestimonialsPage() {
  const router = useRouter();
  const [importing, setImporting] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [textInput, setTextInput] = useState("");
  const [parsedTestimonials, setParsedTestimonials] = useState<ParsedTestimonial[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCsvFile(file);
      parseCSVFile(file);
    }
  };

  const parseCSVFile = async (file: File) => {
    const text = await file.text();
    const lines = text.split("\n");
    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());

    const testimonials: ParsedTestimonial[] = [];

    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;

      const values = lines[i].split(",").map((v) => v.trim());
      const testimonial: any = {};

      headers.forEach((header, index) => {
        const value = values[index]?.replace(/^"|"$/g, "");

        if (header.includes("content") || header.includes("review") || header.includes("text") || header.includes("comment")) {
          testimonial.content = value;
        } else if (header.includes("rating") || header.includes("stars") || header.includes("score")) {
          testimonial.rating = parseInt(value) || 5;
        } else if (header.includes("name") || header.includes("author") || header.includes("customer")) {
          testimonial.authorName = value;
        } else if (header.includes("email")) {
          testimonial.authorEmail = value;
        } else if (header.includes("title") || header.includes("position")) {
          testimonial.authorTitle = value;
        } else if (header.includes("company") || header.includes("organization")) {
          testimonial.authorCompany = value;
        } else if (header.includes("source") || header.includes("platform")) {
          testimonial.source = value;
        }
      });

      const errors: string[] = [];
      if (!testimonial.content) errors.push("Missing content");
      if (!testimonial.authorName) errors.push("Missing author name");
      if (!testimonial.rating) testimonial.rating = 5;

      testimonials.push({
        id: `temp-${Date.now()}-${i}`,
        content: testimonial.content || "",
        rating: testimonial.rating,
        authorName: testimonial.authorName || "Anonymous",
        authorEmail: testimonial.authorEmail,
        authorTitle: testimonial.authorTitle,
        authorCompany: testimonial.authorCompany,
        source: testimonial.source,
        isValid: errors.length === 0,
        errors,
      });
    }

    setParsedTestimonials(testimonials);
    setShowPreview(true);
  };

  const parseTextInput = () => {
    const sections = textInput.split(/\n\s*\n/);
    const testimonials: ParsedTestimonial[] = [];

    sections.forEach((section, index) => {
      const lines = section.trim().split("\n");
      let content = "";
      let authorName = "Anonymous";
      let rating = 5;
      let authorTitle = "";
      let authorCompany = "";

      lines.forEach((line) => {
        const lowerLine = line.toLowerCase();

        if (lowerLine.includes("rating:") || lowerLine.includes("stars:")) {
          const match = line.match(/(\d+)/);
          if (match) rating = parseInt(match[1]);
        } else if (lowerLine.includes("name:") || lowerLine.includes("by:") || lowerLine.includes("from:")) {
          authorName = line.split(":")[1]?.trim() || authorName;
        } else if (lowerLine.includes("title:") || lowerLine.includes("position:")) {
          authorTitle = line.split(":")[1]?.trim() || "";
        } else if (lowerLine.includes("company:") || lowerLine.includes("organization:")) {
          authorCompany = line.split(":")[1]?.trim() || "";
        } else if (!line.includes(":")) {
          content += (content ? " " : "") + line.trim();
        }
      });

      const errors: string[] = [];
      if (!content) errors.push("Missing content");

      testimonials.push({
        id: `temp-${Date.now()}-${index}`,
        content,
        rating,
        authorName,
        authorTitle,
        authorCompany,
        source: "Manual Import",
        isValid: errors.length === 0,
        errors,
      });
    });

    setParsedTestimonials(testimonials);
    setShowPreview(true);
  };

  const updateTestimonial = (id: string, field: string, value: any) => {
    setParsedTestimonials((prev) =>
      prev.map((t) => (t.id === id ? { ...t, [field]: value } : t))
    );
  };

  const removeTestimonial = (id: string) => {
    setParsedTestimonials((prev) => prev.filter((t) => t.id !== id));
  };

  const handleImport = async () => {
    const validTestimonials = parsedTestimonials.filter((t) => t.isValid);

    if (validTestimonials.length === 0) {
      alert("No valid testimonials to import");
      return;
    }

    setImporting(true);
    try {
      const response = await fetch("/api/testimonials/bulk-import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ testimonials: validTestimonials }),
      });

      if (!response.ok) {
        throw new Error("Failed to import testimonials");
      }

      router.push("/dashboard/testimonials");
      router.refresh();
    } catch (error) {
      console.error("Error importing:", error);
      alert("Failed to import testimonials");
    } finally {
      setImporting(false);
    }
  };

  const downloadTemplate = () => {
    const template = "content,rating,authorName,authorEmail,authorTitle,authorCompany,source\n" +
      '"Great product!",5,"John Doe","john@example.com","CEO","Acme Inc","Google Reviews"\n' +
      '"Excellent service",4,"Jane Smith","","Marketing Manager","Tech Corp","TripAdvisor"';

    const blob = new Blob([template], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "testimonials-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8 animate-slide-in-top">
        <Link
          href="/dashboard/testimonials"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-4 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Testimonials
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Import Testimonials
          </h1>
          <p className="text-muted-foreground">
            Choose how you want to import
          </p>
        </div>
      </div>

      {!showPreview ? (
        !selectedMethod ? (
          <div className="space-y-3 animate-slide-in-bottom">
            {/* Manual Import Options */}
            <button
              onClick={() => setSelectedMethod("manual")}
              className="w-full p-4 bg-card border border-border rounded-lg hover:border-primary hover:shadow-md transition-all text-left group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary-soft flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Sparkles className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">Manual Entry</div>
                    <div className="text-sm text-muted-foreground">Write testimonials manually</div>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </button>

            <button
              onClick={() => setSelectedMethod("csv")}
              className="w-full p-4 bg-card border border-border rounded-lg hover:border-primary hover:shadow-md transition-all text-left group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Upload className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">CSV Upload</div>
                    <div className="text-sm text-muted-foreground">Import from spreadsheet file</div>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </button>

            <button
              onClick={() => setSelectedMethod("text")}
              className="w-full p-4 bg-card border border-border rounded-lg hover:border-primary hover:shadow-md transition-all text-left group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">Paste Text</div>
                    <div className="text-sm text-muted-foreground">Copy and paste reviews</div>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </button>

            {/* Divider */}
            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-dashed border-border"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-neutral-50 px-3 text-xs font-medium text-muted-foreground">
                  Auto-Import
                </span>
              </div>
            </div>

            {/* Auto-Import Option */}
            <Link href="/dashboard/testimonials/import-api">
              <button className="w-full p-4 bg-primary-soft border border-primary/20 rounded-lg hover:border-primary hover:shadow-md transition-all text-left group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary-soft border border-primary/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Zap className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">Import from web</div>
                      <div className="text-sm text-muted-foreground">Google, Yelp, Trustpilot, TripAdvisor</div>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </button>
            </Link>
          </div>
        ) : (
          <div className="space-y-6 animate-slide-in-bottom">
            <Button
              variant="ghost"
              onClick={() => setSelectedMethod(null)}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to options
            </Button>

            {selectedMethod === "manual" && (
              <Card>
                <CardHeader>
                  <CardTitle>Manual Entry</CardTitle>
                  <CardDescription>
                    Write a testimonial directly
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Content *</Label>
                    <Textarea
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      placeholder="Enter the testimonial content..."
                      rows={6}
                      className="text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Author Name *</Label>
                      <Input
                        placeholder="John Doe"
                        className="text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Rating</Label>
                      <Input
                        type="number"
                        min="1"
                        max="5"
                        defaultValue="5"
                        className="text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Title (Optional)</Label>
                      <Input
                        placeholder="CEO"
                        className="text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Company (Optional)</Label>
                      <Input
                        placeholder="Acme Inc"
                        className="text-sm"
                      />
                    </div>
                  </div>

                  <Button
                    onClick={() => {
                      // Create a simple testimonial object and add to preview
                      const newTestimonial: ParsedTestimonial = {
                        id: `temp-${Date.now()}`,
                        content: textInput,
                        rating: 5,
                        authorName: "Manual Entry",
                        source: "Manual Entry",
                        isValid: textInput.trim().length > 0,
                        errors: textInput.trim().length === 0 ? ["Missing content"] : [],
                      };
                      setParsedTestimonials([newTestimonial]);
                      setShowPreview(true);
                    }}
                    disabled={!textInput.trim()}
                    className="w-full"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Preview & Save
                  </Button>
                </CardContent>
              </Card>
            )}

            {selectedMethod === "csv" && (
              <Card>
                <CardHeader>
                  <CardTitle>Upload CSV File</CardTitle>
                  <CardDescription>
                    Import testimonials from a spreadsheet
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border-2 border-dashed border-border rounded-lg p-12 text-center hover:border-primary transition-colors">
                    <Label htmlFor="csv-upload" className="cursor-pointer">
                      <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <div className="text-lg font-semibold text-foreground mb-2">
                        Click to upload CSV
                      </div>
                      <div className="text-sm text-muted-foreground mb-4">
                        or drag and drop your file here
                      </div>
                      <Button type="button" variant="outline">
                        Choose File
                      </Button>
                    </Label>
                    <Input
                      id="csv-upload"
                      type="file"
                      accept=".csv"
                      onChange={handleCSVUpload}
                      className="hidden"
                    />
                    {csvFile && (
                      <div className="mt-4 text-sm text-primary">
                        ✓ {csvFile.name}
                      </div>
                    )}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={downloadTemplate}
                    className="w-full"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Template
                  </Button>
                </CardContent>
              </Card>
            )}

            {selectedMethod === "text" && (
              <Card>
                <CardHeader>
                  <CardTitle>Paste Review Text</CardTitle>
                  <CardDescription>
                    Copy and paste reviews from any platform
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder="Paste your reviews here...&#10;&#10;Example:&#10;This product is amazing!&#10;Rating: 5&#10;Name: John Doe"
                    rows={12}
                    className="text-sm"
                  />

                  <Button
                    onClick={parseTextInput}
                    disabled={!textInput.trim()}
                    className="w-full"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Parse & Preview
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )
      ) : (
        <div className="space-y-6 animate-slide-in-bottom">
          {/* Preview Header */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Review Imported Testimonials</CardTitle>
                  <CardDescription>
                    Found {parsedTestimonials.length} testimonials
                    {parsedTestimonials.filter((t) => !t.isValid).length > 0 && (
                      <span className="text-destructive">
                        {" "}· {parsedTestimonials.filter((t) => !t.isValid).length} with errors
                      </span>
                    )}
                  </CardDescription>
                </div>
                <Button variant="outline" onClick={() => setShowPreview(false)}>
                  Back
                </Button>
              </div>
            </CardHeader>
          </Card>

          {/* Testimonials List */}
          <div className="space-y-4">
            {parsedTestimonials.map((testimonial) => (
              <Card
                key={testimonial.id}
                className={testimonial.isValid ? "" : "border-destructive"}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      {testimonial.isValid ? (
                        <CheckCircle2 className="h-5 w-5 text-success" />
                      ) : (
                        <XCircle className="h-5 w-5 text-destructive" />
                      )}
                      <div className="flex gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < testimonial.rating
                                ? "text-primary fill-primary"
                                : "text-muted-foreground"
                            }`}
                          />
                        ))}
                      </div>
                      {testimonial.source && (
                        <Badge variant="outline">{testimonial.source}</Badge>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeTestimonial(testimonial.id)}
                    >
                      Remove
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2 space-y-2">
                      <Label>Content</Label>
                      <Textarea
                        value={testimonial.content}
                        onChange={(e) =>
                          updateTestimonial(testimonial.id, "content", e.target.value)
                        }
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Author Name</Label>
                      <Input
                        value={testimonial.authorName}
                        onChange={(e) =>
                          updateTestimonial(testimonial.id, "authorName", e.target.value)
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Rating</Label>
                      <Input
                        type="number"
                        min="1"
                        max="5"
                        value={testimonial.rating}
                        onChange={(e) =>
                          updateTestimonial(
                            testimonial.id,
                            "rating",
                            parseInt(e.target.value)
                          )
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Title (Optional)</Label>
                      <Input
                        value={testimonial.authorTitle || ""}
                        onChange={(e) =>
                          updateTestimonial(testimonial.id, "authorTitle", e.target.value)
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Company (Optional)</Label>
                      <Input
                        value={testimonial.authorCompany || ""}
                        onChange={(e) =>
                          updateTestimonial(testimonial.id, "authorCompany", e.target.value)
                        }
                      />
                    </div>
                  </div>

                  {!testimonial.isValid && testimonial.errors && (
                    <div className="mt-4 p-3 bg-destructive/10 rounded-lg">
                      <div className="text-sm text-destructive">
                        {testimonial.errors.join(", ")}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Import Actions */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-foreground mb-1">
                    Ready to import {parsedTestimonials.filter((t) => t.isValid).length}{" "}
                    testimonials
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Invalid testimonials will be skipped
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setShowPreview(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleImport}
                    disabled={importing || parsedTestimonials.filter((t) => t.isValid).length === 0}
                  >
                    {importing ? "Importing..." : "Import Testimonials"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
