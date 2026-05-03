import { axiosClient } from "@/lib/api/axiosClient";
import type { 
  ArticleListDto, 
  ArticleDetailDto, 
  CreateArticleRequest, 
  UpdateArticleRequest, 
  ArticleAdminDto,
  PagedResult 
} from "@/types/api";

export class ArticleService {
  /**
   * Fetch published articles (paginated).
   * Note: Returning a PagedResult containing ArticleListDto
   */
  static async getPublishedArticles(page = 1, pageSize = 20): Promise<PagedResult<ArticleListDto>> {
    const response = await axiosClient.get<PagedResult<ArticleListDto>>("/articles", {
      params: { page, pageSize }
    });
    return response.data;
  }

  /**
   * Get a single published article by its slug
   */
  static async getArticleBySlug(slug: string): Promise<ArticleDetailDto> {
    const response = await axiosClient.get<ArticleDetailDto>(`/articles/${slug}`);
    return response.data;
  }

  /**
   * Create a new article (Editor+ role required)
   */
  static async createArticle(data: CreateArticleRequest): Promise<ArticleAdminDto> {
    const response = await axiosClient.post<ArticleAdminDto>("/articles", data);
    return response.data;
  }

  /**
   * Update an existing article (Editor+ role required)
   */
  static async updateArticle(id: string, data: UpdateArticleRequest): Promise<ArticleAdminDto> {
    const response = await axiosClient.put<ArticleAdminDto>(`/articles/${id}`, data);
    return response.data;
  }

  /**
   * Fetch all articles for admin view (paginated)
   */
  static async getAdminArticles(page = 1, pageSize = 100): Promise<PagedResult<ArticleAdminDto>> {
    const response = await axiosClient.get<PagedResult<ArticleAdminDto>>("/articles/admin", {
      params: { page, pageSize }
    });
    return response.data;
  }

  /**
   * Delete an article
   */
  static async deleteArticle(id: string): Promise<void> {
    await axiosClient.delete(`/articles/${id}`);
  }
}
