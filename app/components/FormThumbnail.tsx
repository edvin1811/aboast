import { Star } from "lucide-react";

interface FormField {
  id: string;
  name?: string;
  type: string;
  label?: string;
  enabled?: boolean;
}

/**
 * Tiny visual stand-in for a form, sized to fit a row card on the
 * forms list. Renders the form's name, a hint of the description, and
 * the first 3 enabled fields as muted bars / star row. Deliberately
 * monochrome — the row's accents come from elsewhere.
 */
export function FormThumbnail({
  name,
  description,
  fields,
}: {
  name: string;
  description?: string | null;
  fields?: FormField[];
}) {
  const enabled = (fields ?? []).filter((f) => f.enabled !== false).slice(0, 3);
  const sample =
    enabled.length > 0
      ? enabled
      : ([
          { id: "_t", type: "textarea" },
          { id: "_r", type: "rating" },
          { id: "_n", type: "text" },
        ] as FormField[]);

  return (
    <div className="w-full h-full bg-white rounded-md border border-border p-3 flex flex-col gap-2.5 select-none overflow-hidden">
      <div className="space-y-1">
        <div className="text-[10px] font-semibold text-foreground truncate leading-tight">
          {name || "Untitled form"}
        </div>
        <div className="h-1 w-3/4 rounded-sm bg-neutral-100" />
      </div>
      <div className="space-y-2">
        {sample.map((f) => (
          <div key={f.id} className="space-y-1">
            <div className="h-1 w-10 rounded-sm bg-neutral-200" />
            {f.type === "rating" ? (
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className="h-2 w-2 text-neutral-300 fill-neutral-300"
                    strokeWidth={1.5}
                  />
                ))}
              </div>
            ) : f.type === "textarea" ? (
              <div className="h-5 rounded-sm bg-neutral-50 border border-neutral-200" />
            ) : (
              <div className="h-2.5 rounded-sm bg-neutral-50 border border-neutral-200" />
            )}
          </div>
        ))}
      </div>
      <div className="mt-auto pt-1">
        <div className="h-2.5 w-full rounded-sm bg-neutral-900/85" />
      </div>
    </div>
  );
}
