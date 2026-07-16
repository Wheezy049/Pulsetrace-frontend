import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";

export function useProjectStats(projectId: string) {
  return useQuery({
    queryKey: ["projectStats", projectId],
    queryFn: () => api.getProjectStats(projectId),
    enabled: !!projectId,
  });
}

export function useProjectLogs(projectId: string, page = 1, limit = 10) {
  return useQuery({
    queryKey: ["projectLogs", projectId, page, limit],
    queryFn: () => api.getProjectLogs(projectId, page, limit),
    enabled: !!projectId,
  });
}

export function useSimulateLog(projectId: string) {
  const queryClient = useQueryClient();

  const simulateMutation = useMutation({
    mutationFn: ({ apiKey, endpointId, statusCode, responseTime }: { apiKey: string; endpointId: string; statusCode: number; responseTime: number }) =>
      api.simulateLog(apiKey, endpointId, statusCode, responseTime),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projectStats", projectId] });
      queryClient.invalidateQueries({ queryKey: ["projectLogs", projectId] });
    },
  });

  return {
    simulate: simulateMutation.mutate,
    simulateAsync: simulateMutation.mutateAsync,
    isSimulating: simulateMutation.isPending,
    simulateError: simulateMutation.error,
    simulateReset: simulateMutation.reset,
    simulateSuccess: simulateMutation.isSuccess,
  };
}