"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useProjectLogs } from "@/hooks/useAnalytics";
import { ArrowLeft, Search, Loader2, Database } from "lucide-react";
import { format } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";
import { useSocket } from "@/hooks/useSocket";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function LogsPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = React.use(params);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const limit = 10;

  const queryClient = useQueryClient();

  // Fetch paginated logs
  const { data, isLoading } = useProjectLogs(projectId, page, limit);

  // Subscribe to real-time logs via WebSockets
  useSocket(projectId, () => {
    queryClient.invalidateQueries({ queryKey: ["projectLogs", projectId] });
  });

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return "bg-green-500/10 text-green-400 border-green-500/20";
    if (status >= 400 && status < 500) return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
    if (status >= 500) return "bg-red-500/10 text-red-400 border-red-500/20";
    return "bg-zinc-800 text-zinc-300 border-zinc-700";
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case "GET": return "text-blue-400";
      case "POST": return "text-green-400";
      case "PUT": return "text-yellow-400";
      case "DELETE": return "text-red-400";
      default: return "text-white";
    }
  };

  const logs = data?.logs || [];
  const pagination = data?.pagination || { total: 0, page: 1, limit: 10, totalPages: 1 };

  // Filter logs client-side by endpoint path or status code matching searchTerm
  const filteredLogs = logs.filter((log) => {
    const term = searchTerm.toLowerCase();
    return (
      log.endpoint.path.toLowerCase().includes(term) ||
      log.statusCode.toString().includes(term) ||
      log.endpoint.method.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-zinc-800/50">
          <Link href={`/dashboard/${projectId}`}>
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-white">API Logs</h1>
          <p className="text-sm text-zinc-400">Real-time request logs and traces</p>
        </div>
      </div>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 bg-zinc-900/30 p-4 rounded-xl border border-zinc-800/60">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <Input 
            placeholder="Search by endpoint path, method, status..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-zinc-950/50 border-zinc-800 focus-visible:ring-primary text-white"
          />
        </div>
      </div>
      {/* Logs Table */}
      {isLoading ? (
        <div className="bg-zinc-900/20 border border-zinc-800/60 rounded-xl p-16 flex h-[450px] flex-col items-center justify-center gap-3">
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
          <span className="text-xs text-zinc-400">Fetching live log feed...</span>
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="text-center bg-zinc-900/20 border border-zinc-800/60 rounded-xl h-[450px] flex flex-col items-center justify-center py-16">
          <div className="w-12 h-12 bg-zinc-800/60 rounded-full flex items-center justify-center mx-auto mb-4 border border-zinc-700/50">
            <Database className="w-5 h-5 text-zinc-400" />
          </div>
          <h3 className="text-sm font-semibold text-white mb-1">No logs found</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            {searchTerm ? "No logs match your current search terms." : "No API requests have been recorded for this project yet. Use the Log Simulator to generate some traffic."}
          </p>
        </div>
      ) : (
        <div className="bg-zinc-900/10 rounded-xl border border-zinc-800/60 overflow-hidden">
          <Table>
            <TableHeader className="bg-zinc-900/50 hover:bg-zinc-900/50">
              <TableRow className="border-b border-zinc-850">
                <TableHead className="text-zinc-400 font-mono text-[11px]">Timestamp</TableHead>
                <TableHead className="text-zinc-400 font-mono text-[11px]">Method</TableHead>
                <TableHead className="text-zinc-400 font-mono text-[11px]">Endpoint Path</TableHead>
                <TableHead className="text-zinc-400 font-mono text-[11px]">Status</TableHead>
                <TableHead className="text-zinc-400 font-mono text-[11px] text-right">Response Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log) => (
                <TableRow key={log.id} className="border-b border-zinc-850/60 hover:bg-zinc-900/20 transition-colors">
                  <TableCell className="text-xs text-zinc-500 font-mono">
                    {format(new Date(log.timestamp), "MMM dd, HH:mm:ss.SSS")}
                  </TableCell>
                  <TableCell>
                    <span className={`text-xs font-bold font-mono ${getMethodColor(log.endpoint.method)}`}>
                      {log.endpoint.method}
                    </span>
                  </TableCell>
                  <TableCell className="text-white font-mono text-xs">
                    {log.endpoint.path}
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${getStatusColor(log.statusCode)}`}>
                      {log.statusCode}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={`text-xs font-mono font-medium ${log.responseTime > 500 ? 'text-red-400 font-bold' : 'text-zinc-300'}`}>
                      {log.responseTime}ms
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {/* Pagination controls */}
          <div className="p-4 border-t border-zinc-850 flex items-center justify-between text-xs text-zinc-400 font-mono bg-zinc-900/20">
            <span>
              Page {pagination.page} of {pagination.totalPages || 1} ({pagination.total} total logs)
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="bg-zinc-950 hover:bg-zinc-900 border-zinc-850 disabled:opacity-50 text-white"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={page >= pagination.totalPages}
                className="bg-zinc-950 hover:bg-zinc-900 border-zinc-850 disabled:opacity-50 text-white"
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}