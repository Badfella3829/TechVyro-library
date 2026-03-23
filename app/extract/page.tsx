"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Search, Loader2, BookOpen, ChevronRight, Globe,
  AlertCircle, Zap, GraduationCap, FileText, Clock
} from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import Link from "next/link"

interface TestSeries {
  id?: string | number
  title?: string
  name?: string
  slug?: string
  description?: string
  total_tests?: number
  image?: string
  thumbnail?: string
  subjects?: unknown[]
}

export default function ExtractPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [url, setUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [testSeries, setTestSeries] = useState<TestSeries[]>([])
  const [apiBase, setApiBase] = useState("")
  const [webBase, setWebBase] = useState("")
  const [searched, setSearched] = useState(false)
  const [credits, setCredits] = useState<{ credits: number; is_premium: boolean } | null>(null)

  // Auto-initialize credits when user is logged in
  useEffect(() => {
    if (user) {
      fetch("/api/credits")
        .then(r => r.json())
        .then(d => { if (d.credits) setCredits(d.credits) })
        .catch(() => {})
    }
  }, [user])

  const handleSearch = async () => {
    if (!url.trim()) return
    if (!user) {
      router.push(`/login?redirect=/extract`)
      return
    }

    setLoading(true)
    setError("")
    setTestSeries([])
    setSearched(false)

    try {
      const res = await fetch(`/api/extract?url=${encodeURIComponent(url.trim())}`)
      const data = await res.json()

      if (!res.ok || !data.success) {
        setError(data.error || "Could not fetch test series from this URL")
        return
      }

      setTestSeries(data.testSeries || [])
      setApiBase(data.apiBase || "")
      setWebBase(data.webBase || "")
      setSearched(true)
    } catch {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch()
  }

  const goToSeries = (series: TestSeries) => {
    const slug = series.slug || String(series.id || "")
    const params = new URLSearchParams({
      slug,
      apiBase,
      webBase,
      title: series.title || series.name || "Test Series",
    })
    router.push(`/extract/series?${params.toString()}`)
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-16 px-4">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-background to-blue-500/5" />
          <div className="relative max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 rounded-full px-4 py-1.5 mb-4">
              <Zap className="h-4 w-4 text-violet-500" />
              <span className="text-sm font-medium text-violet-600 dark:text-violet-400">AppX Test Extractor</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
              Extract & Play Test Series
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Enter any AppX-based educational website URL and instantly access their test series — right here on TechVyro.
            </p>

            {/* Search Bar */}
            <div className="flex gap-2 max-w-2xl mx-auto">
              <div className="relative flex-1">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="e.g. parmaracademy.com or https://..."
                  className="pl-10 h-12 text-base"
                  disabled={loading}
                />
              </div>
              <Button onClick={handleSearch} disabled={loading || !url.trim()} size="lg" className="h-12 px-6 bg-violet-600 hover:bg-violet-700">
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
                <span className="ml-2">{loading ? "Searching..." : "Extract"}</span>
              </Button>
            </div>

            {/* Example URLs */}
            <div className="mt-4 flex flex-wrap gap-2 justify-center">
              <span className="text-sm text-muted-foreground">Try:</span>
              {["parmaracademy.com", "testbook.com", "physicswallah.net"].map(example => (
                <button
                  key={example}
                  onClick={() => setUrl(example)}
                  className="text-sm text-violet-600 hover:text-violet-700 dark:text-violet-400 underline underline-offset-2"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Error */}
        {error && (
          <div className="max-w-2xl mx-auto px-4 mb-6">
            <div className="flex items-start gap-3 bg-destructive/10 border border-destructive/20 rounded-xl p-4">
              <AlertCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-destructive">Extraction Failed</p>
                <p className="text-sm text-muted-foreground mt-0.5">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {searched && testSeries.length === 0 && !error && (
          <div className="max-w-2xl mx-auto px-4 text-center py-12">
            <BookOpen className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-lg font-medium">No Test Series Found</p>
            <p className="text-muted-foreground">This website may not have publicly accessible test series data.</p>
          </div>
        )}

        {testSeries.length > 0 && (
          <section className="max-w-6xl mx-auto px-4 pb-16">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <GraduationCap className="h-6 w-6 text-violet-600" />
                Available Test Series
              </h2>
              <Badge variant="secondary">{testSeries.length} found</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {testSeries.map((series, idx) => {
                const title = series.title || series.name || `Test Series ${idx + 1}`
                const totalTests = series.total_tests ?? (Array.isArray(series.subjects) ? series.subjects.length : null)
                const thumbnail = series.image || series.thumbnail

                return (
                  <Card
                    key={series.id || idx}
                    className="group p-5 cursor-pointer hover:shadow-lg hover:border-violet-300 dark:hover:border-violet-700 transition-all duration-200"
                    onClick={() => goToSeries(series)}
                  >
                    {thumbnail && (
                      <img
                        src={thumbnail}
                        alt={title}
                        className="w-full h-36 object-cover rounded-lg mb-3"
                        onError={e => { (e.target as HTMLImageElement).style.display = "none" }}
                      />
                    )}
                    {!thumbnail && (
                      <div className="w-full h-36 rounded-lg mb-3 bg-gradient-to-br from-violet-500/10 to-blue-500/10 flex items-center justify-center">
                        <FileText className="h-12 w-12 text-violet-400" />
                      </div>
                    )}
                    <h3 className="font-semibold text-base line-clamp-2 group-hover:text-violet-600 transition-colors mb-2">
                      {title}
                    </h3>
                    {series.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{series.description}</p>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        {totalTests !== null && (
                          <Badge variant="outline" className="text-xs">
                            <Clock className="h-3 w-3 mr-1" />
                            {totalTests} tests
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center text-violet-600 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                        View <ChevronRight className="h-4 w-4 ml-0.5" />
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          </section>
        )}

        {/* How it works */}
        {!searched && (
          <section className="max-w-4xl mx-auto px-4 pb-16">
            <h2 className="text-2xl font-bold text-center mb-8">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { icon: Globe, step: "1", title: "Enter URL", desc: "Paste the URL of any AppX-based educational website" },
                { icon: Search, step: "2", title: "Extract Tests", desc: "We automatically find and list all available test series" },
                { icon: Zap, step: "3", title: "Play Online", desc: "Take the full test right here with timer, scoring & analysis" },
              ].map(({ icon: Icon, step, title, desc }) => (
                <div key={step} className="text-center p-6 rounded-2xl bg-muted/50 border">
                  <div className="w-12 h-12 rounded-full bg-violet-500/10 flex items-center justify-center mx-auto mb-4">
                    <Icon className="h-6 w-6 text-violet-600" />
                  </div>
                  <div className="text-xs font-bold text-violet-600 mb-1">STEP {step}</div>
                  <h3 className="font-semibold mb-2">{title}</h3>
                  <p className="text-sm text-muted-foreground">{desc}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  )
}
