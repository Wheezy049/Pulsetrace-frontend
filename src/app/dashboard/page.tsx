// "use client";

// import { useState, useEffect } from "react";
// import Link from "next/link";
// import { Plus, Activity, Server, Clock, AlertCircle, X, Loader2 } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";

// // Mock data
// const mockProjects = [
//   {
//     id: "proj-1",
//     name: "Production API",
//     description: "Main backend service for the e-commerce platform",
//     status: "healthy",
//     requests24h: "1.2M",
//     avgLatency: "124ms",
//     errorRate: "0.05%"
//   },
//   {
//     id: "proj-2",
//     name: "Auth Service",
//     description: "Authentication and authorization microservice",
//     status: "warning",
//     requests24h: "450K",
//     avgLatency: "350ms",
//     errorRate: "2.4%"
//   },
//   {
//     id: "proj-3",
//     name: "Payment Gateway",
//     description: "Stripe integration and webhook processing",
//     status: "healthy",
//     requests24h: "85K",
//     avgLatency: "210ms",
//     errorRate: "0.1%"
//   }
// ];

// export default function DashboardPage() {
//   const [isLoading, setIsLoading] = useState(true);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [isCreating, setIsCreating] = useState(false);
//   const [projects, setProjects] = useState<typeof mockProjects>([]);

//   useEffect(() => {
//     // Simulate initial load
//     const timer = setTimeout(() => {
//       setProjects(mockProjects);
//       setIsLoading(false);
//     }, 1200);
//     return () => clearTimeout(timer);
//   }, []);

//   const handleCreateProject = (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     setIsCreating(true);
    
//     setTimeout(() => {
//       const formData = new FormData(e.currentTarget);
//       const newProject = {
//         id: `proj-${Date.now()}`,
//         name: formData.get("name") as string,
//         description: formData.get("description") as string,
//         status: "healthy",
//         requests24h: "0",
//         avgLatency: "0ms",
//         errorRate: "0%"
//       };
      
//       setProjects([newProject, ...projects]);
//       setIsCreating(false);
//       setIsModalOpen(false);
//     }, 1000);
//   };

//   return (
//     <>
//       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
//         <div>
//           <h1 className="text-2xl font-bold text-white mb-1">Projects</h1>
//           <p className="text-muted-foreground text-sm">Manage and monitor your API projects</p>
//         </div>
//         <Button onClick={() => setIsModalOpen(true)} className="bg-primary hover:bg-primary/90">
//           <Plus className="w-4 h-4 mr-2" />
//           Create Project
//         </Button>
//       </div>

//       {isLoading ? (
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//           {[1, 2, 3].map((i) => (
//             <div key={i} className="glass p-6 rounded-xl border border-white/5 animate-pulse">
//               <div className="h-6 bg-white/10 rounded w-1/2 mb-4" />
//               <div className="h-4 bg-white/5 rounded w-3/4 mb-8" />
//               <div className="grid grid-cols-2 gap-4">
//                 <div className="h-10 bg-white/5 rounded" />
//                 <div className="h-10 bg-white/5 rounded" />
//               </div>
//             </div>
//           ))}
//         </div>
//       ) : (
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//           {projects.map((project) => (
//             <Link 
//               href={`/dashboard/${project.id}`} 
//               key={project.id}
//               className="glass p-6 rounded-xl hover:bg-white/5 hover:border-primary/30 transition-all group relative overflow-hidden"
//             >
//               <div className={`absolute top-0 left-0 w-1 h-full ${project.status === 'healthy' ? 'bg-green-500' : 'bg-yellow-500'}`} />
              
//               <div className="flex justify-between items-start mb-4">
//                 <h3 className="text-lg font-semibold text-white group-hover:text-primary transition-colors">
//                   {project.name}
//                 </h3>
//                 <div className={`px-2 py-1 rounded text-xs font-medium ${
//                   project.status === 'healthy' 
//                     ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
//                     : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
//                 }`}>
//                   {project.status === 'healthy' ? 'Healthy' : 'Warning'}
//                 </div>
//               </div>
              
//               <p className="text-sm text-muted-foreground mb-6 line-clamp-2">
//                 {project.description}
//               </p>
              
//               <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
//                 <div>
//                   <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
//                     <Activity className="w-3 h-3" /> Requests (24h)
//                   </div>
//                   <div className="font-medium text-white">{project.requests24h}</div>
//                 </div>
//                 <div>
//                   <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
//                     <Clock className="w-3 h-3" /> Avg Latency
//                   </div>
//                   <div className="font-medium text-white">{project.avgLatency}</div>
//                 </div>
//               </div>
//             </Link>
//           ))}
//         </div>
//       )}

//       {/* Create Project Modal */}
//       {isModalOpen && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
//           <div className="glass w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-white/10 animate-in fade-in zoom-in-95 duration-200">
//             <div className="flex items-center justify-between p-6 border-b border-white/5">
//               <h2 className="text-lg font-semibold text-white">Create New Project</h2>
//               <button 
//                 onClick={() => setIsModalOpen(false)}
//                 className="text-muted-foreground hover:text-white transition-colors"
//               >
//                 <X className="w-5 h-5" />
//               </button>
//             </div>
            
//             <form onSubmit={handleCreateProject} className="p-6 space-y-4">
//               <div className="space-y-2">
//                 <Label htmlFor="name">Project Name</Label>
//                 <Input 
//                   id="name" 
//                   name="name" 
//                   required 
//                   placeholder="e.g. Production API" 
//                   className="bg-background/50 border-white/10"
//                 />
//               </div>
              
//               <div className="space-y-2">
//                 <Label htmlFor="description">Description (Optional)</Label>
//                 <textarea 
//                   id="description" 
//                   name="description" 
//                   rows={3}
//                   placeholder="Briefly describe this project..."
//                   className="w-full rounded-md border border-white/10 bg-background/50 px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
//                 />
//               </div>

//               <div className="pt-4 flex justify-end gap-3">
//                 <Button 
//                   type="button" 
//                   variant="ghost" 
//                   onClick={() => setIsModalOpen(false)}
//                   className="hover:bg-white/5"
//                 >
//                   Cancel
//                 </Button>
//                 <Button type="submit" disabled={isCreating} className="bg-primary hover:bg-primary/90">
//                   {isCreating ? (
//                     <>
//                       <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating...
//                     </>
//                   ) : "Create Project"}
//                 </Button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </>
//   );
// }
