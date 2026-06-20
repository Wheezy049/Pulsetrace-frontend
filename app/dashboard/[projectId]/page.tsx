"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useProjectDetail } from "@/hooks/useProjects";
import { useProjectStats, useSimulateLog } from "@/hooks/useAnalytics";
import { ArrowLeft, Activity, AlertTriangle, CheckCircle2, Copy, Check, Loader2, Play } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useSocket } from "@/hooks/useSocket";
import { XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Bar, Legend, ComposedChart, PieChart, Pie, Cell } from "recharts";
import type { TooltipProps } from "recharts";
import { Button } from "@/components/ui/button";

  type CustomTooltipProps = TooltipProps<number, string> & {
    payload?: Array<{
      name?: string;
      value?: number | string;
      color?: string;
      payload?: { color?: string };
    }>;
    label?: TooltipLabel;
  };

  type TooltipLabel = string | number | undefined;

export default function ProjectOverviewPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = React.use(params);
  const [timeFilter, setTimeFilter] = useState('7d');
  const [copiedKey, setCopiedKey] = useState(false);

  // Integration Snippet State
  const [snippetTab, setSnippetTab] = useState<'curl' | 'express' | 'fastapi'>('curl');
  const [copiedSnippet, setCopiedSnippet] = useState(false);

  // Simulator Form State
  const [selectedEndpoint, setSelectedEndpoint] = useState("");
  const [simStatus, setSimStatus] = useState(200);
  const [simLatency, setSimLatency] = useState(120);
  const [simError, setSimError] = useState<string | null>(null);
  const [simSuccess, setSimSuccess] = useState(false);

  const handleCopySnippet = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  const getSnippetCode = () => {
    const activeEndpointId = selectedEndpoint || stats?.endpointStats?.[0]?.id || "YOUR_ENDPOINT_ID";
    switch (snippetTab) {
      case "curl":
        return `curl -X POST http://localhost:5000/api/logs \\
  -H "Authorization: Bearer ${apiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "endpointId": "${activeEndpointId}",
    "statusCode": 200,
    "responseTime": 120
  }'`;
      case "express":
        return `// Express.js Middleware Example
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    const endpointId = "${activeEndpointId}";
    
    fetch('http://localhost:5000/api/logs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ${apiKey}'
      },
      body: JSON.stringify({
        endpointId,
        statusCode: res.statusCode,
        responseTime: duration
      })
    }).catch(err => console.error('Logging failed', err));
  });
  next();
});`;
      case "fastapi":
        return `# Python FastAPI Middleware Example
import time, httpx
from fastapi import Request

@app.middleware("http")
async def log_requests(request: Request, call_next):
    start = time.time()
    response = await call_next(request)
    duration = int((time.time() - start) * 1000)
    
    async with httpx.AsyncClient() as client:
        await client.post(
            "http://localhost:5000/api/logs",
            headers={"Authorization": "Bearer ${apiKey}"},
            json={
                "endpointId": "${activeEndpointId}",
                "statusCode": response.status_code,
                "responseTime": duration
            }
        )
    return response`;
      default:
        return "";
    }
  };

  const queryClient = useQueryClient();

  // Fetch project details using custom hooks
  const { project, isLoadingProject } = useProjectDetail(projectId);

  // Fetch project stats
  const { data: stats, isLoading: isStatsLoading } = useProjectStats(projectId);

  // Subscribe to real-time logs via WebSockets
  useSocket(projectId, () => {
    queryClient.invalidateQueries({ queryKey: ["projectStats", projectId] });
  });

  // Simulator mutation hook
  const { simulateAsync, isSimulating } = useSimulateLog(projectId);

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleSimulate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSimError(null);
    const apiKey = project?.apiKeys?.[0]?.key;
    if (!apiKey) {
      setSimError("No API Key found for this project. Check your settings.");
      return;
    }
    if (!selectedEndpoint) {
      setSimError("Please register and select an endpoint to simulate traffic.");
      return;
    }
    try {
      await simulateAsync({
        apiKey,
        endpointId: selectedEndpoint,
        statusCode: Number(simStatus),
        responseTime: Number(simLatency),
      });
      setSimSuccess(true);
      setSimError(null);
      setTimeout(() => setSimSuccess(false), 2000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to submit simulated request";
      setSimError(errorMessage);
    }
  };

  const isLoading = isLoadingProject || isStatsLoading;

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <span className="text-sm text-zinc-400">Loading project analytics...</span>
      </div>
    );
  }

  if (!project || !stats) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <AlertTriangle className="w-8 h-8 text-red-500" />
        <span className="text-sm text-zinc-400">Project data not found.</span>
        <Button asChild variant="outline" className="mt-4">
          <Link href="/dashboard">Back to Projects</Link>
        </Button>
      </div>
    );
  }

  const apiKey = project.apiKeys?.[0]?.key || "No key registered";

  // Recharts custom tooltip
  const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800 shadow-xl text-xs font-mono">
          <p className="text-white mb-2 font-semibold">{label}</p>
          {payload.map((entry, index: number) => (
            <div key={index} className="flex items-center gap-2 mt-1">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.payload?.color || entry.color }} />
              <span className="text-zinc-400">{entry.name}:</span>
              <span className="font-semibold text-white">
                {entry.value}
                {entry.name?.includes("Rate") ? "%" : ""}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  // Compile status code breakdown dynamically from endpoints
  const totalLogsCount = stats.totalRequests;
  const errorLogsCount = stats.failedRequests;
  const successLogsCount = totalLogsCount - errorLogsCount;
  const successRate = stats.successRate;

  const statusCodeData = [
    { name: '2xx Success', value: successLogsCount, color: '#22c55e' },
    { name: '4xx/5xx Errors', value: errorLogsCount, color: '#ef4444' },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-zinc-800/50">
            <Link href="/dashboard">
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-white">{project.name}</h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-primary/10 text-primary border border-primary/20">
                ACTIVE
              </span>
            </div>
            <p className="text-xs text-zinc-500 font-mono mt-0.5">{project.id}</p>
          </div>
        </div>
        {/* Time Filters */}
        <div className="flex bg-zinc-950 p-1 rounded-lg border border-zinc-800 self-start md:self-auto">
          {['24h', '7d'].map((filter) => (
            <button
              key={filter}
              onClick={() => setTimeFilter(filter)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${timeFilter === filter
                ? 'bg-primary text-white'
                : 'text-zinc-400 hover:text-white'
                }`}
            >
              {filter === '24h' ? 'Last 24 Hours' : 'Last 7 Days'}
            </button>
          ))}
        </div>
      </div>
      {/* Sub Navigation */}
      <div className="border-b border-zinc-800/80 mb-6">
        <nav className="flex gap-6">
          <Link href={`/dashboard/${project.id}`} className="border-b-2 border-primary py-3 text-sm font-medium text-primary">
            Overview
          </Link>
          <Link href={`/dashboard/${project.id}/endpoints`} className="border-b-2 border-transparent py-3 text-sm font-medium text-zinc-400 hover:text-white transition-colors">
            Endpoints
          </Link>
          <Link href={`/dashboard/${project.id}/logs`} className="border-b-2 border-transparent py-3 text-sm font-medium text-zinc-400 hover:text-white transition-colors">
            Logs
          </Link>
          <Link href={`/dashboard/${project.id}/settings`} className="border-b-2 border-transparent py-3 text-sm font-medium text-zinc-400 hover:text-white transition-colors">
            Settings
          </Link>
        </nav>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Analytics Section */}
        <div className="col-span-1 lg:col-span-2 space-y-6">  
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-zinc-900/30 p-5 rounded-xl border border-zinc-800/60">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-medium text-zinc-400">Total API Requests</span>
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Activity className="w-4 h-4 text-blue-400" />
                </div>
              </div>
              <span className="text-2xl font-bold text-white font-mono">{stats.totalRequests.toLocaleString()}</span>
            </div>
            <div className="bg-zinc-900/30 p-5 rounded-xl border border-zinc-800/60">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-medium text-zinc-400">Failed Requests</span>
                <div className="p-2 rounded-lg bg-red-500/10">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                </div>
              </div>
              <span className="text-2xl font-bold text-white font-mono">{stats.failedRequests.toLocaleString()}</span>
            </div>
            <div className="bg-zinc-900/30 p-5 rounded-xl border border-zinc-800/60">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-medium text-zinc-400">Success Rate</span>
                <div className={`p-2 rounded-lg ${successRate >= 95 ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                  <CheckCircle2 className={`w-4 h-4 ${successRate >= 95 ? 'text-green-400' : 'text-red-400'}`} />
                </div>
              </div>
              <span className={`text-2xl font-bold font-mono ${successRate >= 95 ? 'text-green-400' : 'text-red-400'}`}>
                {successRate}%
              </span>
            </div>
          </div>
          {/* Traffic Composed Chart */}
          <div className="bg-zinc-900/30 p-6 rounded-xl border border-zinc-800/60">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-white">Daily Traffic Overview</h2>
              <p className="text-xs text-zinc-400 mt-1">Total requests vs failed requests over the last 7 days</p>
            </div>
            <div className="h-[280px] w-full font-mono text-xs">
              {stats.chartData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-zinc-500">
                  No traffic records available for the selected period
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={stats.chartData} margin={{ top: 10, right: -5, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f1f23" vertical={false} />
                    <XAxis dataKey="date" stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(str) => {
                      const date = new Date(str);
                      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                    }} />
                    <YAxis stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} />
                    <RechartsTooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ paddingTop: '15px' }} />
                    <Bar dataKey="successful" name="Success Volume" fill="#22c55e" radius={[2, 2, 0, 0]} barSize={24} fillOpacity={0.6} stackId="a" />
                    <Bar dataKey="failed" name="Failure Volume" fill="#ef4444" radius={[2, 2, 0, 0]} barSize={24} fillOpacity={0.6} stackId="a" />
                  </ComposedChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
          {/* Lower Analytics details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Status Codes */}
            <div className="bg-zinc-900/30 p-6 rounded-xl border border-zinc-800/60 flex flex-col justify-between">
              <div>
                <h2 className="text-sm font-semibold text-white mb-1">Status Code Distribution</h2>
                <p className="text-xs text-zinc-400 mb-4">Proportion of success vs error codes recorded</p>
              </div>
              <div className="flex-1 min-h-[160px] w-full relative flex items-center justify-center">
                {totalLogsCount === 0 ? (
                  <span className="text-xs text-zinc-500 font-mono">No data available</span>
                ) : (
                  <>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={statusCodeData.filter(d => d.value > 0)}
                          cx="50%"
                          cy="50%"
                          innerRadius={45}
                          outerRadius={65}
                          paddingAngle={3}
                          dataKey="value"
                          stroke="none"
                        >
                          {statusCodeData.filter(d => d.value > 0).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <RechartsTooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-lg font-bold text-white font-mono">{successRate}%</span>
                      <span className="text-[9px] text-zinc-500 uppercase tracking-wider">Success</span>
                    </div>
                  </>
                )}
              </div>
              {totalLogsCount > 0 && (
                <div className="flex items-center justify-center gap-6 mt-2">
                  {statusCodeData.map((status, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-xs font-mono">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: status.color }} />
                      <span className="text-zinc-400">{status.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* Top Endpoints */}
            <div className="bg-zinc-900/30 p-6 rounded-xl border border-zinc-800/60">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-white">Endpoint Performance</h2>
                <Link href={`/dashboard/${project.id}/endpoints`} className="text-xs text-primary hover:underline">
                  View All
                </Link>
              </div>
              <div className="space-y-4 max-h-[200px] overflow-y-auto">
                {stats.endpointStats.length === 0 ? (
                  <div className="py-8 text-center text-xs text-zinc-500 font-mono">
                    No registered endpoints found.
                  </div>
                ) : (
                  stats.endpointStats.map((ep, i) => (
                    <div key={i} className="flex flex-col gap-1 text-xs">
                      <div className="flex justify-between items-center font-mono">
                        <span className="text-white truncate max-w-[70%]" title={ep.path}>
                          <span className={`mr-1.5 font-bold ${
                            ep.method === "GET" ? "text-blue-400" :
                            ep.method === "POST" ? "text-green-400" : "text-yellow-400"
                          }`}>{ep.method}</span>
                          {ep.path}
                        </span>
                        <span className="text-zinc-500">{ep.totalRequests} reqs</span>
                      </div>
                      <div className="flex justify-between items-center text-[10px] text-zinc-400">
                        <span>Avg Latency: <strong className="text-white font-mono">{ep.avgResponseTime}ms</strong></span>
                        <span className={ep.successRate >= 95 ? 'text-green-400' : 'text-red-400'}>
                          {ep.successRate}% Success
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="space-y-6">
          {/* API Key Panel */}
          <div className="bg-zinc-900/30 p-5 rounded-xl border border-zinc-800/60 space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-white">Project API Key</h3>
              <p className="text-[11px] text-zinc-400 mt-1">Use this token inside your API Client headers to send logs.</p>
            </div>
            <div className="flex items-center gap-2 bg-zinc-950 p-2.5 rounded-lg border border-zinc-800 font-mono text-[11px] select-all text-white">
              <span className="flex-1 truncate select-none">{copiedKey ? apiKey : "••••••••••••••••••••••••••••••••"}</span>
              <button
                onClick={() => handleCopyKey(apiKey)}
                className="p-1.5 text-zinc-400 hover:text-white rounded hover:bg-zinc-800 transition-colors"
                title="Copy Key"
              >
                {copiedKey ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
          {/* API Integration Snippets */}
          <div className="bg-zinc-900/30 p-5 rounded-xl border border-zinc-800/60 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div>
              <h3 className="text-sm font-semibold text-white">SDK & Integration</h3>
              <p className="text-[11px] text-zinc-400 mt-1">Send live HTTP request latency and status codes from your backend.</p>
            </div>
            
            <div className="flex bg-zinc-950 p-0.5 rounded-lg border border-zinc-850">
              {(['curl', 'express', 'fastapi'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setSnippetTab(tab)}
                  className={`flex-1 py-1.5 text-[10px] font-mono rounded transition-colors ${snippetTab === tab
                    ? 'bg-zinc-800 text-white font-medium'
                    : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                >
                  {tab === 'curl' ? 'cURL' : tab === 'express' ? 'Express' : 'FastAPI'}
                </button>
              ))}
            </div>

            <div className="relative group">
              <pre className="bg-zinc-950 p-3 rounded-lg border border-zinc-850 font-mono text-[10px] text-zinc-300 overflow-x-auto max-h-[210px] leading-relaxed whitespace-pre select-all scrollbar-thin">
                <code>{getSnippetCode()}</code>
              </pre>
              <button
                type="button"
                onClick={() => handleCopySnippet(getSnippetCode())}
                className="absolute top-2 right-2 p-1.5 bg-zinc-900/90 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded border border-zinc-800/80 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                title="Copy Code"
              >
                {copiedSnippet ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
          {/* Log Simulator Panel */}
          <div className="bg-zinc-900/30 p-5 rounded-xl border border-zinc-800/60 space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Play className="w-4 h-4 text-primary fill-primary/20" /> Log Ingestor Simulator
              </h3>
              <p className="text-[11px] text-zinc-400 mt-1">Simulate live HTTP traffic to verify dashboard sync.</p>
            </div>
            {simError && (
              <div className="p-3 text-xs bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg">
                {simError}
              </div>
            )}
            {simSuccess && (
              <div className="p-3 text-xs bg-green-500/10 border border-green-500/20 text-green-400 rounded-lg flex items-center gap-1.5">
                <Check className="w-4 h-4" /> Simulated request ingested successfully!
              </div>
            )}
            <form onSubmit={handleSimulate} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-zinc-400">Endpoint Path</label>
                {stats.endpointStats.length === 0 ? (
                  <div className="text-xs text-red-400 p-2.5 bg-zinc-950/50 rounded-lg border border-zinc-850">
                    No registered endpoints. Add one in the <Link href={`/dashboard/${project.id}/endpoints`} className="underline text-primary">Endpoints Page</Link> first.
                  </div>
                ) : (
                  <select
                    value={selectedEndpoint}
                    onChange={(e) => setSelectedEndpoint(e.target.value)}
                    className="w-full h-9 rounded-md border border-zinc-800 bg-zinc-950/50 px-3 text-xs text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                  >
                    <option value="">-- Select Target Endpoint --</option>
                    {stats.endpointStats.map((ep) => (
                      <option key={ep.id} value={ep.id}>
                        {ep.method} {ep.path}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-zinc-400">Status Code</label>
                  <select
                    value={simStatus}
                    onChange={(e) => setSimStatus(Number(e.target.value))}
                    className="w-full h-9 rounded-md border border-zinc-800 bg-zinc-950/50 px-3 text-xs text-white focus-visible:outline-none"
                  >
                    <option value={200}>200 OK</option>
                    <option value={201}>201 Created</option>
                    <option value={400}>400 Bad Request</option>
                    <option value={401}>401 Unauthorized</option>
                    <option value={403}>403 Forbidden</option>
                    <option value={404}>404 Not Found</option>
                    <option value={500}>500 Server Error</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-zinc-400">Response Latency</label>
                  <select
                    value={simLatency}
                    onChange={(e) => setSimLatency(Number(e.target.value))}
                    className="w-full h-9 rounded-md border border-zinc-800 bg-zinc-950/50 px-3 text-xs text-white focus-visible:outline-none"
                  >
                    <option value={45}>45 ms</option>
                    <option value={120}>120 ms</option>
                    <option value={350}>350 ms</option>
                    <option value={800}>800 ms (Slow)</option>
                    <option value={1800}>1800 ms (Critical)</option>
                  </select>
                </div>
              </div>
              <Button
                type="submit"
                disabled={isSimulating || stats.endpointStats.length === 0}
                className="w-full bg-primary hover:bg-primary/90 text-white text-xs h-9 border-0"
              >
                {isSimulating ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" /> Ingesting Log...
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 mr-2" /> Fire Test Request
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}