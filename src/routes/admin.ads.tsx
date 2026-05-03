import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BarChart, DollarSign, Activity, Globe, Loader2, ExternalLink } from "lucide-react";
import { axiosClient } from "@/lib/api/axiosClient";

export const Route = createFileRoute("/admin/ads")({
  component: AdminAds,
});

interface AdCreative {
  id: string;
  advertiserName?: string;
  imageUrl?: string;
  clickUrl?: string;
  impressions: number;
  clicks: number;
  scheduleStart: string;
  scheduleEnd: string;
  isFallback: boolean;
}

interface AdZone {
  id: string;
  name: string;
  placementKey: string;
  isActive: boolean;
  activeCreatives: AdCreative[];
}

interface AnalyticsDashboard {
  totalPublishedToday: number;
  totalInReview: number;
  topArticles: { id: string; titleEn?: string; viewCount: number; shareCount: number }[];
  avgWorkflowHours: number;
}

function StatCard({ label, value, icon: Icon, accent }: { label: string; value: string | number; icon: any; accent: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
        <Icon className={`h-4 w-4 ${accent}`} />
      </div>
      <div className="mt-2 text-3xl font-extrabold">{value}</div>
    </div>
  );
}

function AdminAds() {
  const [zones, setZones] = useState<AdZone[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      axiosClient.get<AdZone[]>("/ads/zones").then(r => r.data).catch(() => []),
      axiosClient.get<AnalyticsDashboard>("/analytics/dashboard").then(r => r.data).catch(() => null),
    ])
      .then(([z, a]) => {
        setZones(z ?? []);
        setAnalytics(a);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Failed to load ads data");
        setLoading(false);
      });
  }, []);

  const totalCreatives = zones.reduce((n, z) => n + z.activeCreatives.length, 0);
  const totalImpressions = zones.reduce((n, z) => n + z.activeCreatives.reduce((s, c) => s + c.impressions, 0), 0);
  const totalClicks = zones.reduce((n, z) => n + z.activeCreatives.reduce((s, c) => s + c.clicks, 0), 0);
  const ctr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) + "%" : "0%";

  return (
    <div className="animate-fade-up">
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight">Ads &amp; Analytics</h1>
        <p className="text-sm text-muted-foreground">Manage advertising campaigns and view portal analytics.</p>
      </header>

      {error && <div className="mb-6 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

      {loading ? (
        <div className="flex items-center justify-center p-16 text-muted-foreground gap-2">
          <Loader2 className="h-5 w-5 animate-spin" /> Loading…
        </div>
      ) : (
        <>
          {/* KPI row */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            <StatCard label="Active Ad Zones" value={zones.filter(z => z.isActive).length} icon={Globe} accent="text-primary" />
            <StatCard label="Active Creatives" value={totalCreatives} icon={Activity} accent="text-emerald-500" />
            <StatCard label="Total Impressions" value={totalImpressions.toLocaleString()} icon={BarChart} accent="text-amber-500" />
            <StatCard label="Click-through Rate" value={ctr} icon={DollarSign} accent="text-blue-500" />
          </div>

          {analytics && (
            <div className="grid gap-4 sm:grid-cols-2 mb-8">
              <StatCard label="Articles Published Today" value={analytics.totalPublishedToday} icon={BarChart} accent="text-emerald-500" />
              <StatCard label="Avg Workflow Time (hrs)" value={analytics.avgWorkflowHours.toFixed(1)} icon={Activity} accent="text-amber-500" />
            </div>
          )}

          {/* Ad Zones */}
          <div className="mb-8">
            <h2 className="text-lg font-bold mb-4">Ad Zones</h2>
            {zones.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground">
                No ad zones configured yet.
              </div>
            ) : (
              <div className="space-y-4">
                {zones.map((zone) => (
                  <div key={zone.id} className="rounded-xl border border-border bg-card p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <span className="font-bold">{zone.name}</span>
                        <span className="ml-2 text-xs text-muted-foreground font-mono">{zone.placementKey}</span>
                      </div>
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold uppercase ${zone.isActive ? "bg-emerald-500/15 text-emerald-600" : "bg-muted text-muted-foreground"}`}>
                        {zone.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                    {zone.activeCreatives.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No active creatives in this zone.</p>
                    ) : (
                      <table className="w-full text-sm">
                        <thead className="text-xs uppercase tracking-wider text-muted-foreground">
                          <tr>
                            <th className="text-start pb-2">Advertiser</th>
                            <th className="text-start pb-2 hidden md:table-cell">Schedule</th>
                            <th className="text-end pb-2">Impressions</th>
                            <th className="text-end pb-2">Clicks</th>
                            <th className="text-end pb-2">CTR</th>
                          </tr>
                        </thead>
                        <tbody>
                          {zone.activeCreatives.map((c) => {
                            const ctrVal = c.impressions > 0 ? ((c.clicks / c.impressions) * 100).toFixed(1) + "%" : "0%";
                            return (
                              <tr key={c.id} className="border-t border-border">
                                <td className="py-2 font-semibold">
                                  {c.clickUrl ? (
                                    <a href={c.clickUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-primary">
                                      {c.advertiserName || "Unnamed"} <ExternalLink className="h-3 w-3" />
                                    </a>
                                  ) : (c.advertiserName || "Unnamed")}
                                  {c.isFallback && <span className="ml-2 text-[10px] bg-muted rounded-full px-1.5 py-0.5 text-muted-foreground">fallback</span>}
                                </td>
                                <td className="py-2 hidden md:table-cell text-muted-foreground text-xs">
                                  {new Date(c.scheduleStart).toLocaleDateString()} — {new Date(c.scheduleEnd).toLocaleDateString()}
                                </td>
                                <td className="py-2 text-end">{c.impressions.toLocaleString()}</td>
                                <td className="py-2 text-end">{c.clicks.toLocaleString()}</td>
                                <td className="py-2 text-end text-muted-foreground">{ctrVal}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Top Articles */}
          {analytics && analytics.topArticles.length > 0 && (
            <div>
              <h2 className="text-lg font-bold mb-4">Top Articles by Views</h2>
              <div className="rounded-xl border border-border bg-card overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="text-start p-3">#</th>
                      <th className="text-start p-3">Title</th>
                      <th className="text-end p-3">Views</th>
                      <th className="text-end p-3">Shares</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.topArticles.map((a, i) => (
                      <tr key={a.id} className="border-t border-border hover:bg-accent/30">
                        <td className="p-3 text-muted-foreground font-bold">{i + 1}</td>
                        <td className="p-3 font-semibold">{a.titleEn || "Untitled"}</td>
                        <td className="p-3 text-end">{a.viewCount.toLocaleString()}</td>
                        <td className="p-3 text-end text-muted-foreground">{a.shareCount.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
