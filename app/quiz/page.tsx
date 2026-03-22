"use client"

import { useEffect, useState, useMemo } from "react"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Clock, FileText, Play, BookOpen, ArrowRight, Search, 
  SlidersHorizontal, Trophy, X, ArrowUpDown, Zap, Target
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Quiz {
  id: string
  title: string
  description: string
  category: string
  time_limit: number
  questions: { id: string }[]
  enabled: boolean
  created_at: string
}

const categoryColors: Record<string, string> = {
  Mathematics: "bg-blue-500",
  Physics: "bg-purple-500",
  Chemistry: "bg-green-500",
  Biology: "bg-emerald-500",
  English: "bg-amber-500",
  General: "bg-gray-500",
  NDA: "bg-red-500",
  SSC: "bg-orange-500"
}

const categoryBg: Record<string, string> = {
  Mathematics: "bg-blue-500/10 text-blue-600 border-blue-500/30 hover:bg-blue-500/20",
  Physics: "bg-purple-500/10 text-purple-600 border-purple-500/30 hover:bg-purple-500/20",
  Chemistry: "bg-green-500/10 text-green-600 border-green-500/30 hover:bg-green-500/20",
  Biology: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/20",
  English: "bg-amber-500/10 text-amber-600 border-amber-500/30 hover:bg-amber-500/20",
  General: "bg-gray-500/10 text-gray-600 border-gray-500/30 hover:bg-gray-500/20",
  NDA: "bg-red-500/10 text-red-600 border-red-500/30 hover:bg-red-500/20",
  SSC: "bg-orange-500/10 text-orange-600 border-orange-500/30 hover:bg-orange-500/20"
}

const sortOptions = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "most-questions", label: "Most Questions" },
  { value: "least-questions", label: "Fewest Questions" },
  { value: "longest", label: "Longest Time" },
  { value: "shortest", label: "Shortest Time" },
]

