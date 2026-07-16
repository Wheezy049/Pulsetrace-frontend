import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";

export function useEndpoints(projectId: string) {
  const queryClient = useQueryClient();

  const endpointsQuery = useQuery({
    queryKey: ["endpoints", projectId],
    queryFn: () => api.getEndpoints(projectId),
    enabled: !!projectId,
  });

  const createEndpointMutation = useMutation({
    mutationFn: ({ name, method, path }: { name: string; method: string; path: string }) =>
      api.createEndpoint(projectId, name, method, path),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["endpoints", projectId] });
      queryClient.invalidateQueries({ queryKey: ["projectStats", projectId] });
    },
  });

  const deleteEndpointMutation = useMutation({
    mutationFn: (endpointId: string) => api.deleteEndpoint(projectId, endpointId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["endpoints", projectId] });
      queryClient.invalidateQueries({ queryKey: ["projectStats", projectId] });
    },
  });

  return {
    endpoints: endpointsQuery.data || [],
    isLoadingEndpoints: endpointsQuery.isLoading,
    endpointsError: endpointsQuery.error,

    createEndpoint: createEndpointMutation.mutate,
    createEndpointAsync: createEndpointMutation.mutateAsync,
    isCreatingEndpoint: createEndpointMutation.isPending,
    createEndpointError: createEndpointMutation.error,

    deleteEndpoint: deleteEndpointMutation.mutate,
    deleteEndpointAsync: deleteEndpointMutation.mutateAsync,
    isDeletingEndpoint: deleteEndpointMutation.isPending,
    deleteEndpointError: deleteEndpointMutation.error,
  };
}