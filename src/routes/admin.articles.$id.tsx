import { createFileRoute, notFound } from "@tanstack/react-router";
import { ArticleEditor } from "@/components/admin/ArticleEditor";
import { apiClient } from "@/lib/api-client";
export const Route = createFileRoute("/admin/articles/$id")({
  loader: async ({ params }) => {
    try {
      const data = await apiClient<any>(`/articles/admin/${params.id}`);
      if (!data) throw notFound();
      return { article: data };
    } catch {
      throw notFound();
    }
  },
  component: EditPage,
  notFoundComponent: () => <div className="p-8 text-center text-muted-foreground">Article not found.</div>,
});

function EditPage() {
  const { article } = Route.useLoaderData();
  return (
    <ArticleEditor
      initial={{
        id: article.id,
        slug: article.slug,
        sectionId: article.sectionId || article.section || "",
        status: article.status || "Draft",
        titleEn: article.titleEn || "",
        titleAr: article.titleAr || "",
        titleFr: article.titleFr || "",
        summaryEn: article.summaryEn || "",
        summaryAr: article.summaryAr || "",
        summaryFr: article.summaryFr || "",
        bodyEn: article.bodyEn || "",
        bodyAr: article.bodyAr || "",
        bodyFr: article.bodyFr || "",
        coverImageUrl: article.coverImageUrl || "",
        tags: article.tags || [],
        reviewNotes: article.reviewNotes || "",
      }}
    />
  );
}
