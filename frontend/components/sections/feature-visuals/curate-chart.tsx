import { ArrowUp } from "lucide-react";

export function CurateChart({ tooltip = "+32%" }: { tooltip?: string }) {
  return (
    <div className="relative w-full h-full flex items-end">
      <div className="relative w-full h-[130px]">
        {/* Tooltip */}
        <div className="absolute top-0 right-[22%] -translate-y-full mb-2 bg-white border border-border rounded-md px-2 py-1 flex items-center gap-1 shadow-[0_4px_12px_-4px_rgba(15,15,15,0.12)] z-20">
          <ArrowUp className="w-3 h-3 text-primary" strokeWidth={2.5} />
          <span className="text-xs font-medium text-foreground">{tooltip}</span>
        </div>

        <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 200 100">
          <defs>
            <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ff595e" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#ff595e" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="chartGradient2" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#0a0a0a" stopOpacity="0.05" />
              <stop offset="100%" stopColor="#0a0a0a" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Background wave */}
          <path d="M 0 80 Q 25 70, 50 85 T 100 80 T 150 90 T 200 75 L 200 100 L 0 100 Z" fill="url(#chartGradient2)" />
          <path d="M 0 80 Q 25 70, 50 85 T 100 80 T 150 90 T 200 75" fill="none" stroke="rgba(10,10,10,0.18)" strokeWidth="1.5" />

          {/* Main wave */}
          <path d="M 0 60 Q 30 80, 70 50 T 130 65 T 150 20 Q 170 50, 200 40 L 200 100 L 0 100 Z" fill="url(#chartGradient)" />
          <path d="M 0 60 Q 30 80, 70 50 T 130 65 T 150 20 Q 170 50, 200 40" fill="none" stroke="#ff595e" strokeWidth="2" />

          <circle cx="150" cy="20" r="4" fill="#ff595e" />
          <circle cx="150" cy="20" r="8" fill="#ff595e" fillOpacity="0.2" />
        </svg>
      </div>
    </div>
  );
}
