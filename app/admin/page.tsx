"use client"

import { useEffect, useState, Suspense } from "react"
import Link from "next/link"
import dynamic from "next/dynamic"
import { ArrowLeft, Plus, Upload, FolderPlus, Trash2, FileText, LogOut, BarChart3, RefreshCw, Settings, Database, Loader2, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import type { Category, PDF } from "@/lib/types"

// Dynamic imports for heavy components
const PDFUploadForm = dynamic(() => import("@/components/admin/pdf-upload-form").then(mod => ({ default: mod.PDFUploadForm })), {
  loading: () => <ComponentLoader text="Loading uploader..." />,
})

const CategoryManager = dynamic(() => import("@/components/admin/category-manager").then(mod => ({ default: mod.CategoryManager })), {
  loading: () => <ComponentLoader text="Loading categories..." />,
})

const PDFList = dynamic(() => import("@/components/admin/pdf-list").then(mod => ({ default: mod.PDFList })), {
  loading: () => <ComponentLoader text="Loading PDFs..." />,
})

const AnalyticsDashboard = dynamic(() => import("@/components/admin/analytics-dashboard").then(mod => ({ default: mod.AnalyticsDashboard })), {
  loading: () => <ComponentLoader text="Loading analytics..." />,
})

const ReviewsManager = dynamic(() => import("@/components/admin/reviews-manager").then(mod => ({ default: mod.ReviewsManager })), {
  loading: () => <ComponentLoader text="Loading reviews..." />,
})

function ComponentLoader({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3">
      <Loader2 className="h-8 w-8 animate-spin text-primary/50" />
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  )
}

export default function AdminPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [pdfs, setPdfs] = useState<PDF[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  async function fetchData() {
    try {
      const [catsRes, pdfsRes] = await Promise.all([
        fetch("/api/categories"),
        fetch("/api/pdfs"),
      ])
      
      const catsData = await catsRes.json()
      const pdfsData = await pdfsRes.json()
      
      setCategories(catsData.categories || [])
      setPdfs(pdfsData.pdfs || [])
    } catch (error) {
      console.error("[v0] Error fetching data:", error)
      toast.error("Failed to fetch data")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  function handleRefresh() {
    setRefreshing(true)
    fetchData()
    toast.success("Data refreshed!")
  }

  function handleLogout() {
    sessionStorage.removeItem("admin_token")
    window.location.reload()
  }

  function handleUploadSuccess() {
    fetchData()
  }

  function handleCategoryChange() {
    fetchData()
  }

  function handlePDFDelete() {
    fetchData()
  }

  function handlePDFUpdate() {
    fetchData()
  }

  // Quick stats
  const totalViews = pdfs.reduce((sum, pdf) => sum + (pdf.view_count || 0), 0)
  const totalDownloads = pdfs.reduce((sum, pdf) => sum + pdf.download_count, 0)
  const totalStorage = pdfs.reduce((sum, pdf) => sum + (pdf.file_size || 0), 0)

  function formatBytes(bytes: number) {
    if (bytes === 0) return "0 B"
    const k = 1024
    const sizes = ["B", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/80">
        {/* Gradient line at top */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
        
        <div className="container mx-auto flex h-14 sm:h-16 items-center justify-between px-3 sm:px-4">
          <div className="flex items-center gap-2 sm:gap-4">
            <Link 
              href="/" 
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors group"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-muted group-hover:bg-primary/10 transition-colors">
                <ArrowLeft className="h-4 w-4" />
              </div>
              <span className="hidden sm:inline">Back to Library</span>
            </Link>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="absolute -inset-1 rounded-xl bg-gradient-to-br from-primary/30 to-accent/30 blur opacity-50" />
              <div className="relative flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg">
                <Settings className="h-5 w-5 text-primary-foreground" />
              </div>
            </div>
            <div className="hidden sm:block">
              <span className="font-bold text-base">Admin Dashboard</span>
              <p className="text-[10px] text-muted-foreground -mt-0.5">TechVyro Library</p>
            </div>
            <span className="sm:hidden font-semibold text-sm">Admin</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh}
              disabled={refreshing}
              className="px-2 sm:px-3 h-9 hover:bg-primary/5 hover:border-primary/50"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline ml-2">Refresh</span>
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLogout} 
              className="px-2 sm:px-3 h-9 hover:bg-destructive/10 hover:border-destructive/50 hover:text-destructive"
            >
              <LogOut className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-3 sm:px-4 py-6 sm:py-10">
        {/* Quick Stats Bar - Enhanced */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8">
          <Card className="group border-border/50 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Total PDFs</p>
                  <p className="text-2xl sm:text-3xl font-bold text-foreground">{pdfs.length}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 group-hover:scale-110 transition-transform duration-300">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="group border-border/50 hover:border-accent/40 hover:shadow-lg hover:shadow-accent/10 transition-all duration-300">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Categories</p>
                  <p className="text-2xl sm:text-3xl font-bold text-foreground">{categories.length}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-accent/20 to-accent/10 group-hover:scale-110 transition-transform duration-300">
                  <FolderPlus className="h-6 w-6 text-accent" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="group border-border/50 hover:border-green-500/40 hover:shadow-lg hover:shadow-green-500/10 transition-all duration-300">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Total Views</p>
                  <p className="text-2xl sm:text-3xl font-bold text-foreground">{totalViews.toLocaleString()}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-500/20 to-green-500/10 group-hover:scale-110 transition-transform duration-300">
                  <BarChart3 className="h-6 w-6 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="group border-border/50 hover:border-blue-500/40 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Storage Used</p>
                  <p className="text-2xl sm:text-3xl font-bold text-foreground">{formatBytes(totalStorage)}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-500/10 group-hover:scale-110 transition-transform duration-300">
                  <Database className="h-6 w-6 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mb-6 sm:mb-10">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Manage Library</h1>
          <p className="mt-1.5 sm:mt-2 text-sm sm:text-base text-muted-foreground">
            Upload PDFs, manage categories, view analytics, and moderate reviews
          </p>
        </div>

        <Tabs defaultValue="upload" className="space-y-5 sm:space-y-8">
          <TabsList className="flex flex-wrap h-auto gap-1.5 p-1.5 bg-muted/50 rounded-xl">
            <TabsTrigger value="upload" className="gap-1.5 sm:gap-2 text-xs sm:text-sm px-3 sm:px-4 py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg transition-all">
              <Upload className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span>Upload</span>
            </TabsTrigger>
            <TabsTrigger value="pdfs" className="gap-1.5 sm:gap-2 text-xs sm:text-sm px-3 sm:px-4 py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg transition-all">
              <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span>PDFs</span>
              <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs bg-primary/10 text-primary">
                {pdfs.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="categories" className="gap-1.5 sm:gap-2 text-xs sm:text-sm px-3 sm:px-4 py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg transition-all">
              <FolderPlus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span>Categories</span>
              <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs bg-accent/10 text-accent">
                {categories.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="reviews" className="gap-1.5 sm:gap-2 text-xs sm:text-sm px-3 sm:px-4 py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg transition-all">
              <MessageSquare className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span>Reviews</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-1.5 sm:gap-2 text-xs sm:text-sm px-3 sm:px-4 py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg transition-all">
              <BarChart3 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span>Analytics</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5 text-primary" />
                  Upload New PDFs
                </CardTitle>
                <CardDescription>
                  Add new PDF documents to your library. Supports parallel uploads up to 50MB each.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PDFUploadForm 
                  categories={categories} 
                  onSuccess={handleUploadSuccess}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pdfs">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  All PDFs
                </CardTitle>
                <CardDescription>
                  View, edit, and manage all uploaded PDFs. Use search and filters to find specific files.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PDFList 
                  pdfs={pdfs} 
                  categories={categories}
                  loading={loading}
                  onDelete={handlePDFDelete}
                  onUpdate={handlePDFUpdate}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FolderPlus className="h-5 w-5 text-primary" />
                  Categories
                </CardTitle>
                <CardDescription>
                  Create and manage document categories. Categories help organize your PDF library.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CategoryManager 
                  categories={categories}
                  onChange={handleCategoryChange}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  Manage Reviews
                </CardTitle>
                <CardDescription>
                  View, filter, and moderate user reviews. Delete inappropriate or spam reviews.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ReviewsManager pdfs={pdfs} categories={categories} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <AnalyticsDashboard pdfs={pdfs} categories={categories} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
