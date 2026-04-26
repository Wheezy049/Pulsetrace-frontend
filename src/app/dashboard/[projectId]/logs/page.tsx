"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Search, Filter } from "lucide-react";
import { format } from "date-fns";
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

// Mock Logs Data
const mockLogs = [
  { id: "log-1", timestamp: new Date(Date.now() - 1000 * 60 * 2), method: "GET", path: "/api/v1/users/profile", status: 200, responseTime: 145 },
  { id: "log-2", timestamp: new Date(Date.now() - 1000 * 60 * 5), method: "POST", path: "/api/v1/payments", status: 500, responseTime: 1250 },
  { id: "log-3", timestamp: new Date(Date.now() - 1000 * 60 * 12), method: "GET", path: "/api/v1/products", status: 200, responseTime: 85 },
  { id: "log-4", timestamp: new Date(Date.now() - 1000 * 60 * 15), method: "POST", path: "/api/v1/auth/login", status: 401, responseTime: 210 },
  { id: "log-5", timestamp: new Date(Date.now() - 1000 * 60 * 25), method: "GET", path: "/api/v1/users/profile", status: 200, responseTime: 130 },
  { id: "log-6", timestamp: new Date(Date.now() - 1000 * 60 * 40), method: "PUT", path: "/api/v1/users/settings", status: 400, responseTime: 85 },
  { id: "log-7", timestamp: new Date(Date.now() - 1000 * 60 * 45), method: "GET", path: "/api/v1/products/search", status: 200, responseTime: 320 },
];

export default function LogsPage({ params }: { params: { projectId: string } }) {
  const [searchTerm, setSearchTerm] = useState("");

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return "bg-green-500/10 text-green-400 border-green-500/20";
    if (status >= 400 && status < 500) return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
    if (status >= 500) return "bg-red-500/10 text-red-400 border-red-500/20";
    return "bg-white/10 text-white border-white/20";
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

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild className="h-8 w-8 text-muted-foreground hover:text-white hover:bg-white/5">
          <Link href={`/dashboard/${params.projectId}`}>
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-white">API Logs</h1>
          <p className="text-sm text-muted-foreground">Real-time request logs and traces</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 glass p-4 rounded-xl border border-white/5">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search by endpoint path or status..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-background/50 border-white/10"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="glass border-white/10 hover:bg-white/5">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
        </div>
      </div>

      {/* Logs Table */}
      <div className="glass rounded-xl border border-white/5 overflow-hidden">
        <Table>
          <TableHeader className="bg-white/5 hover:bg-white/5">
            <TableRow className="border-b border-white/5">
              <TableHead className="text-muted-foreground">Timestamp</TableHead>
              <TableHead className="text-muted-foreground">Method</TableHead>
              <TableHead className="text-muted-foreground">Endpoint Path</TableHead>
              <TableHead className="text-muted-foreground">Status</TableHead>
              <TableHead className="text-muted-foreground text-right">Response Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockLogs.map((log) => (
              <TableRow key={log.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                <TableCell className="text-sm text-muted-foreground font-mono">
                  {format(log.timestamp, "MMM dd, HH:mm:ss.SSS")}
                </TableCell>
                <TableCell>
                  <span className={`text-xs font-bold ${getMethodColor(log.method)}`}>
                    {log.method}
                  </span>
                </TableCell>
                <TableCell className="text-white font-mono text-sm">
                  {log.path}
                </TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColor(log.status)}`}>
                    {log.status}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <span className={`text-sm font-medium ${log.responseTime > 500 ? 'text-red-400' : 'text-muted-foreground'}`}>
                    {log.responseTime}ms
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {/* Pagination placeholder */}
        <div className="p-4 border-t border-white/5 flex items-center justify-between text-sm text-muted-foreground">
          <span>Showing 1 to 7 of 1,245 entries</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled className="glass border-white/10">Previous</Button>
            <Button variant="outline" size="sm" className="glass border-white/10">Next</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
