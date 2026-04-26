"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, Clock, Activity, AlertTriangle, CheckCircle2, ChevronDown } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, Legend, ComposedChart, Line, PieChart, Pie, Cell
} from "recharts";
import { Button } from "@/components/ui/button";

// Mock Data
const combinedData = [
  { time: '10:00', requests: 1200, latency: 120 },
  { time: '10:05', requests: 1350, latency: 125 },
  { time: '10:10', requests: 1800, latency: 180 },
  { time: '10:15', requests: 4500, latency: 450 }, // Spike
  { time: '10:20', requests: 3800, latency: 320 },
  { time: '10:25', requests: 1500, latency: 140 },
  { time: '10:30', requests: 1400, latency: 122 },
];

const errorRateData = [
  { time: '10:00', rate: 0.1 },
  { time: '10:05', rate: 0.2 },
  { time: '10:10', rate: 0.5 },
  { time: '10:15', rate: 8.4 }, // Spike matching requests
  { time: '10:20', rate: 5.2 },
  { time: '10:25', rate: 1.1 },
  { time: '10:30', rate: 0.2 },
];

const statusCodeData = [
  { name: '200 OK', value: 85, color: '#22c55e' },
  { name: '400 Bad Request', value: 8, color: '#eab308' },
  { name: '401 Unauthorized', value: 2, color: '#f97316' },
  { name: '500 Server Error', value: 5, color: '#ef4444' },
];

const topEndpointsData = [
  { path: '/api/v1/payments', traffic: 4500, errors: 320 },
  { path: '/api/v1/auth/login', traffic: 3200, errors: 45 },
  { path: '/api/v1/users/profile', traffic: 2800, errors: 12 },
  { path: '/api/v1/products/search', traffic: 1500, errors: 8 },
];

