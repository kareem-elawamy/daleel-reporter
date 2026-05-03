import React, { useState } from "react";
import { usePublishedArticlesQuery } from "../../hooks/api/useArticleHooks";

export function ArticlesList() {
  const [page, setPage] = useState(1);
  const pageSize = 12;

  // React Query handles loading states, error states, and background refetching!
  const { data, isLoading, isError, error } = usePublishedArticlesQuery(page, pageSize);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-pulse text-lg text-gray-500">Loading articles...</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-md my-4">
        Error loading articles: {error?.message}
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8">Latest News</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {data?.items.map((article) => (
          <div key={article.id} className="border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col bg-white">
            {article.coverImageUrl ? (
              <img 
                src={article.coverImageUrl} 
                alt={article.title.en || article.title.ar || "Article Cover"} 
                className="w-full h-48 object-cover"
              />
            ) : (
              <div className="w-full h-48 bg-gray-100 flex items-center justify-center text-gray-400">
                No Image
              </div>
            )}
            <div className="p-5 flex flex-col flex-1">
              <h2 className="text-xl font-bold mb-3 line-clamp-2 text-gray-900">
                {article.title.en || article.title.ar}
              </h2>
              <p className="text-gray-600 line-clamp-3 mb-4 flex-1">
                {article.summary?.en || article.summary?.ar || "No summary available."}
              </p>
              <div className="mt-auto flex justify-between items-center text-sm font-medium text-gray-500 border-t pt-3">
                <span className="truncate pr-2">By {article.authorName || "Editorial Team"}</span>
                <span className="shrink-0">{article.viewCount} Views</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {data?.items.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No articles found.
        </div>
      )}

      {/* Pagination Controls */}
      <div className="mt-12 flex justify-center items-center gap-6">
        <button 
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className="px-6 py-2 border rounded-full font-medium hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
        >
          Previous
        </button>
        <span className="text-gray-600 font-medium">
          Page {data?.page || 1} of {Math.max(1, Math.ceil((data?.total || 0) / pageSize))}
        </span>
        <button 
          onClick={() => setPage((p) => p + 1)}
          disabled={!data || data.page * pageSize >= data.total}
          className="px-6 py-2 border rounded-full font-medium hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  );
}
