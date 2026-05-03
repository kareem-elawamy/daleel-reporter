import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArticleService } from "@/lib/api/services/ArticleService";
import type { CreateArticleRequest, UpdateArticleRequest } from "@/types/api";

// Factory pattern for query keys ensures consistent cache invalidation
export const articleKeys = {
  all: ["articles"] as const,
  lists: () => [...articleKeys.all, "list"] as const,
  list: (page: number, pageSize: number) => [...articleKeys.lists(), { page, pageSize }] as const,
  details: () => [...articleKeys.all, "detail"] as const,
  detail: (slug: string) => [...articleKeys.details(), slug] as const,
  adminLists: () => [...articleKeys.all, "adminList"] as const,
  adminList: (page: number, pageSize: number) => [...articleKeys.adminLists(), { page, pageSize }] as const,
};

export const usePublishedArticlesQuery = (page = 1, pageSize = 20) => {
  return useQuery({
    queryKey: articleKeys.list(page, pageSize),
    queryFn: () => ArticleService.getPublishedArticles(page, pageSize),
  });
};

export const useArticleBySlugQuery = (slug: string) => {
  return useQuery({
    queryKey: articleKeys.detail(slug),
    queryFn: () => ArticleService.getArticleBySlug(slug),
    enabled: !!slug, // Don't run the query until a slug is provided
  });
};

export const useCreateArticleMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateArticleRequest) => ArticleService.createArticle(data),
    onSuccess: () => {
      // Invalidate the articles list so the new article appears
      queryClient.invalidateQueries({ queryKey: articleKeys.lists() });
      queryClient.invalidateQueries({ queryKey: articleKeys.adminLists() });
    },
  });
};

export const useUpdateArticleMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateArticleRequest }) => 
      ArticleService.updateArticle(id, data),
    onSuccess: (data) => {
      // Invalidate both lists and the specific detail query
      queryClient.invalidateQueries({ queryKey: articleKeys.details() });
      queryClient.invalidateQueries({ queryKey: articleKeys.lists() });
      queryClient.invalidateQueries({ queryKey: articleKeys.adminLists() });
    },
  });
};

export const useAdminArticlesQuery = (page = 1, pageSize = 100) => {
  return useQuery({
    queryKey: articleKeys.adminList(page, pageSize),
    queryFn: () => ArticleService.getAdminArticles(page, pageSize),
  });
};

export const useDeleteArticleMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ArticleService.deleteArticle(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: articleKeys.lists() });
      queryClient.invalidateQueries({ queryKey: articleKeys.adminLists() });
    },
  });
};
