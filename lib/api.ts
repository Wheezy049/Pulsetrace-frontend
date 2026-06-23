const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

// Helper to retrieve auth header
function getAuthHeader(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// General fetch wrapper
async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = {
    "Content-Type": "application/json",
    ...getAuthHeader(),
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  let data;
  try {
    data = await response.json();
  } catch (e) {
    data = null;
  }

  if (!response.ok) {
    const errorMsg = data?.message || response.statusText || "Request failed";
    throw new ApiError(errorMsg, response.status);
  }

  return data as T;
}

export interface User {
  id: string;
  email: string;
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  apiKeys?: { key: string }[];
}

export interface Endpoint {
  id: string;
  name: string;
  path: string;
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  createdAt: string;
}

export interface ApiLog {
  id: string;
  statusCode: number;
  responseTime: number;
  timestamp: string;
  endpoint: {
    name: string;
    path: string;
    method: string;
  };
}

export interface ChartItem {
  date: string;
  total: number;
  failed: number;
  successful: number;
}

export interface EndpointStat {
  id: string;
  name: string;
  path: string;
  method: string;
  totalRequests: number;
  failedRequests: number;
  successRate: number;
  avgResponseTime: number;
}

export interface AlertRule {
  id: string;
  name: string;
  thresholdPercentage: number;
  windowMinutes: number;
  cooldownMinutes: number;
  minRequests: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  projectId: string;
}

export interface ProjectStats {
  totalRequests: number;
  failedRequests: number;
  successRate: number;
  chartData: ChartItem[];
  endpointStats: EndpointStat[];
}

export interface PaginatedLogs {
  logs: ApiLog[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const api = {
  // Authentication
  login: async (email: string, password: string) => {
    const res = await request<{ message: string; token: string; user: User }>(
      "/auth/login",
      {
        method: "POST",
        body: JSON.stringify({ email, password }),
      }
    );
    // Store in local storage on success
    if (res.token) {
      localStorage.setItem("token", res.token);
      localStorage.setItem("user", JSON.stringify(res.user));
    }
    return res;
  },

  register: async (email: string, password: string) => {
    const res = await request<{ message: string; token: string; user: User }>(
      "/auth/register",
      {
        method: "POST",
        body: JSON.stringify({ email, password }),
      }
    );
    // Store in local storage on success
    if (res.token) {
      localStorage.setItem("token", res.token);
      localStorage.setItem("user", JSON.stringify(res.user));
    }
    return res;
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },

  getCurrentUser: (): User | null => {
    if (typeof window === "undefined") return null;
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },

  // Projects
  getProjects: async () => {
    const res = await request<{ message: string; projects: Project[] }>("/projects");
    return res.projects;
  },

  getProject: async (projectId: string) => {
    const res = await request<{ message: string; project: Project }>(
      `/projects/${projectId}`
    );
    return res.project;
  },

  createProject: async (name: string, description?: string) => {
    return request<{ message: string; project: Project; apiKey: string }>("/projects", {
      method: "POST",
      body: JSON.stringify({ name, description }),
    });
  },

  deleteProject: async (projectId: string) => {
    return request<{ message: string; project: Project }>(`/projects/${projectId}`, {
      method: "DELETE",
    });
  },

  // Stats
  getProjectStats: async (projectId: string) => {
    const res = await request<{ message: string; stats: ProjectStats }>(
      `/projects/${projectId}/stats`
    );
    return res.stats;
  },

  // Logs
  getProjectLogs: async (projectId: string, page = 1, limit = 10) => {
    const res = await request<{ message: string; data: PaginatedLogs }>(
      `/projects/${projectId}/logs?page=${page}&limit=${limit}`
    );
    return res.data;
  },

  // Endpoints
  getEndpoints: async (projectId: string) => {
    const res = await request<{ message: string; endpoints: Endpoint[] }>(
      `/projects/${projectId}/endpoints`
    );
    return res.endpoints;
  },

  createEndpoint: async (
    projectId: string,
    name: string,
    method: string,
    path: string
  ) => {
    return request<{ message: string; endpoint: Endpoint }>(
      `/projects/${projectId}/endpoints`,
      {
        method: "POST",
        body: JSON.stringify({ name, method, path }),
      }
    );
  },

  deleteEndpoint: async (projectId: string, endpointId: string) => {
    return request<{ message: string; endpoint: Endpoint }>(
      `/projects/${projectId}/endpoints/${endpointId}`,
      {
        method: "DELETE",
      }
    );
  },

  // Alerts
  getAlertRules: async (projectId: string) => {
    const res = await request<{ message: string; alertRules: AlertRule[] }>(
      `/projects/${projectId}/alerts`
    );
    return res.alertRules;
  },

  createAlertRule: async (
    projectId: string,
    data: {
      name: string;
      thresholdPercentage: number;
      windowMinutes: number;
      cooldownMinutes: number;
      minRequests: number;
    }
  ) => {
    return request<{ message: string; alertRule: AlertRule }>(
      `/projects/${projectId}/alerts`,
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
  },

  toggleAlertRule: async (projectId: string, ruleId: string, active?: boolean) => {
    return request<{ message: string; alertRule: AlertRule }>(
      `/projects/${projectId}/alerts/${ruleId}`,
      {
        method: "PATCH",
        body: JSON.stringify({ active }),
      }
    );
  },

  deleteAlertRule: async (projectId: string, ruleId: string) => {
    return request<{ message: string }>(
      `/projects/${projectId}/alerts/${ruleId}`,
      {
        method: "DELETE",
      }
    );
  },

  // Log Simulation
  simulateLog: async (
    apiKey: string,
    endpointId: string,
    statusCode: number,
    responseTime: number
  ) => {
    return fetch(`${BASE_URL}/logs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ endpointId, statusCode, responseTime }),
    }).then(async (res) => {
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to record simulated log");
      }
      return data;
    });
  },
};