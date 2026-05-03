// src/types/api.ts

// ── Auth ──────────────────────────────────────────────
export interface RegisterRequest {
  email: string;
  password: string;
  displayName?: string;
  preferredLang?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RefreshRequest {
  refreshToken: string;
}

export interface ResetPasswordRequest {
  email: string;
}

export interface UpdatePasswordRequest {
  token: string;
  newPassword: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt: string; // ISO DateTime
  user: UserProfileDto;
}

// ── User / Profile ────────────────────────────────────
export interface UserProfileDto {
  id: string;
  email: string;
  displayName?: string;
  avatarUrl?: string;
  bio?: string;
  preferredLang: string;
  roles: string[];
  createdAt: string;
}

export interface UpdateProfileRequest {
  displayName?: string;
  avatarUrl?: string;
  bio?: string;
  preferredLang?: string;
}

export interface UserListDto {
  userId: string;
  email: string;
  displayName?: string;
  createdAt: string;
  roles: string[];
}

export interface GrantRoleRequest {
  role: string;
}

// ── Article ───────────────────────────────────────────
export interface ArticleListDto {
  id: string;
  slug: string;
  sectionId: string;
  status: string;
  title: Record<string, string>;
  summary: Record<string, string>;
  coverImageUrl?: string;
  tags: string[];
  authorId?: string;
  authorName?: string;
  publishedAt?: string;
  updatedAt: string;
  viewCount: number;
}

export interface ArticleDetailDto {
  id: string;
  slug: string;
  sectionId: string;
  sectionNameEn?: string;
  sectionNameAr?: string;
  status: string;
  title: Record<string, string>;
  subHeadline: Record<string, string>;
  summary: Record<string, string>;
  body: Record<string, string>;
  seoTitle: Record<string, string>;
  seoDescription: Record<string, string>;
  coverImageUrl?: string;
  tags: string[];
  authorId?: string;
  authorDisplayName?: string;
  authorAvatarUrl?: string;
  publishedAt?: string;
  scheduledAt?: string;
  createdAt: string;
  updatedAt: string;
  viewCount: number;
  shareCount: number;
  isBreakingNews: boolean;
  reviewNotes?: string;
  recentWorkflow?: WorkflowEventDto[];
}

export interface ArticleAdminDto {
  id: string;
  slug: string;
  sectionId: string;
  status: string;
  title: Record<string, string>;
  publishedAt?: string;
  submittedAt?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewNotes?: string;
  authorId?: string;
  authorName?: string;
  updatedAt: string;
}

export interface CreateArticleRequest {
  slug?: string;
  sectionId: string;
  title: Record<string, string>;
  subHeadline: Record<string, string>;
  summary: Record<string, string>;
  body: Record<string, string>;
  seoTitle: Record<string, string>;
  seoDescription: Record<string, string>;
  coverImageUrl?: string;
  tags?: string[];
  isBreakingNews?: boolean;
}

export interface UpdateArticleRequest {
  slug?: string;
  sectionId?: string;
  title?: Record<string, string>;
  subHeadline?: Record<string, string>;
  summary?: Record<string, string>;
  body?: Record<string, string>;
  seoTitle?: Record<string, string>;
  seoDescription?: Record<string, string>;
  coverImageUrl?: string;
  tags?: string[];
  scheduledAt?: string;
  isBreakingNews?: boolean;
  reviewNotes?: string;
}

export interface WorkflowActionRequest {
  note?: string;
}

// ── Sections ──────────────────────────────────────────
export interface SectionDto {
  id: string;
  name: Record<string, string>;
  slug: string;
  parentSectionId?: string;
  isActive: boolean;
  sortOrder: number;
}

export interface CreateSectionRequest {
  slug: string;
  name: Record<string, string>;
  parentSectionId?: string;
  sortOrder?: number;
}

// ── Media ─────────────────────────────────────────────
export interface MediaAssetDto {
  id: string;
  filename: string;
  type: string;
  cdnUrl: string;
  thumbnailSmUrl?: string;
  thumbnailMdUrl?: string;
  thumbnailLgUrl?: string;
  sizeBytes: number;
  uploaderId?: string;
  uploaderName?: string;
  tags?: string;
  hasWatermark: boolean;
  uploadedAt: string;
}

// ── Search ────────────────────────────────────────────
export interface SearchRequest {
  q?: string;
  section?: string;
  from?: string;
  to?: string;
  type?: string;
  sort?: string;
  page?: number;
  pageSize?: number;
}

export interface SearchResultDto {
  total: number;
  page: number;
  pageSize: number;
  results: ArticleListDto[];
}

// ── Bookmarks ─────────────────────────────────────────
export interface BookmarkDto {
  id: string;
  articleId: string;
  title?: Record<string, string>;
  coverImageUrl?: string;
  createdAt: string;
}

export interface AddBookmarkRequest {
  articleId: string;
}

// ── Live Timeline ─────────────────────────────────────
export interface LiveTimelineDto {
  id: string;
  title: Record<string, string>;
  slug: string;
  isActive: boolean;
  updatedAt: string;
  updates: LiveUpdateDto[];
}

export interface LiveUpdateDto {
  id: string;
  content: Record<string, string>;
  type: string;
  isPinned: boolean;
  mediaUrl?: string;
  createdAt: string;
}

export interface CreateLiveTimelineRequest {
  title: Record<string, string>;
  slug: string;
}

export interface AddLiveUpdateRequest {
  content: Record<string, string>;
  type?: string;
  mediaId?: string;
  isPinned?: boolean;
}

// ── Trends ────────────────────────────────────────────
export interface TrendClusterDto {
  id: string;
  title: Record<string, string>;
  slug: string;
  summary?: Record<string, string>;
  keyFacts?: Record<string, string>;
  isActive: boolean;
  articles: ArticleListDto[];
}

export interface CreateTrendClusterRequest {
  title: Record<string, string>;
  slug: string;
  summary?: Record<string, string>;
  keyFacts?: Record<string, string>;
  tagSlugs?: string;
}

export interface AddTrendArticleRequest {
  articleId: string;
  sortOrder?: number;
}

// ── Supplements ───────────────────────────────────────
export interface SupplementDto {
  id: string;
  name: Record<string, string>;
  slug: string;
  themeColor?: string;
  bannerUrl?: string;
  isActive: boolean;
}

export interface CreateSupplementRequest {
  name: Record<string, string>;
  slug: string;
  themeColor?: string;
  logoUrl?: string;
  bannerUrl?: string;
  description?: Record<string, string>;
  startsAt?: string;
  endsAt?: string;
}

// ── Ads ───────────────────────────────────────────────
export interface AdZoneDto {
  id: string;
  name: string;
  placementKey: string;
  isActive: boolean;
  activeCreatives: AdCreativeDto[];
}

export interface AdCreativeDto {
  id: string;
  adZoneId: string;
  imageUrl?: string;
  clickUrl?: string;
  advertiserName?: string;
  scheduleStart: string;
  scheduleEnd: string;
  impressions: number;
  clicks: number;
  isFallback: boolean;
}

export interface CreateAdZoneRequest {
  name: string;
  placementKey: string;
  description?: string;
}

export interface CreateAdCreativeRequest {
  adZoneId: string;
  imageUrl?: string;
  htmlContent?: string;
  clickUrl?: string;
  advertiserName?: string;
  scheduleStart: string;
  scheduleEnd: string;
  isFallback?: boolean;
}

export interface RecordAdImpressionRequest {
  creativeId: string;
}

export interface RecordAdClickRequest {
  creativeId: string;
}

// ── Analytics ─────────────────────────────────────────
export interface AnalyticsDashboardDto {
  totalPublishedToday: number;
  totalInReview: number;
  publishedBySection: Record<string, number>;
  publishedByAuthor: Record<string, number>;
  topArticles: TopArticleDto[];
  avgWorkflowHours: number;
}

export interface TopArticleDto {
  id: string;
  title: Record<string, string>;
  viewCount: number;
  shareCount: number;
  publishedAt?: string;
}

// ── Newsletter ────────────────────────────────────────
export interface SubscribeNewsletterRequest {
  email: string;
  preferredLang?: string;
}

// ── Workflow ──────────────────────────────────────────
export interface WorkflowEventDto {
  id: string;
  fromStatus: string;
  toStatus: string;
  actorName?: string;
  timestamp: string;
  note?: string;
}

// ── Revision / Audit ──────────────────────────────────
export interface RevisionDto {
  id: string;
  articleId: string;
  actorName?: string;
  timestamp: string;
  action: string;
  changedFields?: string;
  snapshotTitle?: Record<string, string>;
}

// ── Paged result ──────────────────────────────────────
export interface PagedResult<T> {
  total: number;
  page: number;
  pageSize: number;
  items: T[];
}
