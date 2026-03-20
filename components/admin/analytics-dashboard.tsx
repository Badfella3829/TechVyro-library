"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Eye, Download, FileText, Star, TrendingUp, Users, HardDrive, Zap, ArrowUp, ArrowDown, Calendar } from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
  Legend,
} from "recharts"
import type { PDF, Category } from "@/lib/types"

interface AnalyticsDashboardProps {
  pdfs: PDF[]
  categories: Category[]
}

export function AnalyticsDashboard({ pdfs, categories }: AnalyticsDashboardProps) {
  const stats = useMemo(() => {
    const totalViews = pdfs.reduce((sum, pdf) => sum + (pdf.view_count || 0), 0)
    const totalDownloads = pdfs.reduce((sum, pdf) => sum + pdf.download_count, 0)
    const totalReviews = pdfs.reduce((sum, pdf) => sum + (pdf.review_count || 0), 0)
    const totalStorage = pdfs.reduce((sum, pdf) => sum + (pdf.file_size || 0), 0)
    const avgRating = pdfs.filter(p => p.average_rating).length > 0
      ? pdfs.filter(p => p.average_rating).reduce((sum, pdf) => sum + (pdf.average_rating || 0), 0) / pdfs.filter(p => p.average_rating).length
      : 0
    
    // Engagement rate (downloads / views)
    const engagementRate = totalViews > 0 ? ((totalDownloads / totalViews) * 100).toFixed(1) : "0"

    return { totalViews, totalDownloads, totalReviews, avgRating, totalStorage, engagementRate }
  }, [pdfs])
  
  // Format bytes
  function formatBytes(bytes: number) {
    if (bytes === 0) return "0 B"
    const k = 1024
    const sizes = ["B", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`
  }

  const topPdfs = useMemo(() => {
    return [...pdfs]
      .sort((a, b) => (b.view_count || 0) - (a.view_count || 0))
      .slice(0, 5)
      .map(pdf => ({
        name: pdf.title.length > 20 ? pdf.title.slice(0, 20) + "..." : pdf.title,
        views: pdf.view_count || 0,
        downloads: pdf.download_count,
      }))
  }, [pdfs])

  const categoryData = useMemo(() => {
    const categoryMap = new Map<string, { name: string; count: number; color: string }>()
    
    categories.forEach(cat => {
      categoryMap.set(cat.id, { name: cat.name, count: 0, color: cat.color })
    })
    
    pdfs.forEach(pdf => {
      if (pdf.category_id && categoryMap.has(pdf.category_id)) {
        const cat = categoryMap.get(pdf.category_id)!
        cat.count++
      }
    })

    return Array.from(categoryMap.values()).filter(c => c.count > 0)
  }, [pdfs, categories])

  const chartColors = {
    primary: "#7c3aed",
    secondary: "#06b6d4",
    accent: "#f59e0b",
  }

  return (
    <div className="space-y-8">
      {/* Stats Cards - Enhanced */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <Card className="group border-border/50 hover:border-green-500/40 hover:shadow-lg hover:shadow-green-500/10 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Views</CardTitle>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-500/10 group-hover:scale-110 transition-transform">
              <Eye className="h-4 w-4 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold">{stats.totalViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Across all PDFs
            </p>
          </CardContent>
        </Card>

        <Card className="group border-border/50 hover:border-blue-500/40 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Downloads</CardTitle>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 group-hover:scale-110 transition-transform">
              <Download className="h-4 w-4 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold">{stats.totalDownloads.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              All time downloads
            </p>
          </CardContent>
        </Card>

        <Card className="group border-border/50 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total PDFs</CardTitle>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 group-hover:scale-110 transition-transform">
              <FileText className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold">{pdfs.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              In library
            </p>
          </CardContent>
        </Card>

        <Card className="group border-border/50 hover:border-amber-500/40 hover:shadow-lg hover:shadow-amber-500/10 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Rating</CardTitle>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 group-hover:scale-110 transition-transform">
              <Star className="h-4 w-4 text-amber-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold">
              {stats.avgRating > 0 ? stats.avgRating.toFixed(1) : "N/A"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.totalReviews} reviews
            </p>
          </CardContent>
        </Card>

        <Card className="group border-border/50 hover:border-accent/40 hover:shadow-lg hover:shadow-accent/10 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Engagement</CardTitle>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/10 group-hover:scale-110 transition-transform">
              <Zap className="h-4 w-4 text-accent" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold">{stats.engagementRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              Download rate
            </p>
          </CardContent>
        </Card>

        <Card className="group border-border/50 hover:border-purple-500/40 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Storage</CardTitle>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/10 group-hover:scale-110 transition-transform">
              <HardDrive className="h-4 w-4 text-purple-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold">{formatBytes(stats.totalStorage)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Total used
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts - Enhanced */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Top PDFs Chart */}
        <Card className="border-border/50 hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                    <TrendingUp className="h-4 w-4 text-primary" />
                  </div>
                  Top PDFs by Views
                </CardTitle>
                <CardDescription className="mt-1.5">Most viewed documents in your library</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {topPdfs.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topPdfs} layout="vertical">
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "12px",
                      boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Bar dataKey="views" fill={chartColors.primary} radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex flex-col items-center justify-center text-muted-foreground gap-2">
                <FileText className="h-10 w-10 opacity-30" />
                <p>No data available</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card className="border-border/50 hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
                    <Users className="h-4 w-4 text-accent" />
                  </div>
                  PDFs by Category
                </CardTitle>
                <CardDescription className="mt-1.5">Distribution of documents across categories</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    dataKey="count"
                    nameKey="name"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    labelLine={false}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "12px",
                      boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex flex-col items-center justify-center text-muted-foreground gap-2">
                <Users className="h-10 w-10 opacity-30" />
                <p>No categories with PDFs</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Downloads Table - Enhanced */}
      <Card className="border-border/50 hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10">
                  <Download className="h-4 w-4 text-blue-500" />
                </div>
                Most Downloaded PDFs
              </CardTitle>
              <CardDescription className="mt-1.5">Top performing documents by download count</CardDescription>
            </div>
            <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/30">
              Top 5
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {pdfs.length > 0 ? (
              [...pdfs]
                .sort((a, b) => b.download_count - a.download_count)
                .slice(0, 5)
                .map((pdf, index) => {
                  const category = categories.find(c => c.id === pdf.category_id)
                  return (
                    <div 
                      key={pdf.id} 
                      className="flex items-center justify-between p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors border border-transparent hover:border-border/50"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-xl font-bold text-lg ${
                          index === 0 ? "bg-amber-500/20 text-amber-600" :
                          index === 1 ? "bg-slate-400/20 text-slate-500" :
                          index === 2 ? "bg-orange-600/20 text-orange-600" :
                          "bg-muted text-muted-foreground"
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{pdf.title}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              {(pdf.view_count || 0).toLocaleString()} views
                            </span>
                            {category && (
                              <Badge 
                                variant="outline" 
                                className="text-[10px] h-4 px-1.5"
                                style={{ backgroundColor: category.color + "20", color: category.color, borderColor: category.color + "40" }}
                              >
                                {category.name}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-xl text-primary">{pdf.download_count.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">downloads</p>
                      </div>
                    </div>
                  )
                })
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto opacity-30 mb-3" />
                <p>No PDFs uploaded yet</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
