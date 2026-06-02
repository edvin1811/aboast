import { MessageCircle, Mail, Globe, Star, Heart } from "lucide-react";
import Image from "next/image";
export function CollectNetwork() {
  return (
    <div className="relative h-full w-full flex items-center justify-between">
      {/* Left source nodes */}
      <div className="flex flex-col gap-3 relative z-10">
        {[MessageCircle, Globe, Star, Mail].map((Icon, i) => (
          <div
            key={i}
            className="w-9 h-9 rounded-lg bg-neutral-50 border border-border flex items-center justify-center text-muted-foreground"
          >
            <Icon className="w-4 h-4" strokeWidth={1.75} />
          </div>
        ))}
      </div>

      {/* Connector curves */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
          <path d="M 14 10 C 50 10, 50 50, 78 50" stroke="rgba(10,10,10,0.12)" strokeWidth="1" strokeDasharray="3 3" fill="none" />
          <path d="M 14 36 C 50 36, 50 50, 78 50" stroke="rgba(10,10,10,0.12)" strokeWidth="1" strokeDasharray="3 3" fill="none" />
          <path d="M 14 64 C 50 64, 50 50, 78 50" stroke="rgba(10,10,10,0.12)" strokeWidth="1" strokeDasharray="3 3" fill="none" />
          <path d="M 14 90 C 50 90, 50 50, 78 50" stroke="rgba(10,10,10,0.12)" strokeWidth="1" strokeDasharray="3 3" fill="none" />
        </svg>
      </div>

      {/* Central inbox node */}
      <div className="relative z-10 mr-2">
        <div className="w-16 h-16 rounded-2xl bg-primary-soft border border-primary/30 flex items-center justify-center text-primary shadow-[0_0_24px_rgba(255,89,94,0.18)]">
          <Image src="/logo-color.svg" alt="aboast" width={30} height={30} />
          <div className="absolute -top-1 -left-1 w-2 h-2 rounded-full bg-primary" />
          <div className="absolute -bottom-1 -right-1 w-2 h-2 rounded-full bg-primary" />
        </div>
      </div>
    </div>
  );
}
