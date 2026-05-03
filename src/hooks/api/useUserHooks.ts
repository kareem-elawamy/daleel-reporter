import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { UserService } from "@/lib/api/services/UserService";
import type { UpdateProfileRequest } from "@/types/api";

export const userKeys = {
  me: ["user", "me"] as const,
};

export const useMeQuery = () => {
  return useQuery({
    queryKey: userKeys.me,
    queryFn: () => UserService.getMe(),
    // We don't want this to retry endlessly if the user gets a 401 Unauthorized
    retry: false,
  });
};

export const useUpdateProfileMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProfileRequest) => UserService.updateProfile(data),
    onSuccess: (updatedProfile) => {
      // Optimistically update the cache or invalidate to fetch the newest data
      queryClient.setQueryData(userKeys.me, updatedProfile);
      queryClient.invalidateQueries({ queryKey: userKeys.me });
    },
  });
};
