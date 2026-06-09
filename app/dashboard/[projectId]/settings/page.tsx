"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useProjectDetail } from "@/hooks/useProjects";
import { ArrowLeft, Trash2, Copy, Check, Loader2, Key, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SettingsPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = React.use(params);
  const router = useRouter();
  const [copiedKey, setCopiedKey] = useState(false);
  const [revealKey, setRevealKey] = useState(false);

  // Fetch project details & deletion mutation
  const {
    project,
    isLoadingProject: isLoading,
    deleteProjectAsync,
    isDeletingProject,
  } = useProjectDetail(projectId);

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this project? This will permanently remove all registered endpoints and API logs. This action cannot be undone.")) {
      try {
        await deleteProjectAsync();
        router.push("/dashboard");
      } catch (err) {
        console.error(err);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <span className="text-sm text-zinc-400">Loading settings...</span>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <ShieldAlert className="w-8 h-8 text-red-500" />
        <span className="text-sm text-zinc-400">Project not found.</span>
        <Button asChild variant="outline" className="mt-4">
          <Link href="/dashboard">Back to Projects</Link>
        </Button>
      </div>
    );
  }

  const apiKey = project.apiKeys?.[0]?.key || "No key registered";

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-zinc-800/50">
          <Link href={`/dashboard/${projectId}`}>
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-white">Project Settings</h1>
          <p className="text-sm text-zinc-400">Manage project details, credentials, and delete configurations</p>
        </div>
      </div>
      {/* Sub Navigation */}
      <div className="border-b border-zinc-800/80 mb-6">
        <nav className="flex gap-6">
          <Link href={`/dashboard/${project.id}`} className="border-b-2 border-transparent py-3 text-sm font-medium text-zinc-400 hover:text-white transition-colors">
            Overview
          </Link>
          <Link href={`/dashboard/${project.id}/endpoints`} className="border-b-2 border-transparent py-3 text-sm font-medium text-zinc-400 hover:text-white transition-colors">
            Endpoints
          </Link>
          <Link href={`/dashboard/${project.id}/logs`} className="border-b-2 border-transparent py-3 text-sm font-medium text-zinc-400 hover:text-white transition-colors">
            Logs
          </Link>
          <Link href={`/dashboard/${project.id}/settings`} className="border-b-2 border-primary py-3 text-sm font-medium text-primary">
            Settings
          </Link>
        </nav>
      </div>
      {/* Settings Sections */}
      <div className="space-y-6">
        <div className="bg-zinc-900/30 p-6 rounded-xl border border-zinc-800/60 space-y-4">
          <h2 className="text-sm font-semibold text-white">Project Information</h2>
          <div className="grid grid-cols-1 gap-4 pt-2">
            <div>
              <span className="text-[11px] font-medium text-zinc-500 block mb-1">PROJECT NAME</span>
              <span className="text-sm text-white font-medium">{project.name}</span>
            </div>
            <div>
              <span className="text-[11px] font-medium text-zinc-500 block mb-1">PROJECT DESCRIPTION</span>
              <span className="text-sm text-zinc-300">
                {project.description || "No description provided."}
              </span>
            </div>
          </div>
        </div>
        {/* API Credentials Card */}
        <div className="bg-zinc-900/30 p-6 rounded-xl border border-zinc-800/60 space-y-4">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-zinc-400" />
            <h2 className="text-sm font-semibold text-white">API Credentials</h2>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            API Keys permit secure ingest calls. Pass this token in the header as <code>Authorization: Bearer &lt;YOUR_API_KEY&gt;</code> when hitting the logger endpoint.
          </p>
          <div className="space-y-3 pt-2">
            <span className="text-[11px] font-medium text-zinc-500 block">API KEY</span>
            <div className="flex items-center gap-2 bg-zinc-950 p-3 rounded-lg border border-zinc-800 font-mono text-xs text-white max-w-xl">
              <span className="flex-1 truncate select-all">{revealKey ? apiKey : "••••••••••••••••••••••••••••••••"}</span>
              <button
                onClick={() => setRevealKey(!revealKey)}
                className="px-2 py-1 text-[10px] text-zinc-400 hover:text-white rounded hover:bg-zinc-800 transition-colors mr-1"
              >
                {revealKey ? "Hide" : "Reveal"}
              </button>
              <button
                onClick={() => handleCopyKey(apiKey)}
                className="p-1.5 text-zinc-400 hover:text-white rounded hover:bg-zinc-800 transition-colors"
                title="Copy API Key"
              >
                {copiedKey ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
        {/* Danger Zone Card */}
        <div className="bg-red-500/5 p-6 rounded-xl border border-red-900/30 space-y-4">
          <div className="flex items-center gap-2 text-red-400">
            <ShieldAlert className="w-4 h-4" />
            <h2 className="text-sm font-bold">Danger Zone</h2>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Deleting this project is a permanent action. All registered endpoints and stored request logs will be removed immediately.
          </p>
          <div className="pt-2">
            <Button
              onClick={handleDelete}
              disabled={isDeletingProject}
              className="bg-red-950/40 text-red-400 border border-red-900/50 hover:bg-red-900 hover:text-white transition-all text-xs px-4 py-2"
            >
              {isDeletingProject ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" /> Deleting project...
                </>
              ) : (
                <>
                  <Trash2 className="w-3.5 h-3.5 mr-2" /> Permanently Delete Project
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}