import { useMutation } from "@tanstack/react-query";
import { api } from "../lib/api";

export function useAuth() {
  const loginMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      api.login(email, password),
  });

  const registerMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      api.register(email, password),
  });

  const googleLoginMutation = useMutation({
    mutationFn: ({ idToken }: { idToken: string }) =>
      api.loginWithGoogle(idToken),
  });

  const logout = () => {
    api.logout();
  };

  return {
    login: loginMutation.mutate,
    loginAsync: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error,

    register: registerMutation.mutate,
    registerAsync: registerMutation.mutateAsync,
    isRegistering: registerMutation.isPending,
    registerError: registerMutation.error,

    googleLogin: googleLoginMutation.mutate,
    googleLoginAsync: googleLoginMutation.mutateAsync,
    isGoogleLoggingIn: googleLoginMutation.isPending,
    googleLoginError: googleLoginMutation.error,

    logout,
    currentUser: api.getCurrentUser(),
  };
}