"use client"

import { useMemo, useState } from "react"
import { PDFCard } from "@/components/pdf-card"
import { SearchBar } from "@/components/search-bar"
import { CategoryFilter } from "@/components/category-filter"
import { Empty } from "@/components/ui/empty"
import { FileText } from "lucide-react"
import type { PDF, Category } from "@/lib/types"

interface PDFGridProps {
  pdfs: PDF[]
  categories: Category[]
}

export function PDFGrid({ pdfs, categories }: PDFGridProps) {
  const [search, setSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const filteredPdfs = useMemo(() => {
    return pdfs.filter((pdf) => {
      const matchesSearch = pdf.title.toLowerCase().includes(search.toLowerCase()) ||
        (pdf.description?.toLowerCase().includes(search.toLowerCase()) ?? false)
      const matchesCategory = !selectedCategory || pdf.category_id === selectedCategory
      return matchesSearch && matchesCategory
    })
  }, [pdfs, search, selectedCategory])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <SearchBar value={search} onChange={setSearch} />
        <div className="text-sm text-muted-foreground">
          {filteredPdfs.length} {filteredPdfs.length === 1 ? "PDF" : "PDFs"}
        </div>
      </div>
      
      <CategoryFilter
        categories={categories}
        selectedCategory={selectedCategory}
        onSelect={setSelectedCategory}
      />

      {filteredPdfs.length === 0 ? (
        <Empty
          icon={FileText}
          title="No PDFs found"
          description={search || selectedCategory ? "Try adjusting your search or filter" : "No PDFs have been uploaded yet"}
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredPdfs.map((pdf) => (
            <PDFCard key={pdf.id} pdf={pdf} />
          ))}
        </div>
      )}
    </div>
  )
}
