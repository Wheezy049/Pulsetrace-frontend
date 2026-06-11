"use client";
import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Activity, LayoutDashboard, Settings, LogOut, Bell, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, currentUser } = useAuth();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
    }
  }, [router]);

  const handleSignOut = () => {
    logout();
    router.push("/login");
  };

  const getInitials = () => {
    if (!currentUser?.email) return "U";
    const parts = currentUser.email.split("@")[0].split(/[._-]/);
    if (parts.length > 1) {
      return (parts[0][0] + (parts[1]?.[0] || "")).toUpperCase();
    }
    return currentUser.email.substring(0, 2).toUpperCase();
  };

  const navigation = [
    { name: "Projects", href: "/dashboard", icon: LayoutDashboard },
  ];

  return (
    <div className="min-h-screen md:h-screen bg-background flex flex-col md:flex-row md:overflow-hidden">
      {/* Sidebar */}
      <aside className="w-full md:w-64 glass border-r border-white/10 flex-shrink-0 flex flex-col md:h-full overflow-y-auto">
        <div className="p-6 flex-1">
          <Link href="/dashboard" className="flex items-center gap-2 mb-8">
            <Activity className="w-6 h-6 text-primary" />
            <span className="text-xl font-bold tracking-tight text-white">RequestLens</span>
          </Link>
          <nav className="space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive
                      ? "bg-primary/20 text-primary font-medium"
                      : "text-muted-foreground hover:bg-white/5 hover:text-white"
                    }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-6 mt-auto">
          <button 
            onClick={handleSignOut}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-white/5 hover:text-white transition-colors w-full text-left"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 md:h-full overflow-hidden">
        <header className="h-16 glass border-b border-white/10 flex items-center justify-between px-6 shrink-0 z-10">
          <div className="flex-1 flex items-center gap-4">
            <div className="relative w-full max-w-md hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search projects, endpoints..."
                className="pl-9 bg-background/50 border-white/10 focus-visible:ring-primary h-9"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-muted-foreground hover:text-white transition-colors rounded-full hover:bg-white/5">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
            </button>
            <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-sm font-medium text-primary" title={currentUser?.email || ""}>
              {getInitials()}
            </div>
          </div>
        </header>
        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 relative">
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/5 blur-[100px] rounded-full pointer-events-none" />
          <div className="max-w-7xl mx-auto relative z-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}