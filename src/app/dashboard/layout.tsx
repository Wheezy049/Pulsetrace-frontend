// "use client";
// import Link from "next/link";
// import { usePathname } from "next/navigation";
// import { Activity, LayoutDashboard, Settings, LogOut, Bell, Search } from "lucide-react";
// import { Input } from "@/components/ui/input";

// export default function DashboardLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   const pathname = usePathname();

//   const navigation = [
//     { name: "Projects", href: "/dashboard", icon: LayoutDashboard },
//     { name: "Settings", href: "/dashboard/settings", icon: Settings },
//   ];

//   return (
//     <div className="min-h-screen bg-background flex flex-col md:flex-row">
//       {/* Sidebar */}
//       <aside className="w-full md:w-64 glass border-r border-white/10 flex-shrink-0 flex flex-col">
//         <div className="p-6">
//           <Link href="/dashboard" className="flex items-center gap-2 mb-8">
//             <Activity className="w-6 h-6 text-primary" />
//             <span className="text-xl font-bold tracking-tight text-white">PulseTrace</span>
//           </Link>

//           <nav className="space-y-2">
//             {navigation.map((item) => {
//               const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
//               const Icon = item.icon;

//               return (
//                 <Link
//                   key={item.name}
//                   href={item.href}
//                   className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive
//                       ? "bg-primary/20 text-primary font-medium"
//                       : "text-muted-foreground hover:bg-white/5 hover:text-white"
//                     }`}
//                 >
//                   <Icon className="w-5 h-5" />
//                   {item.name}
//                 </Link>
//               );
//             })}
//           </nav>
//         </div>

//         <div className="mt-auto p-6">
//           <button className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-white/5 hover:text-white transition-colors w-full">
//             <LogOut className="w-5 h-5" />
//             Sign Out
//           </button>
//         </div>
//       </aside>

//       {/* Main Content */}
//       <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
//         {/* Top Header */}
//         <header className="h-16 glass border-b border-white/10 flex items-center justify-between px-6 shrink-0 z-10 sticky top-0">
//           <div className="flex-1 flex items-center gap-4">
//             <div className="relative w-full max-w-md hidden md:block">
//               <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
//               <Input
//                 placeholder="Search projects, endpoints..."
//                 className="pl-9 bg-background/50 border-white/10 focus-visible:ring-primary h-9"
//               />
//             </div>
//           </div>

//           <div className="flex items-center gap-4">
//             <button className="relative p-2 text-muted-foreground hover:text-white transition-colors rounded-full hover:bg-white/5">
//               <Bell className="w-5 h-5" />
//               <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
//             </button>
//             <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-sm font-medium text-primary">
//               JD
//             </div>
//           </div>
//         </header>

//         {/* Page Content */}
//         <main className="flex-1 overflow-auto p-6 relative">
//           <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/5 blur-[100px] rounded-full pointer-events-none" />
//           <div className="max-w-7xl mx-auto relative z-10">
//             {children}
//           </div>
//         </main>
//       </div>
//     </div>
//   );
// }
