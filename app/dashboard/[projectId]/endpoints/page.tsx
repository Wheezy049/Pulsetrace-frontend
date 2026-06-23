"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useEndpoints } from "@/hooks/useEndpoints";
import { ArrowLeft, Plus, Trash2, X, Loader2, Server, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ConfirmModal } from "@/components/ui/confirm-modal";

export default function EndpointsPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = React.use(params);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [routeToDelete, setRouteToDelete] = useState<{ id: string; method: string; path: string } | null>(null);

  const {
    endpoints,
    isLoadingEndpoints: isLoading,
    createEndpointAsync,
    isCreatingEndpoint,
    createEndpointError,
    deleteEndpoint,
  } = useEndpoints(projectId);

  const getMethodColor = (method: string) => {
    switch (method) {
      case "GET": return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "POST": return "bg-green-500/10 text-green-400 border-green-500/20";
      case "PUT": return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
      case "DELETE": return "bg-red-500/10 text-red-400 border-red-500/20";
      default: return "bg-zinc-800 text-zinc-300 border-zinc-700";
    }
  };

  const handleRegisterEndpoint = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const method = formData.get("method") as string;
    const path = formData.get("path") as string;
    if (name && method && path) {
      try {
        await createEndpointAsync({ name, method, path });
        setIsModalOpen(false);
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-zinc-800/50">
            <Link href={`/dashboard/${projectId}`}>
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-white">Endpoints</h1>
            <p className="text-sm text-zinc-400">Manage monitored routes for this project</p>
          </div>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="bg-primary hover:bg-primary/90 text-white font-medium border-0 px-4 py-2">
          <Plus className="w-4 h-4 mr-2" />
          Register Endpoint
        </Button>
      </div>
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-zinc-900/40 p-5 rounded-xl border border-zinc-800/50 animate-pulse h-32" />
          ))}
        </div>
      ) : endpoints.length === 0 ? (
        <div className="text-center bg-zinc-900/20 border border-zinc-800/60 rounded-xl h-[540px] flex flex-col items-center justify-center py-16">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-primary/20">
            <Server className="w-6 h-6 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">No registered routes</h3>
          <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
            Register endpoints that you want to monitor (e.g. login, checkout, search) and record request metrics against.
          </p>
          <Button onClick={() => setIsModalOpen(true)} className="bg-primary hover:bg-primary/90 text-white">
            <Plus className="w-4 h-4 mr-2" /> Register endpoint
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {endpoints.map((ep) => (
            <div key={ep.id} className="bg-zinc-900/30 p-5 rounded-xl border border-zinc-800/60 hover:border-zinc-700/80 transition-colors relative overflow-hidden group flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-semibold text-white group-hover:text-primary transition-colors">{ep.name}</h3>
                  <button
                    onClick={() => {
                      setRouteToDelete({ id: ep.id, method: ep.method, path: ep.path });
                    }}
                    className="text-zinc-500 hover:text-red-400 transition-colors p-1 rounded hover:bg-zinc-800/40 cursor-pointer"
                    title="Unregister Endpoint"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex items-center gap-2 mb-4">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getMethodColor(ep.method)}`}>
                    {ep.method}
                  </span>
                  <span className="text-xs font-mono text-zinc-400 truncate max-w-[80%]" title={ep.path}>
                    {ep.path}
                  </span>
                </div>
              </div>
              <div className="pt-3 border-t border-zinc-800/50 flex items-center justify-between text-[11px] text-zinc-500">
                <span>Registered {new Date(ep.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
      {/* Register Endpoint Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-zinc-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-zinc-800 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-zinc-800/50">
              <h2 className="text-lg font-semibold text-white">Register Endpoint</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleRegisterEndpoint} className="p-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-zinc-300">Endpoint Name</Label>
                <Input 
                  id="name" 
                  name="name" 
                  required 
                  placeholder="e.g. Create User" 
                  className="bg-zinc-950/50 border-zinc-800 focus-visible:ring-primary text-white"
                />
              </div>  
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2 col-span-1">
                  <Label htmlFor="method" className="text-zinc-300">Method</Label>
                  <select 
                    id="method" 
                    name="method" 
                    className="flex h-9 w-full rounded-md border border-zinc-800 bg-zinc-950/50 px-3 py-1 text-xs text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                  >
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                    <option value="PATCH">PATCH</option>
                    <option value="DELETE">DELETE</option>
                  </select>
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="path" className="text-zinc-300">Relative Path</Label>
                  <Input 
                    id="path" 
                    name="path" 
                    required 
                    placeholder="e.g. /api/v1/users" 
                    className="bg-zinc-950/50 border-zinc-800 focus-visible:ring-primary font-mono text-xs text-white"
                  />
                </div>
              </div>
              {createEndpointError && (
                <div className="p-3 text-xs bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{createEndpointError instanceof Error ? createEndpointError.message : "Failed to register endpoint"}</span>
                </div>
              )}
              <div className="pt-4 flex justify-end gap-3">
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={() => setIsModalOpen(false)}
                  className="hover:bg-zinc-800 hover:text-white border-zinc-800 text-zinc-400"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isCreatingEndpoint} className="bg-primary hover:bg-primary/90 text-white">
                  {isCreatingEndpoint ? (
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

      <ConfirmModal
        isOpen={routeToDelete !== null}
        onClose={() => setRouteToDelete(null)}
        onConfirm={() => {
          if (routeToDelete) {
            deleteEndpoint(routeToDelete.id);
          }
        }}
        title="Unregister Endpoint"
        message={`Are you sure you want to unregister the route "${routeToDelete?.method} ${routeToDelete?.path}"? This will permanently delete all associated request telemetry logs.`}
        confirmText="Unregister"
        variant="destructive"
      />
    </div>
  );
}