export default function QuizzesPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("All")
  const [sortBy, setSortBy] = useState("newest")

  useEffect(() => {
    fetch("/api/quizzes")
      .then(r => r.json())
      .then(data => {
        const all: Quiz[] = data.quizzes || []
        setQuizzes(all.filter(q => q.enabled && q.questions.length > 0))
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const categories = useMemo(() => {
    const cats = Array.from(new Set(quizzes.map(q => q.category).filter(Boolean)))
    return ["All", ...cats]
  }, [quizzes])

  const filtered = useMemo(() => {
    let result = quizzes

    if (selectedCategory !== "All") {
      result = result.filter(q => q.category === selectedCategory)
    }

    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        quiz => quiz.title.toLowerCase().includes(q) || quiz.description?.toLowerCase().includes(q) || quiz.category.toLowerCase().includes(q)
      )
    }

    result = [...result].sort((a, b) => {
      if (sortBy === "newest") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      if (sortBy === "oldest") return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      if (sortBy === "most-questions") return b.questions.length - a.questions.length
      if (sortBy === "least-questions") return a.questions.length - b.questions.length
      if (sortBy === "longest") return b.time_limit - a.time_limit
      if (sortBy === "shortest") return a.time_limit - b.time_limit
      return 0
    })

    return result
  }, [quizzes, selectedCategory, search, sortBy])

  const totalQuestions = quizzes.reduce((sum, q) => sum + q.questions.length, 0)
  const activeSortLabel = sortOptions.find(s => s.value === sortBy)?.label || "Sort"

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-10">
          <Badge className="mb-3 sm:mb-4 bg-primary/10 text-primary border-primary/20 text-xs sm:text-sm px-2.5 sm:px-3 py-1">
            <BookOpen className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1 sm:mr-1.5" />
            Practice Tests
          </Badge>
          <h1 className="text-2xl sm:text-3xl lg:text-5xl font-bold mb-3 sm:mb-4">
            Test Your Knowledge
          </h1>
          <p className="text-muted-foreground text-sm sm:text-lg max-w-2xl mx-auto px-2">
            Practice with our curated quizzes designed for NDA, SSC, and other competitive exams.
          </p>
        </div>

        {/* Stats bar */}
        {!loading && quizzes.length > 0 && (
          <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8 max-w-lg mx-auto">
            <div className="text-center p-3 rounded-xl bg-primary/5 border border-primary/20">
              <p className="text-lg sm:text-2xl font-bold text-primary">{quizzes.length}</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">Quizzes</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-accent/5 border border-accent/20">
              <p className="text-lg sm:text-2xl font-bold text-accent">{totalQuestions}</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">Questions</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-green-500/5 border border-green-500/20">
              <p className="text-lg sm:text-2xl font-bold text-green-500">{categories.length - 1}</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">Subjects</p>
            </div>
          </div>
        )}

        {/* Search + Sort row */}
        {!loading && quizzes.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search quizzes by title, subject..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 pr-9 h-10 text-sm"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-10 gap-2 text-xs sm:text-sm whitespace-nowrap">
                    <ArrowUpDown className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">{activeSortLabel}</span>
                    <span className="sm:hidden">Sort</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {sortOptions.map(opt => (
                    <DropdownMenuItem
                      key={opt.value}
                      onClick={() => setSortBy(opt.value)}
                      className={sortBy === opt.value ? "bg-primary/10 text-primary font-medium" : ""}
                    >
                      {opt.value === sortBy && <Zap className="h-3.5 w-3.5 mr-2 text-primary" />}
                      {opt.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <Button asChild variant="outline" size="sm" className="h-10 gap-1.5 text-xs sm:text-sm">
                <Link href="/quiz/leaderboard">
                  <Trophy className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Leaderboard</span>
                </Link>
              </Button>
            </div>
          </div>
        )}

        {/* Category filter chips */}
        {!loading && categories.length > 2 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {categories.map(cat => {
              const isActive = selectedCategory === cat
              const colorClass = cat === "All" 
                ? isActive ? "bg-primary text-primary-foreground border-primary" : "bg-muted/50 text-muted-foreground border-border hover:bg-muted hover:text-foreground"
                : isActive ? `${(categoryColors[cat] || "bg-gray-500")} text-white border-transparent` : `${categoryBg[cat] || "bg-gray-500/10 text-gray-600 border-gray-500/30 hover:bg-gray-500/20"} border`
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium border transition-all duration-200 ${colorClass}`}
                >
                  {cat}
                  {cat !== "All" && (
                    <span className="ml-1.5 opacity-70">
                      ({quizzes.filter(q => q.category === cat).length})
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-1/2 mt-2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-20 bg-muted rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : quizzes.length === 0 ? (
          <Card className="p-6 sm:p-12 text-center">
            <FileText className="h-10 w-10 sm:h-16 sm:w-16 mx-auto text-muted-foreground mb-3 sm:mb-4" />
            <h3 className="text-base sm:text-xl font-semibold mb-2">No Quizzes Available</h3>
            <p className="text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-6">
              Quizzes will appear here once they are created by the admin.
            </p>
            <Button asChild variant="outline" size="sm" className="text-xs sm:text-sm">
              <Link href="/">
                Browse PDFs Instead
                <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 ml-1.5 sm:ml-2" />
              </Link>
            </Button>
          </Card>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Target className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No quizzes found</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Try adjusting your search or filter
            </p>
            <Button variant="outline" size="sm" onClick={() => { setSearch(""); setSelectedCategory("All") }}>
              Clear Filters
            </Button>
          </div>
        ) : (
          <>
            <p className="text-xs text-muted-foreground mb-3">
              Showing {filtered.length} of {quizzes.length} quizzes
              {selectedCategory !== "All" && ` in ${selectedCategory}`}
              {search && ` matching "${search}"`}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
              {filtered.map(quiz => (
                <Card 
                  key={quiz.id} 
                  className="group overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-border/50 hover:border-primary/40"
                >
                  <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6 pt-3 sm:pt-6">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <CardTitle className="text-sm sm:text-base line-clamp-2 group-hover:text-primary transition-colors">
                          {quiz.title}
                        </CardTitle>
                        <CardDescription className="line-clamp-2 mt-0.5 sm:mt-1 text-xs">
                          {quiz.description}
                        </CardDescription>
                      </div>
                      <Badge 
                        className={`shrink-0 text-white text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 ${categoryColors[quiz.category] || "bg-gray-500"}`}
                      >
                        {quiz.category}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
                    <div className="flex items-center gap-4 text-[11px] sm:text-xs text-muted-foreground mb-3 sm:mb-4 bg-muted/30 rounded-lg px-3 py-2">
                      <div className="flex items-center gap-1.5">
                        <FileText className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-primary" />
                        <span><span className="font-semibold text-foreground">{quiz.questions.length}</span> Questions</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-primary" />
                        <span><span className="font-semibold text-foreground">{Math.floor(quiz.time_limit / 60)}</span> Minutes</span>
                      </div>
                    </div>
                    
                    <Button asChild className="w-full h-9 sm:h-10 text-xs sm:text-sm gap-2">
                      <Link href={`/quiz/${quiz.id}`}>
                        <Play className="h-3.5 w-3.5" />
                        Start Quiz
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  )
}
