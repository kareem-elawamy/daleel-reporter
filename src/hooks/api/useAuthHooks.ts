import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AuthService } from "@/lib/api/services/AuthService";
import type { LoginRequest, RegisterRequest } from "@/types/api";

export const useLoginMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: LoginRequest) => AuthService.login(data),
    onSuccess: () => {
      // Invalidate user queries to fetch fresh session state
      queryClient.invalidateQueries({ queryKey: ["user", "me"] });
    },
  });
};

export const useRegisterMutation = () => {
  return useMutation({
    mutationFn: (data: RegisterRequest) => AuthService.register(data),
  });
};

export const useLogoutMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => AuthService.logout(),
    onSuccess: () => {
      // Clear the query cache entirely on logout to ensure no sensitive data is left
      queryClient.clear();
    },
  });
};
