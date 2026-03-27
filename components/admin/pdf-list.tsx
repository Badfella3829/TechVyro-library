"use client"

import { useState, useMemo, useEffect, useRef, useCallback } from "react"
import { Trash2, ExternalLink, FileText, Pencil, Check, X, Eye, Loader2, Search, Filter, Download, FolderInput, FileDown, MoreHorizontal, UploadCloud, Globe, Lock, EyeOff, Tag, AlignLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Empty } from "@/components/ui/empty"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import type { PDF, Category } from "@/lib/types"

interface PDFListProps {
  pdfs: PDF[]
  categories: Category[]
  loading: boolean
  onDelete: () => void
  onUpdate: () => void
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

interface EditState {
  title: string
  category_id: string
  description: string
  tags: string
  visibility: string
  allow_download: boolean
}

export function PDFList({ pdfs: initialPdfs, categories, loading: initialLoading, onDelete, onUpdate }: PDFListProps) {
  const [internalPdfs, setInternalPdfs] = useState<PDF[]>(initialPdfs)
  const [internalLoading, setInternalLoading] = useState(initialLoading)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editState, setEditState] = useState<EditState>({ title: "", category_id: "" })
  const [saving, setSaving] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [bulkDeleting, setBulkDeleting] = useState(false)
  const [bulkMoving, setBulkMoving] = useState(false)
  const [replacingId, setReplacingId] = useState<string | null>(null)
  const replaceFileInputRef = useRef<HTMLInputElement>(null)
  const replaceTargetIdRef = useRef<string | null>(null)

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("")
  const [filterCategory, setFilterCategory] = useState<string>("all")
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "name" | "downloads" | "views">("newest")

  // ── Self-fetch PDFs with auto-refresh ──────────────────────────────
  const refreshPdfs = useCallback(async () => {
    try {
      const res = await fetch("/api/pdfs")
      if (!res.ok) return
      const data = await res.json()
      setInternalPdfs(data.pdfs || [])
    } catch {}
  }, [])

  useEffect(() => {
    let mounted = true
    async function initialFetch() {
      setInternalLoading(true)
      try {
        const res = await fetch("/api/pdfs")
        if (!res.ok) return
        const data = await res.json()
        if (mounted) setInternalPdfs(data.pdfs || [])
      } catch {}
      finally { if (mounted) setInternalLoading(false) }
    }
    initialFetch()
    const interval = setInterval(refreshPdfs, 2 * 60 * 1000)
    return () => { mounted = false; clearInterval(interval) }
  }, [refreshPdfs])

  // Sync when parent forces a refresh
  useEffect(() => {
    if (!initialLoading) setInternalPdfs(initialPdfs)
  }, [initialPdfs, initialLoading])

  const pdfs = internalPdfs
  const loading = internalLoading

