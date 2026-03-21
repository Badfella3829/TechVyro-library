"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Clock, FileText, Play, Trophy, Users, Target, 
  ArrowRight, Zap, Crown, Medal, Star
} from "lucide-react"

interface Quiz {
  id: string
  title: string
  description: string
  category: string
  timeLimit: number
  questions: { id: string }[]
  enabled: boolean
}

interface LeaderboardEntry {
  id: string
  name: string
  score: number
  percentage: number
  quizId: string
  quizTitle: string
  timestamp: string
}

const QUIZ_STORAGE_KEY = "techvyro-quizzes"
const LEADERBOARD_KEY = "techvyro-leaderboard"

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

export function QuizSection() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load quizzes
    try {
      const savedQuizzes = localStorage.getItem(QUIZ_STORAGE_KEY)
      if (savedQuizzes) {
        const allQuizzes: Quiz[] = JSON.parse(savedQuizzes)
        setQuizzes(allQuizzes.filter(q => q.enabled && q.questions.length > 0).slice(0, 4))
      }
    } catch (e) {
      // Silent fail
    }

    // Load leaderboard
    try {
      const savedLeaderboard = localStorage.getItem(LEADERBOARD_KEY)
      if (savedLeaderboard) {
        const entries: LeaderboardEntry[] = JSON.parse(savedLeaderboard)
        // Get top 5 unique users by highest score
        const uniqueUsers = new Map<string, LeaderboardEntry>()
        entries.sort((a, b) => b.percentage - a.percentage).forEach(entry => {
          if (!uniqueUsers.has(entry.name)) {
            uniqueUsers.set(entry.name, entry)
          }
        })
        setLeaderboard(Array.from(uniqueUsers.values()).slice(0, 5))
      }
    } catch (e) {
      // Silent fail
    }

    setLoading(false)
  }, [])

  const getRankIcon = (rank: number) => {
    if (rank === 0) return <Crown className="h-5 w-5 text-yellow-500" />
    if (rank === 1) return <Medal className="h-5 w-5 text-gray-400" />
    if (rank === 2) return <Medal className="h-5 w-5 text-amber-700" />
    return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-muted-foreground">{rank + 1}</span>
  }

  const getRankBg = (rank: number) => {
    if (rank === 0) return "bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border-yellow-500/30"
    if (rank === 1) return "bg-gradient-to-r from-gray-400/20 to-gray-500/20 border-gray-400/30"
    if (rank === 2) return "bg-gradient-to-r from-amber-700/20 to-amber-800/20 border-amber-700/30"
    return "bg-card border-border/50"
  }

  if (loading) {
    return (
      <section className="py-16 sm:py-20 lg:py-24 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-muted rounded w-1/3 mx-auto"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="h-64 bg-muted rounded-xl"></div>
              <div className="h-64 bg-muted rounded-xl"></div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  // Don't show section if no quizzes
  if (quizzes.length === 0) {
    return null
  }

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-10 sm:mb-14">
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 text-sm px-4 py-1.5">
            <Zap className="h-4 w-4 mr-2" />
            Practice Tests
          </Badge>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-3">
            Test Your Knowledge
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base max-w-xl mx-auto">
            Challenge yourself with our curated quizzes and compete on the leaderboard
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Quizzes Grid */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Available Quizzes
              </h3>
              <Link 
                href="/quiz" 
                className="text-sm text-primary hover:underline flex items-center gap-1"
              >
                View All <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {quizzes.map(quiz => (
                <Card 
                  key={quiz.id}
                  className="group overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border-border/50 hover:border-primary/40"
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <h4 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors">
                        {quiz.title}
                      </h4>
                      <Badge 
                        className={`shrink-0 text-[10px] text-white ${categoryColors[quiz.category] || "bg-gray-500"}`}
                      >
                        {quiz.category}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
                      <div className="flex items-center gap-1">
                        <FileText className="h-3.5 w-3.5" />
                        {quiz.questions.length} Qs
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {Math.floor(quiz.timeLimit / 60)} min
                      </div>
                    </div>
                    
                    <Button asChild size="sm" className="w-full h-9 text-xs">
                      <Link href={`/quiz/${quiz.id}`}>
                        <Play className="h-3.5 w-3.5 mr-1.5" />
                        Start Quiz
                      </Link>
                    </Button>
                  </div>
                </Card>
              ))}
            </div>

            {quizzes.length >= 4 && (
              <div className="text-center pt-2">
                <Button asChild variant="outline" size="sm">
                  <Link href="/quiz">
                    Browse All Quizzes
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </div>
            )}
          </div>

          {/* Leaderboard */}
          <div className="lg:col-span-1">
            <Card className="overflow-hidden border-border/50">
              <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 p-4 border-b border-border/50">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-primary" />
                  Leaderboard
                </h3>
                <p className="text-xs text-muted-foreground mt-1">Top performers this week</p>
              </div>

              <div className="p-4">
                {leaderboard.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                    <p className="text-sm text-muted-foreground">No scores yet</p>
                    <p className="text-xs text-muted-foreground mt-1">Be the first to take a quiz!</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {leaderboard.map((entry, index) => (
                      <div 
                        key={entry.id}
                        className={`flex items-center gap-3 p-3 rounded-lg border transition-all hover:scale-[1.02] ${getRankBg(index)}`}
                      >
                        <div className="shrink-0">
                          {getRankIcon(index)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{entry.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{entry.quizTitle}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-bold text-sm text-primary">{entry.percentage}%</p>
                          <div className="flex items-center gap-0.5 justify-end">
                            <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                            <span className="text-xs text-muted-foreground">{entry.score.toFixed(1)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-4 pt-4 border-t border-border/50">
                  <Link 
                    href="/quiz/leaderboard"
                    className="text-sm text-primary hover:underline flex items-center justify-center gap-1"
                  >
                    View Full Leaderboard <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}
