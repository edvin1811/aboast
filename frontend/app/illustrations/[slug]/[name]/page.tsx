import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Illustration } from "@/components/illustrations/illustration";
import { getIllustration } from "@/lib/illustrations";

// Draws one blog illustration so scripts/illustrations.mjs can save it as a
// JPG. Only served when the server runs with ILLUSTRATIONS=1, so it never
// exists on the live site.

export const dynamic = "force-dynamic";
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function IllustrationPage({ params }: { params: Promise<{ slug: string; name: string }> }) {
  if (process.env.ILLUSTRATIONS !== "1") notFound();
  const { slug, name } = await params;
  const spec = getIllustration(slug, name);
  if (!spec) notFound();
  return (
    <>
      {/* The background wash stays out of the shot. */}
      <style>{".page-wash { display: none !important; }"}</style>
      <div className="flex justify-center p-10">
        <Illustration spec={spec} />
      </div>
    </>
  );
}