  // Filter and sort PDFs
  const filteredPdfs = useMemo(() => {
    let result = [...pdfs]

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(pdf => 
        pdf.title.toLowerCase().includes(query) ||
        pdf.description?.toLowerCase().includes(query)
      )
    }

    // Category filter
    if (filterCategory !== "all") {
      if (filterCategory === "uncategorized") {
        result = result.filter(pdf => !pdf.category_id)
      } else {
        result = result.filter(pdf => pdf.category_id === filterCategory)
      }
    }

    // Sort
    switch (sortBy) {
      case "newest":
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        break
      case "oldest":
        result.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
        break
      case "name":
        result.sort((a, b) => a.title.localeCompare(b.title))
        break
      case "downloads":
        result.sort((a, b) => b.download_count - a.download_count)
        break
      case "views":
        result.sort((a, b) => (b.view_count || 0) - (a.view_count || 0))
        break
    }

    return result
  }, [pdfs, searchQuery, filterCategory, sortBy])

  function toggleSelection(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  function toggleSelectAll() {
    if (selectedIds.size === filteredPdfs.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filteredPdfs.map((p) => p.id)))
    }
  }

  async function handleBulkDelete() {
    if (selectedIds.size === 0) return
    
    if (!confirm(`Are you sure you want to delete ${selectedIds.size} PDF${selectedIds.size > 1 ? "s" : ""}?`)) return

    setBulkDeleting(true)
    try {
      const token = sessionStorage.getItem("admin_token")
      const response = await fetch("/api/pdfs/bulk-delete", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ids: Array.from(selectedIds) }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to delete PDFs")
      }

      const data = await response.json()
      toast.success(`${data.deleted} PDF${data.deleted > 1 ? "s" : ""} deleted successfully!`)
      setSelectedIds(new Set())
      onDelete()
      refreshPdfs()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete PDFs")
    } finally {
      setBulkDeleting(false)
    }
  }

  async function handleBulkMove(categoryId: string | null) {
    if (selectedIds.size === 0) return

    setBulkMoving(true)
    try {
      const token = sessionStorage.getItem("admin_token")
      const response = await fetch("/api/pdfs/bulk-move", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ids: Array.from(selectedIds), category_id: categoryId }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to move PDFs")
      }

      const data = await response.json()
      const categoryName = categoryId ? categories.find(c => c.id === categoryId)?.name : "Uncategorized"
      toast.success(`${data.updated} PDF${data.updated > 1 ? "s" : ""} moved to ${categoryName}!`)
      setSelectedIds(new Set())
      onUpdate()
      refreshPdfs()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to move PDFs")
    } finally {
      setBulkMoving(false)
    }
  }

  function handleExportCSV() {
    const csvData = filteredPdfs.map(pdf => ({
      Title: pdf.title,
      Category: categories.find(c => c.id === pdf.category_id)?.name || "Uncategorized",
      Views: pdf.view_count || 0,
      Downloads: pdf.download_count,
      "File Size": formatFileSize(pdf.file_size),
      "Created At": formatDate(pdf.created_at),
      Rating: pdf.average_rating?.toFixed(1) || "N/A",
      Reviews: pdf.review_count || 0,
    }))

    const headers = Object.keys(csvData[0] || {}).join(",")
    const rows = csvData.map(row => Object.values(row).map(v => `"${v}"`).join(",")).join("\n")
    const csv = `${headers}\n${rows}`

    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `techvyro-pdfs-export-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success("PDF data exported to CSV!")
  }

  function handleExportJSON() {
    const jsonData = filteredPdfs.map(pdf => ({
      id: pdf.id,
      title: pdf.title,
      description: pdf.description,
      category: categories.find(c => c.id === pdf.category_id)?.name || null,
      views: pdf.view_count || 0,
      downloads: pdf.download_count,
      file_size: pdf.file_size,
      average_rating: pdf.average_rating,
      review_count: pdf.review_count,
      created_at: pdf.created_at,
    }))

    const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `techvyro-pdfs-export-${new Date().toISOString().split("T")[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.success("PDF data exported to JSON!")
  }

  function startEdit(pdf: PDF) {
    setEditingId(pdf.id)
    setEditState({
      title: pdf.title,
      category_id: pdf.category_id || "none",
      description: pdf.description || "",
      tags: Array.isArray(pdf.tags) ? pdf.tags.join(", ") : "",
      visibility: pdf.visibility || "public",
      allow_download: pdf.allow_download !== false,
    })
  }

  function cancelEdit() {
    setEditingId(null)
    setEditState({ title: "", category_id: "", description: "", tags: "", visibility: "public", allow_download: true })
  }

  async function quickToggleVisibility(pdf: PDF) {
    const next = pdf.visibility === "public" ? "private" : pdf.visibility === "private" ? "unlisted" : "public"
    const token = sessionStorage.getItem("admin_token")
    try {
      await fetch(`/api/pdfs/${pdf.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ visibility: next }),
      })
      setInternalPdfs(prev => prev.map(p => p.id === pdf.id ? { ...p, visibility: next as PDF["visibility"] } : p))
      toast.success(`Visibility set to "${next}"`)
    } catch {
      toast.error("Failed to update visibility")
    }
  }

  async function saveEdit(id: string) {
    if (!editState.title.trim()) {
      toast.error("Title cannot be empty")
      return
    }

    setSaving(true)
    try {
      const token = sessionStorage.getItem("admin_token")
      const tagsArray = editState.tags
        .split(",")
        .map(t => t.trim())
        .filter(Boolean)

      const response = await fetch(`/api/pdfs/${id}`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: editState.title.trim(),
          category_id: editState.category_id === "none" ? null : editState.category_id,
          description: editState.description.trim() || null,
          tags: tagsArray.length > 0 ? tagsArray : null,
          visibility: editState.visibility,
          allow_download: editState.allow_download,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to update PDF")
      }

      toast.success("PDF updated!")
      setEditingId(null)
      onUpdate()
      refreshPdfs()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update PDF")
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return

    try {
      const token = sessionStorage.getItem("admin_token")
      const response = await fetch(`/api/pdfs/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` },
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to delete PDF")
      }

      toast.success("PDF deleted successfully!")
      onDelete()
      refreshPdfs()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete PDF")
    }
  }

  function triggerReplaceFile(pdfId: string) {
    replaceTargetIdRef.current = pdfId
    replaceFileInputRef.current?.click()
  }

  async function handleReplaceFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    const targetId = replaceTargetIdRef.current
    replaceTargetIdRef.current = null
    e.target.value = ""

    if (!file || !targetId) return

    const MAX_FILE_SIZE = 50 * 1024 * 1024
    if (file.size > MAX_FILE_SIZE) { toast.error("File too large (max 50MB)"); return }
    if (file.type !== "application/pdf" && file.type !== "text/html" && !file.name.match(/\.(pdf|html?)$/i)) {
      toast.error("Only PDF or HTML files are allowed"); return
    }

    setReplacingId(targetId)
    const toastId = toast.loading("Replacing file...")

    try {
      const token = sessionStorage.getItem("admin_token")

      // Step 1: Get signed upload URL
      const urlRes = await fetch("/api/pdfs/get-upload-url", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type || "application/pdf",
        }),
      })
      if (!urlRes.ok) throw new Error("Failed to get upload URL")
      const { signedUrl, filePath } = await urlRes.json()

      // Step 2: Upload file via XHR
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.addEventListener("load", () => xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error("Upload failed")))
        xhr.addEventListener("error", () => reject(new Error("Network error")))
        xhr.open("PUT", signedUrl)
        xhr.setRequestHeader("Content-Type", file.type || "application/pdf")
        xhr.send(file)
      })

      // Step 3: Update DB with new file_path and file_size (deletes old file via PATCH route)
      const patchRes = await fetch(`/api/pdfs/${targetId}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ file_path: filePath, file_size: file.size }),
      })
      if (!patchRes.ok) throw new Error("Failed to update PDF record")

      toast.dismiss(toastId)
      toast.success("File replaced successfully!")
      onUpdate()
      refreshPdfs()
    } catch (error) {
      toast.dismiss(toastId)
      toast.error(error instanceof Error ? error.message : "Failed to replace file")
    } finally {
      setReplacingId(null)
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

  const allSelected = selectedIds.size === filteredPdfs.length && filteredPdfs.length > 0

  return (
    <div className="space-y-5">
      {/* Hidden file input for file replacement */}
      <input
        ref={replaceFileInputRef}
        type="file"
        accept=".pdf,.html,.htm,application/pdf,text/html"
        className="hidden"
        onChange={handleReplaceFileChange}
      />

      {/* Search and Filter Bar - Enhanced */}
      <div className="flex flex-col sm:flex-row gap-3 p-4 rounded-xl bg-muted/30 border border-border/50">
        <div className="relative flex-1 group">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 group-focus-within:bg-primary/20 transition-colors">
            <Search className="h-4 w-4 text-primary" />
          </div>
          <Input
            placeholder="Search PDFs by title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-14 h-11"
          />
        </div>
        <div className="flex gap-2">
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-[160px] h-11">
              <Filter className="h-4 w-4 mr-2 text-accent" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="uncategorized">Uncategorized</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  <span className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                    {cat.name}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
            <SelectTrigger className="w-[140px] h-11">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="name">Name A-Z</SelectItem>
              <SelectItem value="downloads">Most Downloads</SelectItem>
              <SelectItem value="views">Most Views</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results count - Enhanced */}
      {(searchQuery || filterCategory !== "all") && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-3 py-2 rounded-lg">
          <span className="font-medium text-foreground">{filteredPdfs.length}</span>
          <span>of {pdfs.length} PDFs</span>
          {searchQuery && <span className="text-primary">matching "{searchQuery}"</span>}
        </div>
      )}

      {/* Bulk Actions Bar - Enhanced */}
      <div className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-300 ${
        selectedIds.size > 0 
          ? "bg-primary/5 border-primary/30" 
          : "bg-muted/30 border-border/50"
      }`}>
        <div className="flex items-center gap-4">
          <Checkbox
            checked={allSelected}
            onCheckedChange={toggleSelectAll}
            aria-label="Select all PDFs"
            className="h-5 w-5"
          />
          <div>
            <span className="text-sm font-medium text-foreground">
              {selectedIds.size > 0 
                ? `${selectedIds.size} PDFs selected` 
                : `${filteredPdfs.length} PDFs total`}
            </span>
            {selectedIds.size > 0 && (
              <p className="text-xs text-muted-foreground">Use actions below to manage selected PDFs</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Export dropdown - always visible */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <FileDown className="h-4 w-4" />
                <span className="hidden sm:inline">Export</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleExportCSV}>
                <FileDown className="h-4 w-4 mr-2" />
                Export as CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportJSON}>
                <FileDown className="h-4 w-4 mr-2" />
                Export as JSON
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {selectedIds.size > 0 && (
            <>
              {/* Move to category dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2" disabled={bulkMoving}>
                    {bulkMoving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <FolderInput className="h-4 w-4" />
                    )}
                    <span className="hidden sm:inline">Move to</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleBulkMove(null)}>
                    <span className="text-muted-foreground">Uncategorized</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {categories.map((cat) => (
                    <DropdownMenuItem key={cat.id} onClick={() => handleBulkMove(cat.id)}>
                      <span className="h-2.5 w-2.5 rounded-full mr-2" style={{ backgroundColor: cat.color }} />
                      {cat.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Delete button */}
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDelete}
                disabled={bulkDeleting}
                className="gap-2"
              >
                {bulkDeleting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="hidden sm:inline">Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    <span className="hidden sm:inline">Delete ({selectedIds.size})</span>
                  </>
                )}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* PDF List - Enhanced */}
      {filteredPdfs.length === 0 ? (
        <Empty
          icon={Search}
          title="No results found"
          description="Try adjusting your search or filters"
        />
      ) : (
        <div className="space-y-3">
          {filteredPdfs.map((pdf) => {
            const category = categories.find((c) => c.id === pdf.category_id)
            const isEditing = editingId === pdf.id

            return (
              <div
                key={pdf.id}
                className={`flex items-center gap-3 sm:gap-4 p-4 rounded-xl border bg-card transition-all duration-200 ${
                  selectedIds.has(pdf.id) 
                    ? "border-primary/50 bg-primary/5 shadow-md shadow-primary/10" 
                    : "border-border/50 hover:border-primary/30 hover:shadow-sm"
                }`}
              >
                <Checkbox
                  checked={selectedIds.has(pdf.id)}
                  onCheckedChange={() => toggleSelection(pdf.id)}
                  aria-label={`Select ${pdf.title}`}
                  className="shrink-0 h-5 w-5"
                />
                <div className={`flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-xl transition-colors ${
                  selectedIds.has(pdf.id) 
                    ? "bg-primary/20" 
                    : "bg-gradient-to-br from-primary/10 to-accent/10"
                }`}>
                  <FileText className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
                </div>

                <div className="flex-1 min-w-0">
                  {isEditing ? (
                    <div className="flex flex-col gap-2">
                      <Input
                        value={editState.title}
                        onChange={(e) => setEditState((s) => ({ ...s, title: e.target.value }))}
                        onKeyDown={(e) => { if (e.key === "Escape") cancelEdit() }}
                        className="h-8 text-sm font-medium"
                        placeholder="PDF title"
                        autoFocus
                        disabled={saving}
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <Select value={editState.category_id} onValueChange={(v) => setEditState((s) => ({ ...s, category_id: v }))} disabled={saving}>
                          <SelectTrigger className="h-7 text-xs"><SelectValue placeholder="Category" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">No category</SelectItem>
                            {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <Select value={editState.visibility} onValueChange={(v) => setEditState((s) => ({ ...s, visibility: v }))} disabled={saving}>
                          <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="public">Public</SelectItem>
                            <SelectItem value="unlisted">Unlisted</SelectItem>
                            <SelectItem value="private">Private</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Textarea
                        value={editState.description}
                        onChange={(e) => setEditState((s) => ({ ...s, description: e.target.value }))}
                        className="text-xs min-h-[56px] resize-none"
                        placeholder="Description (optional)"
                        disabled={saving}
                      />
                      <Input
                        value={editState.tags}
                        onChange={(e) => setEditState((s) => ({ ...s, tags: e.target.value }))}
                        className="h-7 text-xs"
                        placeholder="Tags: nda, cds, math (comma-separated)"
                        disabled={saving}
                      />
                      <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={editState.allow_download}
                          onChange={(e) => setEditState((s) => ({ ...s, allow_download: e.target.checked }))}
                          disabled={saving}
                          className="rounded"
                        />
                        Allow download
                      </label>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-medium truncate text-sm sm:text-base">{pdf.title}</h3>
                        {category && (
                          <Badge className="text-[10px] sm:text-xs shrink-0" style={{ backgroundColor: category.color, color: "#fff" }}>
                            {category.name}
                          </Badge>
                        )}
                        {pdf.visibility && pdf.visibility !== "public" && (
                          <button
                            onClick={() => quickToggleVisibility(pdf)}
                            title={`Visibility: ${pdf.visibility} — click to toggle`}
                            className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full border transition-colors hover:opacity-80"
                            style={pdf.visibility === "private" ? { borderColor: "rgb(239 68 68 / 0.4)", color: "rgb(220 38 38)", background: "rgb(254 242 242)" } : { borderColor: "rgb(245 158 11 / 0.4)", color: "rgb(217 119 6)", background: "rgb(255 251 235)" }}
                          >
                            {pdf.visibility === "private" ? <Lock className="h-2.5 w-2.5" /> : <EyeOff className="h-2.5 w-2.5" />}
                            {pdf.visibility}
                          </button>
                        )}
                        {Array.isArray(pdf.tags) && pdf.tags.length > 0 && (
                          <span className="hidden sm:flex items-center gap-1 text-[10px] text-muted-foreground">
                            <Tag className="h-2.5 w-2.5" />
                            {pdf.tags.slice(0, 2).join(", ")}{pdf.tags.length > 2 ? `+${pdf.tags.length - 2}` : ""}
                          </span>
                        )}
                      </div>
                      {pdf.description && (
                        <p className="text-xs text-muted-foreground truncate mt-0.5 max-w-md">
                          <AlignLeft className="h-2.5 w-2.5 inline mr-1" />{pdf.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-muted-foreground flex-wrap mt-0.5">
                        <span>{formatFileSize(pdf.file_size)}</span>
                        <span className="hidden sm:inline">|</span>
                        <span className="hidden sm:inline">{formatDate(pdf.created_at)}</span>
                        <span>|</span>
                        <span className="inline-flex items-center gap-1"><Eye className="h-3 w-3" />{pdf.view_count || 0}</span>
                        <span>|</span>
                        <span className="inline-flex items-center gap-1"><Download className="h-3 w-3" />{pdf.download_count}</span>
                      </div>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {isEditing ? (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-green-600 hover:text-green-700 hover:bg-green-50 h-8 w-8"
                        onClick={() => saveEdit(pdf.id)}
                        disabled={saving}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-foreground h-8 w-8"
                        onClick={cancelEdit}
                        disabled={saving}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant="ghost" size="icon" onClick={() => startEdit(pdf)} className="h-8 w-8" title="Edit title & category">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost" size="icon" className="h-8 w-8 hover:bg-blue-500/10 hover:text-blue-600"
                        title="Replace file"
                        disabled={replacingId === pdf.id}
                        onClick={() => triggerReplaceFile(pdf.id)}
                      >
                        {replacingId === pdf.id
                          ? <Loader2 className="h-4 w-4 animate-spin" />
                          : <UploadCloud className="h-4 w-4" />
                        }
                      </Button>
                      <Button variant="ghost" size="icon" asChild className="h-8 w-8">
                        <a href={`/pdf/${pdf.id}`} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8"
                        onClick={() => handleDelete(pdf.id, pdf.title)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
