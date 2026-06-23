import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";

export function useAlertRules(projectId: string) {
  const queryClient = useQueryClient();

  const rulesQuery = useQuery({
    queryKey: ["alertRules", projectId],
    queryFn: () => api.getAlertRules(projectId),
    enabled: !!projectId,
  });

  const createRuleMutation = useMutation({
    mutationFn: (data: {
      name: string;
      thresholdPercentage: number;
      windowMinutes: number;
      cooldownMinutes: number;
      minRequests: number;
    }) => api.createAlertRule(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alertRules", projectId] });
    },
  });

  const toggleRuleMutation = useMutation({
    mutationFn: ({ ruleId, active }: { ruleId: string; active?: boolean }) =>
      api.toggleAlertRule(projectId, ruleId, active),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alertRules", projectId] });
    },
  });

  const deleteRuleMutation = useMutation({
    mutationFn: (ruleId: string) => api.deleteAlertRule(projectId, ruleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alertRules", projectId] });
    },
  });

  return {
    rules: rulesQuery.data || [],
    isLoadingRules: rulesQuery.isLoading,
    rulesError: rulesQuery.error,

    createRule: createRuleMutation.mutate,
    createRuleAsync: createRuleMutation.mutateAsync,
    isCreatingRule: createRuleMutation.isPending,

    toggleRule: toggleRuleMutation.mutate,
    isTogglingRule: toggleRuleMutation.isPending,

    deleteRule: deleteRuleMutation.mutate,
    isDeletingRule: deleteRuleMutation.isPending,
  };
}