export default function ProjectOverviewPage({ params }: { params: { projectId: string } }) {
  const pathname = usePathname();
  const [timeFilter, setTimeFilter] = useState('1h');

  // Recharts custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass p-3 rounded-lg border border-white/10 shadow-xl">
          <p className="text-sm font-medium text-white mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-muted-foreground">{entry.name}:</span>
              <span className="font-medium text-white">{entry.value}{entry.name === 'Latency' ? 'ms' : entry.name === 'Error Rate' ? '%' : ''}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild className="h-8 w-8 text-muted-foreground hover:text-white hover:bg-white/5">
            <Link href="/dashboard">
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-white">Production API</h1>
              <span className="px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                PROD
              </span>
            </div>
            <p className="text-sm text-muted-foreground">{params.projectId}</p>
          </div>
        </div>

        {/* Time Filters */}
        <div className="flex bg-background/50 p-1 rounded-lg border border-white/10 self-start md:self-auto">
          {['5m', '1h', '24h', '7d'].map((filter) => (
            <button
              key={filter}
              onClick={() => setTimeFilter(filter)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${timeFilter === filter
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-white'
                }`}
            >
              {filter === '5m' ? 'Last 5m' : filter === '1h' ? 'Last 1h' : filter === '24h' ? 'Last 24h' : 'Last 7d'}
            </button>
          ))}
        </div>
      </div>

      {/* Sub Navigation */}
      <div className="border-b border-white/10 mb-6">
        <nav className="flex gap-6">
          <Link href={`/dashboard/${params.projectId}`} className="border-b-2 border-primary py-3 text-sm font-medium text-primary">
            Overview
          </Link>
          <Link href={`/dashboard/${params.projectId}/endpoints`} className="border-b-2 border-transparent py-3 text-sm font-medium text-muted-foreground hover:text-white transition-colors">
            Endpoints
          </Link>
          <Link href={`/dashboard/${params.projectId}/logs`} className="border-b-2 border-transparent py-3 text-sm font-medium text-muted-foreground hover:text-white transition-colors">
            Logs
          </Link>
          <Link href={`/dashboard/${params.projectId}/settings`} className="border-b-2 border-transparent py-3 text-sm font-medium text-muted-foreground hover:text-white transition-colors">
            Settings
          </Link>
        </nav>
      </div>

      {/* Top Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'Total Requests', value: '1.2M', trend: '+12%', icon: Activity, color: 'text-blue-400', bg: 'bg-blue-400/10' },
          { title: 'Error Rate', value: '2.4%', trend: '+0.8%', trendBad: true, icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-400/10' },
          { title: 'Avg Response Time', value: '142ms', trend: '-15ms', icon: Clock, color: 'text-primary', bg: 'bg-primary/10' },
          { title: 'Success Rate', value: '97.6%', trend: '-0.8%', trendBad: true, icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-400/10' },
        ].map((stat, i) => (
          <div key={i} className="glass p-5 rounded-xl border border-white/5 relative overflow-hidden group">
            <div className="flex justify-between items-start mb-2">
              <span className="text-sm font-medium text-muted-foreground">{stat.title}</span>
              <div className={`p-2 rounded-lg ${stat.bg}`}>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-white">{stat.value}</span>
              <span className={`text-xs font-medium ${stat.trendBad ? 'text-red-400' : 'text-green-400'}`}>
                {stat.trend}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Combined Chart (Requests & Latency) */}
      <div className="glass p-6 rounded-xl border border-white/5">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-white">Traffic & Latency</h2>
          <p className="text-sm text-muted-foreground">Request volume compared to average response time</p>
        </div>
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={combinedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
              <XAxis dataKey="time" stroke="#ffffff50" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis yAxisId="left" stroke="#ffffff50" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v / 1000}k`} />
              <YAxis yAxisId="right" orientation="right" stroke="#ffffff50" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}ms`} />
              <RechartsTooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Bar yAxisId="left" dataKey="requests" name="Request Volume" fill="var(--primary)" radius={[4, 4, 0, 0]} barSize={30} fillOpacity={0.6} />
              <Line yAxisId="right" type="monotone" dataKey="latency" name="Latency" stroke="#60a5fa" strokeWidth={3} dot={{ r: 4, fill: '#60a5fa', strokeWidth: 0 }} activeDot={{ r: 6 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Secondary Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Error Rate Chart */}
        <div className="glass p-6 rounded-xl border border-white/5">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-white">Error Rate</h2>
            <p className="text-sm text-muted-foreground">% of failed requests over time</p>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={errorRateData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="time" stroke="#ffffff50" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#ffffff50" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
                <RechartsTooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="rate" name="Error Rate" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorRate)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Code Distribution & Top Endpoints */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Status Codes */}
          <div className="glass p-6 rounded-xl border border-white/5 flex flex-col">
            <div className="mb-2">
              <h2 className="text-sm font-semibold text-white">Status Codes</h2>
            </div>
            <div className="flex-1 min-h-[180px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusCodeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {statusCodeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              {/* Custom Legend */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl font-bold text-white">97%</span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Success</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {statusCodeData.map((status, i) => (
                <div key={i} className="flex items-center gap-1.5 text-xs">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: status.color }} />
                  <span className="text-muted-foreground truncate">{status.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Failing Endpoints */}
          <div className="glass p-6 rounded-xl border border-white/5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white">Top Endpoints</h2>
              <Button variant="ghost" size="sm" className="h-6 text-[10px] text-muted-foreground px-2 hover:text-white">
                View All
              </Button>
            </div>
            <div className="space-y-4">
              {topEndpointsData.slice(0, 4).map((endpoint, i) => (
                <div key={i} className="flex flex-col gap-1">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-white truncate pr-2" title={endpoint.path}>{endpoint.path}</span>
                    <span className="text-muted-foreground font-medium">{endpoint.traffic}</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden flex">
                    <div
                      className="h-full bg-primary"
                      style={{ width: `${(endpoint.traffic / 5000) * 100}%` }}
                    />
                    <div
                      className="h-full bg-red-500"
                      style={{ width: `${(endpoint.errors / endpoint.traffic) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
