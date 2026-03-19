"use client"

import { Trash2, Download, ExternalLink, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Empty } from "@/components/ui/empty"
import { toast } from "sonner"
import type { PDF, Category } from "@/lib/types"

interface PDFListProps {
  pdfs: PDF[]
  categories: Category[]
  loading: boolean
  onDelete: () => void
}

function formatFileSize(bytes: number | null): string {
  if (!bytes) return "Unknown"
  const sizes = ["B", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export function PDFList({ pdfs, categories, loading, onDelete }: PDFListProps) {
  async function handleDelete(id: string, title: string) {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) {
      return
    }

    try {
      const token = sessionStorage.getItem("admin_token")
      const response = await fetch(`/api/pdfs/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to delete PDF")
      }

      toast.success("PDF deleted successfully!")
      onDelete()
    } catch (error) {
      console.error("[v0] Delete PDF error:", error)
      toast.error(error instanceof Error ? error.message : "Failed to delete PDF")
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-4 p-4 rounded-lg border border-border/50">
            <Skeleton className="h-12 w-12 rounded" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="h-8 w-20" />
          </div>
        ))}
      </div>
    )
  }

  if (pdfs.length === 0) {
    return (
      <Empty
        icon={FileText}
        title="No PDFs uploaded"
        description="Upload your first PDF using the Upload tab"
      />
    )
  }

  return (
    <div className="space-y-3">
      {pdfs.map((pdf) => {
        const category = categories.find((c) => c.id === pdf.category_id)
        
        return (
          <div
            key={pdf.id}
            className="flex items-center gap-4 p-4 rounded-lg border border-border/50 bg-card hover:bg-muted/50 transition-colors"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-primary/10 to-accent/10">
              <FileText className="h-6 w-6 text-primary/60" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-medium truncate">{pdf.title}</h3>
                {category && (
                  <Badge
                    className="text-xs"
                    style={{
                      backgroundColor: category.color,
                      color: "#fff",
                    }}
                  >
                    {category.name}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span>{formatFileSize(pdf.file_size)}</span>
                <span>•</span>
                <span>{formatDate(pdf.created_at)}</span>
                <span>•</span>
                <span>{pdf.download_count} downloads</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                asChild
              >
                <a href={`/pdf/${pdf.id}`} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => handleDelete(pdf.id, pdf.title)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
