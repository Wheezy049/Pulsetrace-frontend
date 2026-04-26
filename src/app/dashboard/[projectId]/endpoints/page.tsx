"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, MoreVertical, Server, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Mock Data
const initialEndpoints = [
  { id: "ep-1", name: "User Profile", method: "GET", path: "/api/v1/users/profile", status: "active", requests: "1.2M", avgLatency: "145ms" },
  { id: "ep-2", name: "Process Payment", method: "POST", path: "/api/v1/payments", status: "active", requests: "450K", avgLatency: "350ms" },
  { id: "ep-3", name: "Search Products", method: "GET", path: "/api/v1/products/search", status: "active", requests: "85K", avgLatency: "210ms" },
  { id: "ep-4", name: "User Login", method: "POST", path: "/api/v1/auth/login", status: "warning", requests: "320K", avgLatency: "520ms" },
];

export default function EndpointsPage({ params }: { params: { projectId: string } }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [endpoints, setEndpoints] = useState(initialEndpoints);

  const getMethodColor = (method: string) => {
    switch (method) {
      case "GET": return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "POST": return "bg-green-500/10 text-green-400 border-green-500/20";
      case "PUT": return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
      case "DELETE": return "bg-red-500/10 text-red-400 border-red-500/20";
      default: return "bg-white/10 text-white border-white/20";
    }
  };

  const handleRegisterEndpoint = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsCreating(true);
    
    setTimeout(() => {
      const formData = new FormData(e.currentTarget);
      const newEndpoint = {
        id: `ep-${Date.now()}`,
        name: formData.get("name") as string,
        method: formData.get("method") as string,
        path: formData.get("path") as string,
        status: "active",
        requests: "0",
        avgLatency: "0ms"
      };
      
      setEndpoints([newEndpoint, ...endpoints]);
      setIsCreating(false);
      setIsModalOpen(false);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild className="h-8 w-8 text-muted-foreground hover:text-white hover:bg-white/5">
            <Link href={`/dashboard/${params.projectId}`}>
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-white">Endpoints</h1>
            <p className="text-sm text-muted-foreground">Manage monitored routes for this project</p>
          </div>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" />
          Register Endpoint
        </Button>
      </div>

      {/* Endpoints Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {endpoints.map((ep) => (
          <div key={ep.id} className="glass p-5 rounded-xl border border-white/5 hover:border-white/10 transition-colors relative overflow-hidden group">
            <div className={`absolute top-0 left-0 w-1 h-full ${ep.status === 'warning' ? 'bg-yellow-500' : 'bg-primary'}`} />
            
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-semibold text-white group-hover:text-primary transition-colors">{ep.name}</h3>
              </div>
              <button className="text-muted-foreground hover:text-white transition-colors">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex items-center gap-2 mb-6">
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getMethodColor(ep.method)}`}>
                {ep.method}
              </span>
              <span className="text-sm font-mono text-muted-foreground truncate" title={ep.path}>
                {ep.path}
              </span>
            </div>
            
            <div className="flex items-center justify-between pt-4 border-t border-white/5">
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">Traffic (24h)</span>
                <span className="text-sm font-medium text-white">{ep.requests}</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-xs text-muted-foreground">Avg Latency</span>
                <span className={`text-sm font-medium ${parseInt(ep.avgLatency) > 500 ? 'text-yellow-400' : 'text-white'}`}>
                  {ep.avgLatency}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Register Endpoint Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-white/10 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <h2 className="text-lg font-semibold text-white">Register Endpoint</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-muted-foreground hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleRegisterEndpoint} className="p-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Endpoint Name</Label>
                <Input 
                  id="name" 
                  name="name" 
                  required 
                  placeholder="e.g. Create User" 
                  className="bg-background/50 border-white/10"
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2 col-span-1">
                  <Label htmlFor="method">Method</Label>
                  <select 
                    id="method" 
                    name="method" 
                    className="flex h-9 w-full rounded-md border border-white/10 bg-background/50 px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary text-white"
                  >
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                    <option value="PATCH">PATCH</option>
                    <option value="DELETE">DELETE</option>
                  </select>
                </div>
                
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="path">Relative Path</Label>
                  <Input 
                    id="path" 
                    name="path" 
                    required 
                    placeholder="e.g. /api/v1/users" 
                    className="bg-background/50 border-white/10 font-mono text-sm"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={() => setIsModalOpen(false)}
                  className="hover:bg-white/5"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isCreating} className="bg-primary hover:bg-primary/90">
                  {isCreating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Registering...
                    </>
                  ) : "Register Endpoint"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
