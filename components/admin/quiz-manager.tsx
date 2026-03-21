"use client"

import { useState, useEffect, useRef } from "react"
import { 
  Plus, Trash2, Edit, ChevronDown, ChevronRight, Clock, FileText,
  CheckCircle, Save, Upload, Copy, ExternalLink, FileUp, Loader2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { toast } from "sonner"

interface Question {
  id: string
  question: string
  options: string[]
  correct: number
  marks: number
  explanation: string
}

interface Quiz {
  id: string
  title: string
  description: string
  category: string
  timeLimit: number
  questions: Question[]
  enabled: boolean
  createdAt: string
}

const STORAGE_KEY = "techvyro-quizzes"

const defaultQuiz: Omit<Quiz, "id" | "createdAt"> = {
  title: "",
  description: "",
  category: "Mathematics",
  timeLimit: 1200,
  questions: [],
  enabled: true
}

const defaultQuestion: Omit<Question, "id"> = {
  question: "",
  options: ["", "", "", ""],
  correct: 1,
  marks: 1,
  explanation: ""
}

export function QuizManager() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null)
  const [editingQuestion, setEditingQuestion] = useState<{ quizId: string; question: Question } | null>(null)
  const [showQuizDialog, setShowQuizDialog] = useState(false)
  const [showQuestionDialog, setShowQuestionDialog] = useState(false)
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [importHtml, setImportHtml] = useState("")
  const [expandedQuizzes, setExpandedQuizzes] = useState<Set<string>>(new Set())
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedFileName, setUploadedFileName] = useState("")
  const [parsedPreview, setParsedPreview] = useState<{ title: string; count: number } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        setQuizzes(JSON.parse(saved))
      } catch (e) {
        // Failed to parse
      }
    }
  }, [])

  const saveQuizzes = (updated: Quiz[]) => {
    setQuizzes(updated)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  }

  const generateId = () => Math.random().toString(36).substr(2, 9)

  const handleAddQuiz = () => {
    setEditingQuiz({
      ...defaultQuiz,
      id: generateId(),
      createdAt: new Date().toISOString()
    })
    setShowQuizDialog(true)
  }

  const handleEditQuiz = (quiz: Quiz) => {
    setEditingQuiz({ ...quiz })
    setShowQuizDialog(true)
  }

  const handleSaveQuiz = () => {
    if (!editingQuiz) return
    
    if (!editingQuiz.title.trim()) {
      toast.error("Quiz title is required")
      return
    }

    const existing = quizzes.find(q => q.id === editingQuiz.id)
    let updated: Quiz[]
    
    if (existing) {
      updated = quizzes.map(q => q.id === editingQuiz.id ? editingQuiz : q)
    } else {
      updated = [...quizzes, editingQuiz]
    }

    saveQuizzes(updated)
    setShowQuizDialog(false)
    setEditingQuiz(null)
    toast.success(existing ? "Quiz updated" : "Quiz created")
  }

  const handleDeleteQuiz = (quizId: string) => {
    if (!confirm("Delete this quiz and all its questions?")) return
    saveQuizzes(quizzes.filter(q => q.id !== quizId))
    toast.success("Quiz deleted")
  }

  const handleToggleQuiz = (quizId: string) => {
    saveQuizzes(quizzes.map(q => 
      q.id === quizId ? { ...q, enabled: !q.enabled } : q
    ))
  }

  const handleAddQuestion = (quizId: string) => {
    setEditingQuestion({
      quizId,
      question: {
        ...defaultQuestion,
        id: generateId()
      }
    })
    setShowQuestionDialog(true)
  }

  const handleEditQuestion = (quizId: string, question: Question) => {
    setEditingQuestion({ quizId, question: { ...question } })
    setShowQuestionDialog(true)
  }

  const handleSaveQuestion = () => {
    if (!editingQuestion) return
    
    const { quizId, question } = editingQuestion

    if (!question.question.trim()) {
      toast.error("Question text is required")
      return
    }

    if (question.options.some(o => !o.trim())) {
      toast.error("All options must be filled")
      return
    }

    const quiz = quizzes.find(q => q.id === quizId)
    if (!quiz) return

    const existingIdx = quiz.questions.findIndex(q => q.id === question.id)
    let updatedQuestions: Question[]

    if (existingIdx >= 0) {
      updatedQuestions = quiz.questions.map(q => q.id === question.id ? question : q)
    } else {
      updatedQuestions = [...quiz.questions, question]
    }

    saveQuizzes(quizzes.map(q => 
      q.id === quizId ? { ...q, questions: updatedQuestions } : q
    ))

    setShowQuestionDialog(false)
    setEditingQuestion(null)
    toast.success(existingIdx >= 0 ? "Question updated" : "Question added")
  }

  const handleDeleteQuestion = (quizId: string, questionId: string) => {
    if (!confirm("Delete this question?")) return
    
    saveQuizzes(quizzes.map(q => 
      q.id === quizId 
        ? { ...q, questions: q.questions.filter(qq => qq.id !== questionId) }
        : q
    ))
    toast.success("Question deleted")
  }

  const parseQuizHtml = (html: string): Quiz | null => {
    try {
      let title = ""
      
      const titlePatterns = [
        /<h1[^>]*class="[^"]*start-title[^"]*"[^>]*>([\s\S]*?)<\/h1>/i,
        /<div[^>]*class="[^"]*start-title[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
        /<h1[^>]*>([\s\S]*?)<\/h1>/i,
        /<title[^>]*>([\s\S]*?)<\/title>/i
      ]
      
      for (const pattern of titlePatterns) {
        const match = html.match(pattern)
        if (match) {
          title = match[1].replace(/<[^>]*>/g, '').trim()
          if (title) break
        }
      }
      
      title = title
        .replace(/Boss_Quiz_Robot/gi, "TechVyro")
        .replace(/LearnWithSumit/gi, "TechVyro")
        .replace(/Sumit\s*Raftaar/gi, "TechVyro")
        .replace(/Sumit/gi, "TechVyro")
        .replace(/\s+/g, " ")
        .trim() || "Imported Quiz"

      let questionsData: any[] = []
      let timeLimit = 1200

      const timeMatch = html.match(/const\s+TIME\s*=\s*(\d+)/i)
      if (timeMatch) {
        timeLimit = parseInt(timeMatch[1])
      }

      const jsonArrayMatch = html.match(/const\s+Q\s*=\s*(\[[\s\S]*?\]);/m)
      if (jsonArrayMatch) {
        try {
          questionsData = JSON.parse(jsonArrayMatch[1])
        } catch (e) {}
      }

      if (questionsData.length === 0) {
        const qArrayMatch = html.match(/const\s+Q\s*=\s*\[([\s\S]*?)\];/m)
        if (qArrayMatch) {
          const arrayContent = qArrayMatch[1]
          const questionRegex = /\{\s*question\s*:\s*[`'"]([\s\S]*?)[`'"]\s*,\s*options\s*:\s*\[([\s\S]*?)\]\s*,\s*correct\s*:\s*(\d+)/g
          let match
          
          while ((match = questionRegex.exec(arrayContent)) !== null) {
            const optionsStr = match[2]
            const optionMatches = optionsStr.match(/[`'"]([^`'"]*)[`'"]/g)
            const options = optionMatches ? optionMatches.map(o => o.slice(1, -1).trim()) : []
            
            if (options.length >= 2) {
              questionsData.push({
                question: match[1].trim(),
                options: options,
                correct: parseInt(match[3]),
                marks: 1,
                explanation: ""
              })
            }
          }
        }
      }

      if (questionsData.length === 0) {
        const questions = [...html.matchAll(/"question"\s*:\s*"((?:[^"\\]|\\.)*)"/gi)]
        const optionSets = [...html.matchAll(/"options"\s*:\s*\[([\s\S]*?)\]/gi)]
        const corrects = [...html.matchAll(/"correct"\s*:\s*(\d+)/gi)]
        
        for (let i = 0; i < questions.length; i++) {
          if (optionSets[i] && corrects[i]) {
            const optionsStr = optionSets[i][1]
            const optionMatches = optionsStr.match(/"((?:[^"\\]|\\.)*)"/g)
            const options = optionMatches ? optionMatches.map(o => o.slice(1, -1).trim()) : []
            
            if (options.length >= 2) {
              questionsData.push({
                question: questions[i][1].trim(),
                options: options,
                correct: parseInt(corrects[i][1]),
                marks: 1,
                explanation: ""
              })
            }
          }
        }
      }

      if (questionsData.length === 0) return null

      const questions: Question[] = questionsData.map((q: any) => ({
        id: generateId(),
        question: String(q.question || "")
          .replace(/Boss_Quiz_Robot/gi, "TechVyro")
          .replace(/LearnWithSumit/gi, "TechVyro")
          .replace(/Sumit/gi, "TechVyro"),
        options: Array.isArray(q.options) ? q.options.map((o: any) => String(o)) : ["", "", "", ""],
        correct: typeof q.correct === "number" ? q.correct : 1,
        marks: typeof q.marks === "number" ? q.marks : (q.mark ? parseInt(q.mark) : 1),
        explanation: String(q.explanation || q.solution || "")
      }))

      let category = "General"
      const lowerTitle = title.toLowerCase()
      if (lowerTitle.includes("math") || lowerTitle.includes("algebra") || lowerTitle.includes("geometry") || lowerTitle.includes("inverse") || lowerTitle.includes("trigonometric")) {
        category = "Mathematics"
      } else if (lowerTitle.includes("physics")) {
        category = "Physics"
      } else if (lowerTitle.includes("chemistry")) {
        category = "Chemistry"
      } else if (lowerTitle.includes("biology")) {
        category = "Biology"
      } else if (lowerTitle.includes("english")) {
        category = "English"
      } else if (lowerTitle.includes("nda")) {
        category = "NDA"
      } else if (lowerTitle.includes("ssc")) {
        category = "SSC"
      }

      return {
        id: generateId(),
        title,
        description: `${questions.length} questions | ${Math.floor(timeLimit / 60)} minutes`,
        category,
        timeLimit,
        questions,
        enabled: true,
        createdAt: new Date().toISOString()
      }

    } catch (e) {
      return null
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.name.endsWith('.html') && !file.name.endsWith('.htm')) {
      toast.error("Please upload an HTML file")
      return
    }

    setIsUploading(true)
    setUploadedFileName(file.name)
    setParsedPreview(null)

    try {
      const text = await file.text()
      setImportHtml(text)
      
      const quiz = parseQuizHtml(text)
      if (quiz) {
        setParsedPreview({ title: quiz.title, count: quiz.questions.length })
        toast.success(`Detected ${quiz.questions.length} questions`)
      } else {
        toast.error("Could not detect questions in this file")
      }
    } catch (e) {
      toast.error("Failed to read file")
    } finally {
      setIsUploading(false)
    }
  }

  const handleImportHtml = () => {
    const quiz = parseQuizHtml(importHtml)
    
    if (!quiz || quiz.questions.length === 0) {
      toast.error("Could not parse questions from HTML")
      return
    }

    saveQuizzes([...quizzes, quiz])
    setShowImportDialog(false)
    setImportHtml("")
    setUploadedFileName("")
    setParsedPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
    
    toast.success(`Quiz imported: "${quiz.title}" with ${quiz.questions.length} questions`)
  }

  const resetImportDialog = () => {
    setImportHtml("")
    setUploadedFileName("")
    setParsedPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const toggleExpanded = (quizId: string) => {
    setExpandedQuizzes(prev => {
      const next = new Set(prev)
      if (next.has(quizId)) next.delete(quizId)
      else next.add(quizId)
      return next
    })
  }

  const copyQuizLink = (quizId: string) => {
    const url = `${window.location.origin}/quiz/${quizId}`
    navigator.clipboard.writeText(url)
    toast.success("Quiz link copied!")
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={handleAddQuiz}>
          <Plus className="h-4 w-4 mr-2" />
          Create Quiz
        </Button>
        <Button variant="outline" onClick={() => setShowImportDialog(true)}>
          <Upload className="h-4 w-4 mr-2" />
          Import HTML
        </Button>
      </div>

      <div className="space-y-4">
        {quizzes.length === 0 ? (
          <Card className="p-8 text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">No Quizzes Yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create your first quiz or import from HTML file
            </p>
            <div className="flex justify-center gap-3">
              <Button onClick={handleAddQuiz}>Create Quiz</Button>
              <Button variant="outline" onClick={() => setShowImportDialog(true)}>
                Import HTML
              </Button>
            </div>
          </Card>
        ) : (
          quizzes.map(quiz => (
            <Collapsible 
              key={quiz.id}
              open={expandedQuizzes.has(quiz.id)}
              onOpenChange={() => toggleExpanded(quiz.id)}
            >
              <Card className={!quiz.enabled ? "opacity-60" : ""}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <CollapsibleTrigger className="flex items-center gap-2 text-left">
                      {expandedQuizzes.has(quiz.id) ? (
                        <ChevronDown className="h-5 w-5 text-muted-foreground shrink-0" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
                      )}
                      <div>
                        <CardTitle className="text-lg">{quiz.title}</CardTitle>
                        <CardDescription>{quiz.description}</CardDescription>
                      </div>
                    </CollapsibleTrigger>
                    
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline">{quiz.category}</Badge>
                      <Badge variant="secondary">
                        <Clock className="h-3 w-3 mr-1" />
                        {Math.floor(quiz.timeLimit / 60)}m
                      </Badge>
                      <Badge>{quiz.questions.length} Q</Badge>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-3 flex-wrap">
                    <Switch 
                      checked={quiz.enabled}
                      onCheckedChange={() => handleToggleQuiz(quiz.id)}
                    />
                    <span className="text-sm text-muted-foreground">
                      {quiz.enabled ? "Active" : "Disabled"}
                    </span>
                    
                    <div className="ml-auto flex items-center gap-1">
                      <Button size="sm" variant="ghost" onClick={() => copyQuizLink(quiz.id)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" asChild>
                        <a href={`/quiz/${quiz.id}`} target="_blank">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleEditQuiz(quiz)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDeleteQuiz(quiz.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CollapsibleContent>
                  <CardContent className="border-t pt-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold">Questions</h4>
                      <Button size="sm" onClick={() => handleAddQuestion(quiz.id)}>
                        <Plus className="h-4 w-4 mr-1" />
                        Add Question
                      </Button>
                    </div>

                    {quiz.questions.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No questions yet. Add your first question.
                      </p>
                    ) : (
                      <div className="space-y-2 max-h-[400px] overflow-y-auto">
                        {quiz.questions.map((q, idx) => (
                          <div 
                            key={q.id}
                            className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
                          >
                            <span className="font-bold text-primary w-8 shrink-0">
                              Q{idx + 1}
                            </span>
                            <div className="flex-1 text-sm line-clamp-1 min-w-0">
                              {q.question.replace(/<[^>]*>/g, '')}
                            </div>
                            <Badge variant="secondary" className="shrink-0">{q.marks}m</Badge>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => handleEditQuestion(quiz.id, q)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => handleDeleteQuestion(quiz.id, q.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          ))
        )}
      </div>

      {/* Quiz Dialog */}
      <Dialog open={showQuizDialog} onOpenChange={setShowQuizDialog}>
        <DialogContent className="max-w-lg w-[95vw]">
          <DialogHeader>
            <DialogTitle>
              {editingQuiz?.createdAt && quizzes.some(q => q.id === editingQuiz.id) 
                ? "Edit Quiz" 
                : "Create Quiz"}
            </DialogTitle>
          </DialogHeader>

          {editingQuiz && (
            <div className="space-y-4">
              <div>
                <Label>Title</Label>
                <Input
                  value={editingQuiz.title}
                  onChange={e => setEditingQuiz({ ...editingQuiz, title: e.target.value })}
                  placeholder="Quiz title"
                />
              </div>
              
              <div>
                <Label>Description</Label>
                <Textarea
                  value={editingQuiz.description}
                  onChange={e => setEditingQuiz({ ...editingQuiz, description: e.target.value })}
                  placeholder="Quiz description"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Category</Label>
                  <Select
                    value={editingQuiz.category}
                    onValueChange={v => setEditingQuiz({ ...editingQuiz, category: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Mathematics">Mathematics</SelectItem>
                      <SelectItem value="Physics">Physics</SelectItem>
                      <SelectItem value="Chemistry">Chemistry</SelectItem>
                      <SelectItem value="Biology">Biology</SelectItem>
                      <SelectItem value="English">English</SelectItem>
                      <SelectItem value="General">General</SelectItem>
                      <SelectItem value="NDA">NDA</SelectItem>
                      <SelectItem value="SSC">SSC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Time (minutes)</Label>
                  <Input
                    type="number"
                    value={editingQuiz.timeLimit / 60}
                    onChange={e => setEditingQuiz({ 
                      ...editingQuiz, 
                      timeLimit: parseInt(e.target.value) * 60 || 600 
                    })}
                    min={5}
                    max={180}
                  />
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowQuizDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveQuiz}>
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Question Dialog */}
      <Dialog open={showQuestionDialog} onOpenChange={setShowQuestionDialog}>
        <DialogContent className="max-w-lg w-[95vw] max-h-[85vh] flex flex-col overflow-hidden">
          <DialogHeader className="shrink-0">
            <DialogTitle>
              {editingQuestion && quizzes
                .find(q => q.id === editingQuestion.quizId)
                ?.questions.some(q => q.id === editingQuestion.question.id)
                ? "Edit Question"
                : "Add Question"}
            </DialogTitle>
          </DialogHeader>

          {editingQuestion && (
            <div className="flex-1 overflow-y-auto space-y-4 min-h-0 pr-1">
              <div>
                <Label>Question</Label>
                <Textarea
                  value={editingQuestion.question.question}
                  onChange={e => setEditingQuestion({
                    ...editingQuestion,
                    question: { ...editingQuestion.question, question: e.target.value }
                  })}
                  placeholder="Enter question..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Options</Label>
                {editingQuestion.question.options.map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="w-6 font-bold text-primary text-sm">
                      {String.fromCharCode(65 + idx)}.
                    </span>
                    <Input
                      value={opt}
                      onChange={e => {
                        const newOptions = [...editingQuestion.question.options]
                        newOptions[idx] = e.target.value
                        setEditingQuestion({
                          ...editingQuestion,
                          question: { ...editingQuestion.question, options: newOptions }
                        })
                      }}
                      placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                      className="flex-1"
                    />
                    <input
                      type="radio"
                      name="correct"
                      checked={editingQuestion.question.correct === idx + 1}
                      onChange={() => setEditingQuestion({
                        ...editingQuestion,
                        question: { ...editingQuestion.question, correct: idx + 1 }
                      })}
                      className="h-4 w-4"
                    />
                  </div>
                ))}
                <p className="text-xs text-muted-foreground">Select the correct answer</p>
              </div>

              <div>
                <Label>Marks</Label>
                <Input
                  type="number"
                  value={editingQuestion.question.marks}
                  onChange={e => setEditingQuestion({
                    ...editingQuestion,
                    question: { ...editingQuestion.question, marks: parseInt(e.target.value) || 1 }
                  })}
                  min={1}
                  max={10}
                  className="w-24"
                />
              </div>

              <div>
                <Label>Explanation (optional)</Label>
                <Textarea
                  value={editingQuestion.question.explanation}
                  onChange={e => setEditingQuestion({
                    ...editingQuestion,
                    question: { ...editingQuestion.question, explanation: e.target.value }
                  })}
                  placeholder="Explain the correct answer..."
                  rows={2}
                />
              </div>
            </div>
          )}

          <DialogFooter className="shrink-0 border-t pt-4 gap-2">
            <Button variant="outline" onClick={() => setShowQuestionDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveQuestion}>
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={showImportDialog} onOpenChange={(open) => {
        setShowImportDialog(open)
        if (!open) resetImportDialog()
      }}>
        <DialogContent className="max-w-md w-[95vw] max-h-[85vh] flex flex-col overflow-hidden">
          <DialogHeader className="shrink-0">
            <DialogTitle>Import Quiz from HTML</DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto space-y-4 min-h-0">
            <Tabs defaultValue="upload" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="upload" className="text-xs sm:text-sm">
                  <FileUp className="h-4 w-4 mr-1.5" />
                  Upload
                </TabsTrigger>
                <TabsTrigger value="paste" className="text-xs sm:text-sm">
                  <FileText className="h-4 w-4 mr-1.5" />
                  Paste
                </TabsTrigger>
              </TabsList>

              <TabsContent value="upload" className="space-y-3 mt-4">
                <div 
                  className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".html,.htm"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  
                  {isUploading ? (
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      <p className="text-sm text-muted-foreground">Processing...</p>
                    </div>
                  ) : uploadedFileName ? (
                    <div className="flex flex-col items-center gap-2">
                      <CheckCircle className="h-8 w-8 text-green-500" />
                      <p className="font-medium text-sm truncate max-w-full px-2">{uploadedFileName}</p>
                      <p className="text-xs text-muted-foreground">Click to change file</p>
                    </div>
                  ) : (
                    <>
                      <FileUp className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                      <p className="font-medium text-sm">Click to upload HTML file</p>
                      <p className="text-xs text-muted-foreground">or drag and drop</p>
                    </>
                  )}
                </div>

                {parsedPreview && (
                  <div className="p-3 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-green-700 dark:text-green-400 truncate">
                          {parsedPreview.title}
                        </p>
                        <p className="text-xs text-green-600 dark:text-green-300">
                          {parsedPreview.count} questions detected
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="paste" className="space-y-3 mt-4">
                <div>
                  <Label className="text-sm">Paste HTML Code</Label>
                  <Textarea
                    value={importHtml}
                    onChange={e => {
                      setImportHtml(e.target.value)
                      if (e.target.value.length > 100) {
                        const quiz = parseQuizHtml(e.target.value)
                        if (quiz) {
                          setParsedPreview({ title: quiz.title, count: quiz.questions.length })
                        } else {
                          setParsedPreview(null)
                        }
                      }
                    }}
                    placeholder="Paste your quiz HTML code here..."
                    rows={6}
                    className="font-mono text-xs"
                  />
                </div>

                {parsedPreview && (
                  <div className="p-3 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-green-700 dark:text-green-400 truncate">
                          {parsedPreview.title}
                        </p>
                        <p className="text-xs text-green-600 dark:text-green-300">
                          {parsedPreview.count} questions detected
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>

            <div className="bg-muted/50 rounded-lg p-3">
              <h4 className="font-medium text-sm mb-1">Auto-Detection</h4>
              <p className="text-xs text-muted-foreground">
                Extracts title, questions, options, answers, and time limit automatically. 
                Replaces external branding with TechVyro.
              </p>
            </div>
          </div>

          <DialogFooter className="shrink-0 border-t pt-4 gap-2 flex-col sm:flex-row">
            <Button variant="outline" onClick={() => setShowImportDialog(false)} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button 
              onClick={handleImportHtml} 
              disabled={!importHtml.trim() || !parsedPreview}
              className="w-full sm:w-auto"
            >
              <Upload className="h-4 w-4 mr-2" />
              Import Quiz
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
