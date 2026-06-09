import { Activity } from "lucide-react";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center relative overflow-hidden">

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="w-full max-w-md px-6 relative z-10 flex flex-col items-center">
        <Link href="/" className="flex items-center gap-2 mb-6 group">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-105 transition-transform border border-primary/20">
            <Activity className="w-6 h-6 text-primary" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-white">PulseTrace</span>
        </Link>
        <div className="w-full glass p-8 rounded-2xl shadow-2xl shadow-black/50">
          {children}
        </div>
      </div>
    </div>
  );
}