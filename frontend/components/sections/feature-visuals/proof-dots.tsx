/** 10 dots in a 2×5 grid — 9 in primary-soft, 1 hollow neutral. Visualizes "92%". */
export function ProofDots() {
  return (
    <div className="w-full grid grid-cols-5 gap-2 max-w-[180px] mx-auto">
      {Array.from({ length: 10 }).map((_, i) => {
        const filled = i < 9;
        return (
          <div
            key={i}
            className={
              filled
                ? "aspect-square rounded-full bg-primary-soft border border-primary/30"
                : "aspect-square rounded-full border border-dashed border-border bg-neutral-50"
            }
          />
        );
      })}
    </div>
  );
}
