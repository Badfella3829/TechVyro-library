import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/header"
import { PDFGrid } from "@/components/pdf-grid"
import type { PDF, Category } from "@/lib/types"

export const revalidate = 60 // Revalidate every 60 seconds

async function getPDFs(): Promise<PDF[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from("pdfs")
    .select(`
      *,
      category:categories(*)
    `)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[v0] Error fetching PDFs:", error)
    return []
  }

  return data || []
}

async function getCategories(): Promise<Category[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("name")

  if (error) {
    console.error("[v0] Error fetching categories:", error)
    return []
  }

  return data || []
}

export default async function HomePage() {
  const [pdfs, categories] = await Promise.all([getPDFs(), getCategories()])

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <section className="mb-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent text-balance">
            PDF Library
          </h1>
          <p className="mt-3 text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Browse, download, and share PDF documents from our curated collection
          </p>
        </section>

        <PDFGrid pdfs={pdfs} categories={categories} />
      </main>
      
      <footer className="border-t border-border/40 py-6 mt-12">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          PDF Library - Your digital document collection
        </div>
      </footer>
    </div>
  )
}
