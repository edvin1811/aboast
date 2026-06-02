import { SignIn } from "@clerk/nextjs";
import Image from "next/image";

export default function SignInPage() {
  return (
    <div className="relative min-h-screen">
      <div className="page-wash" aria-hidden="true" />
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 py-16">
        <div className="flex items-center gap-2 mb-8">
          <Image src="/logo-color.svg" alt="aboast" width={28} height={28} />
          <span className="font-semibold tracking-tight text-lg text-foreground">aboast</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground text-center mb-2 leading-[1.1]">
          Welcome <span className="font-serif italic text-primary">back</span>.
        </h1>
        <p className="text-muted-foreground text-center mb-8">Sign in to keep shipping social proof.</p>
        <SignIn />
      </div>
    </div>
  );
}
