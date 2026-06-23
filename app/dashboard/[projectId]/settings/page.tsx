"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useProjectDetail } from "@/hooks/useProjects";
import { useAlertRules } from "@/hooks/useAlerts";
import { ArrowLeft, Trash2, Copy, Check, Loader2, Key, ShieldAlert, Bell, Plus, ToggleLeft, ToggleRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmModal } from "@/components/ui/confirm-modal";

export default function SettingsPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = React.use(params);
  const router = useRouter();
  const [copiedKey, setCopiedKey] = useState(false);
  const [revealKey, setRevealKey] = useState(false);
  const [isDeleteProjectOpen, setIsDeleteProjectOpen] = useState(false);
  const [ruleToDelete, setRuleToDelete] = useState<{ id: string; name: string } | null>(null);

  // Fetch project details & deletion mutation
  const {
    project,
    isLoadingProject: isLoading,
    deleteProjectAsync,
    isDeletingProject,
  } = useProjectDetail(projectId);

  // Alert rules state
  const { rules, createRule, toggleRule, deleteRule, isCreatingRule } = useAlertRules(projectId);
  const [isAddRuleOpen, setIsAddRuleOpen] = useState(false);

  // Form State
  const [ruleName, setRuleName] = useState("");
  const [threshold, setThreshold] = useState(5.0);
  const [windowMin, setWindowMin] = useState(5);
  const [cooldownMin, setCooldownMin] = useState(30);
  const [minReqs, setMinReqs] = useState(10);

  const handleCreateRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ruleName || threshold === undefined) return;
    createRule({
      name: ruleName,
      thresholdPercentage: Number(threshold),
      windowMinutes: Number(windowMin),
      cooldownMinutes: Number(cooldownMin),
      minRequests: Number(minReqs),
    }, {
      onSuccess: () => {
        setRuleName("");
        setThreshold(5.0);
        setWindowMin(5);
        setCooldownMin(30);
        setMinReqs(10);
        setIsAddRuleOpen(false);
      }
    });
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleDelete = () => {
    setIsDeleteProjectOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteProjectAsync();
      router.push("/dashboard");
    } catch (err) {
      console.error(err);
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
        {/* Alerting Rules Card */}
        <div className="bg-zinc-900/30 p-6 rounded-xl border border-zinc-800/60 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-zinc-400" />
              <h2 className="text-sm font-semibold text-white">5xx Error Alerting Rules</h2>
            </div>
            <Button
              onClick={() => setIsAddRuleOpen(!isAddRuleOpen)}
              variant="outline"
              size="sm"
              className="text-xs h-7 border-zinc-800 hover:bg-zinc-800 text-zinc-300 hover:text-white"
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> Add Rule
            </Button>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Configure threshold rules to receive email alerts when your endpoints experience high 5xx error percentages. A cooldown is applied after each alert to prevent inbox spam.
          </p>
          {isAddRuleOpen && (
            <form onSubmit={handleCreateRule} className="bg-zinc-950/60 p-4 rounded-lg border border-zinc-800/80 space-y-4 animate-in fade-in duration-200">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">New Alert Rule</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-medium text-zinc-400 uppercase">Rule Name</label>
                  <Input
                    placeholder="e.g. Production 5xx spike"
                    value={ruleName}
                    onChange={(e) => setRuleName(e.target.value)}
                    required
                    className="h-8 bg-zinc-900 border-zinc-800 text-xs text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-medium text-zinc-400 uppercase">5xx Error Threshold (%)</label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    placeholder="5.0"
                    value={threshold}
                    onChange={(e) => setThreshold(Number(e.target.value))}
                    required
                    className="h-8 bg-zinc-900 border-zinc-800 text-xs text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-medium text-zinc-400 uppercase">Time Window (Minutes)</label>
                  <select
                    value={windowMin}
                    onChange={(e) => setWindowMin(Number(e.target.value))}
                    className="w-full h-8 rounded-md border border-zinc-800 bg-zinc-900 px-3 text-xs text-white"
                  >
                    <option value={1}>1 Minute</option>
                    <option value={5}>5 Minutes</option>
                    <option value={15}>15 Minutes</option>
                    <option value={30}>30 Minutes</option>
                    <option value={60}>60 Minutes (1 hour)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-medium text-zinc-400 uppercase">Cooldown Duration</label>
                  <select
                    value={cooldownMin}
                    onChange={(e) => setCooldownMin(Number(e.target.value))}
                    className="w-full h-8 rounded-md border border-zinc-800 bg-zinc-900 px-3 text-xs text-white"
                  >
                    <option value={10}>10 Minutes</option>
                    <option value={30}>30 Minutes</option>
                    <option value={60}>60 Minutes (1 hour)</option>
                    <option value={720}>12 Hours</option>
                    <option value={1440}>24 Hours</option>
                  </select>
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-[10px] font-medium text-zinc-400 uppercase block mb-0.5">Minimum Requests (in window)</label>
                  <span className="text-[10px] text-zinc-500 block mb-1">Alert will only fire if at least this many requests occur in the time window (prevents alerts on single test failures).</span>
                  <Input
                    type="number"
                    min="1"
                    placeholder="10"
                    value={minReqs}
                    onChange={(e) => setMinReqs(Number(e.target.value))}
                    className="h-8 bg-zinc-905 border-zinc-800 text-xs text-white max-w-[200px]"
                  />
                </div>
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <Button
                  type="button"
                  onClick={() => setIsAddRuleOpen(false)}
                  variant="ghost"
                  size="sm"
                  className="text-xs h-8 text-zinc-400 hover:text-white"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isCreatingRule}
                  size="sm"
                  className="bg-primary hover:bg-primary/95 text-white text-xs h-8 px-4"
                >
                  {isCreatingRule ? "Saving..." : "Save Rule"}
                </Button>
              </div>
            </form>
          )}
          <div className="space-y-3 pt-2">
            <span className="text-[11px] font-medium text-zinc-500 block">ACTIVE ALERTS ({rules.length})</span>
            {rules.length === 0 ? (
              <div className="text-xs text-zinc-500 italic p-3 bg-zinc-950/40 rounded-lg border border-zinc-850">
                No alert rules defined. Click &#34;Add Rule&#34; to configure one.
              </div>
            ) : (
              <div className="divide-y divide-zinc-800/60 bg-zinc-950/30 rounded-lg border border-zinc-800/80 overflow-hidden">
                {rules.map((rule) => (
                  <div key={rule.id} className="p-4 flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-semibold text-white">{rule.name}</h4>
                        {!rule.active && (
                          <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-500 text-[9px] font-medium">Inactive</span>
                        )}
                      </div>
                      <p className="text-[10px] text-zinc-400 leading-relaxed">
                        Triggers if error rate is <strong className="text-red-400 font-mono">&gt;= {rule.thresholdPercentage}%</strong> over <strong className="text-white font-mono">{rule.windowMinutes}m</strong> window (Min reqs: <strong className="text-white font-mono">{rule.minRequests}</strong>) • Cooldown: <strong className="text-white font-mono">{rule.cooldownMinutes}m</strong>
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => toggleRule({ ruleId: rule.id })}
                        className="text-zinc-400 hover:text-white transition-colors"
                        title={rule.active ? "Deactivate Rule" : "Activate Rule"}
                      >
                        {rule.active ? (
                          <ToggleRight className="w-6 h-6 text-green-500" />
                        ) : (
                          <ToggleLeft className="w-6 h-6 text-zinc-600" />
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setRuleToDelete({ id: rule.id, name: rule.name });
                        }}
                        className="p-1 text-zinc-500 hover:text-red-400 rounded hover:bg-zinc-800/50 transition-colors cursor-pointer"
                        title="Delete Rule"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
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

      <ConfirmModal
        isOpen={isDeleteProjectOpen}
        onClose={() => setIsDeleteProjectOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Project"
        message={`Are you sure you want to delete this project? This will permanently remove all registered endpoints and API logs. This action cannot be undone.`}
        confirmText="Delete Project"
        variant="destructive"
      />

      <ConfirmModal
        isOpen={ruleToDelete !== null}
        onClose={() => setRuleToDelete(null)}
        onConfirm={() => {
          if (ruleToDelete) {
            deleteRule(ruleToDelete.id);
          }
        }}
        title="Delete Alert Rule"
        message={`Are you sure you want to delete the alert rule "${ruleToDelete?.name}"?`}
        confirmText="Delete Rule"
        variant="destructive"
      />
    </div>
  );
}