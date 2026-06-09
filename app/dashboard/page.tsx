"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useProjects } from "@/hooks/useProjects";
import { Plus, Activity, Trash2, X, Loader2, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function DashboardPage() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newApiKey, setNewApiKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Authentication check
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
    }
  }, [router]);

  const {
    projects,
    isLoadingProjects,
    createProjectAsync,
    isCreatingProject,
    deleteProject
  } = useProjects();

  const handleCreateProject = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    if (name) {
      try {
        const data = await createProjectAsync({ name, description });
        setNewApiKey(data.apiKey);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleCopyKey = () => {
    if (newApiKey) {
      navigator.clipboard.writeText(newApiKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setNewApiKey(null);
  };

  const isLoading = isLoadingProjects;
  const isCreating = isCreatingProject;

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Projects</h1>
          <p className="text-muted-foreground text-sm">Manage and monitor your API projects</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="bg-primary hover:bg-primary/90 text-white font-medium px-4 py-2 border-0">
          <Plus className="w-4 h-4 mr-2" />
          Create Project
        </Button>
      </div>
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-zinc-900/40 p-6 rounded-xl border border-zinc-800/50 animate-pulse">
              <div className="h-6 bg-zinc-800 rounded w-1/2 mb-4" />
              <div className="h-4 bg-zinc-800/60 rounded w-3/4 mb-8" />
              <div className="grid grid-cols-2 gap-4">
                <div className="h-10 bg-zinc-800/40 rounded" />
                <div className="h-10 bg-zinc-800/40 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-16 bg-zinc-900/20 border border-dashed border-zinc-800 rounded-2xl p-8 max-w-lg mx-auto">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-primary/20">
            <Activity className="w-6 h-6 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">No projects yet</h3>
          <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
            Create your first project to get an API Key and start tracking request logs in real-time.
          </p>
          <Button onClick={() => setIsModalOpen(true)} className="bg-primary hover:bg-primary/90 text-white">
            <Plus className="w-4 h-4 mr-2" /> Create first project
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div
              key={project.id}
              className="bg-zinc-900/30 p-6 rounded-xl border border-zinc-800/60 hover:border-zinc-700/80 transition-all group relative overflow-hidden flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-white group-hover:text-primary transition-colors">
                    <Link href={`/dashboard/${project.id}`} className="hover:underline">
                      {project.name}
                    </Link>
                  </h3>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.preventDefault();
                        if (confirm(`Are you sure you want to delete ${project.name}?`)) {
                          deleteProject(project.id);
                        }
                      }}
                      className="h-8 w-8 text-zinc-500 hover:text-red-400 hover:bg-zinc-850 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-zinc-400 mb-6 line-clamp-2 min-h-[40px]">
                  {project.description || "No description provided."}
                </p>
              </div>
              <div className="pt-4 border-t border-zinc-800/50 flex items-center justify-between text-xs">
                <div className="text-zinc-500">
                  Created {new Date(project.createdAt).toLocaleDateString()}
                </div>
                <Link
                  href={`/dashboard/${project.id}`}
                  className="text-primary hover:underline flex items-center gap-1 font-medium"
                >
                  View Analytics →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
      {/* Create Project Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-zinc-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-zinc-800 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-zinc-800/50">
              <h2 className="text-lg font-semibold text-white">
                {newApiKey ? "Project Created 🎉" : "Create New Project"}
              </h2>
              {!isCreatingProject && (
                <button
                  onClick={handleCloseModal}
                  className="text-zinc-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
            {newApiKey ? (
              <div className="p-6 space-y-4">
                <p className="text-sm text-zinc-400 leading-relaxed">
                  Here is your generated API key. Copy this key now! You will not be able to retrieve it again.
                </p>
                <div className="flex items-center gap-2 bg-zinc-950 p-3 rounded-lg border border-zinc-800 font-mono text-xs select-all text-white overflow-x-auto">
                  <span className="flex-1 whitespace-nowrap">{newApiKey}</span>
                  <button
                    onClick={handleCopyKey}
                    className="p-2 text-zinc-400 hover:text-white rounded-md hover:bg-zinc-800 transition-colors"
                    title="Copy to Clipboard"
                  >
                    {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <div className="pt-4 flex justify-end">
                  <Button onClick={handleCloseModal} className="bg-primary hover:bg-primary/90 text-white">
                    Done
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCreateProject} className="p-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-zinc-300">Project Name</Label>
                  <Input
                    id="name"
                    name="name"
                    required
                    placeholder="e.g. Production API"
                    className="bg-zinc-950/50 border-zinc-800 focus-visible:ring-primary text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-zinc-300">Description (Optional)</Label>
                  <textarea
                    id="description"
                    name="description"
                    rows={3}
                    placeholder="Briefly describe this project..."
                    className="w-full rounded-md border border-zinc-800 bg-zinc-950/50 px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                  />
                </div>
                <div className="pt-4 flex justify-end gap-3">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleCloseModal}
                    className="hover:bg-zinc-800 hover:text-white border-zinc-800 text-zinc-400"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isCreatingProject}
                    className="bg-primary hover:bg-primary/90 text-white"
                  >
                    {isCreatingProject ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating...
                      </>
                    ) : (
                      "Create Project"
                    )}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}