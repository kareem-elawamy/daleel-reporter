import { useQuery } from "@tanstack/react-query";
import { axiosClient } from "@/lib/api/axiosClient";
import type { SectionDto } from "@/types/api";

export const sectionKeys = {
  all: ["sections"] as const,
  lists: () => [...sectionKeys.all, "list"] as const,
};

export const useSectionsQuery = (includeInactive = false) => {
  return useQuery({
    queryKey: [...sectionKeys.lists(), { includeInactive }],
    queryFn: async (): Promise<SectionDto[]> => {
      const response = await axiosClient.get<SectionDto[]>("/sections", {
        params: { includeInactive }
      });
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  });
};
