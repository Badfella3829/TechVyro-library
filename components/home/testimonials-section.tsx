"use client"

import { useState, useEffect } from "react"
import { Star, Quote, ChevronLeft, ChevronRight, GraduationCap, BookOpen, Award } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

const testimonials = [
  {
    id: 1,
    name: "Rahul Sharma",
    role: "Engineering Student",
    avatar: "RS",
    rating: 5,
    text: "TechVyro has been a game-changer for my studies. Found all my semester notes and previous year papers in one place. Highly recommended!",
    course: "B.Tech CSE",
  },
  {
    id: 2,
    name: "Priya Patel",
    role: "Medical Student",
    avatar: "PP",
    rating: 5,
    text: "The quality of PDFs here is amazing. I've downloaded countless medical references and they're all well-organized. Thank you TechVyro!",
    course: "MBBS",
  },
  {
    id: 3,
    name: "Amit Kumar",
    role: "Competitive Exam Aspirant",
    avatar: "AK",
    rating: 5,
    text: "Best resource for NDA and other competitive exam materials. The daily updates keep me prepared for the latest patterns.",
    course: "NDA Preparation",
  },
  {
    id: 4,
    name: "Sneha Gupta",
    role: "Commerce Student",
    avatar: "SG",
    rating: 5,
    text: "From accounting notes to business studies, everything is available for free. The one-click download feature saves so much time!",
    course: "B.Com",
  },
  {
    id: 5,
    name: "Vikram Singh",
    role: "Class 12 Student",
    avatar: "VS",
    rating: 5,
    text: "Preparing for board exams became so much easier with TechVyro. All subjects, all chapters - everything is here!",
    course: "CBSE Class 12",
  },
]

const trustIndicators = [
  { icon: GraduationCap, label: "10,000+", subtext: "Students Helped", color: "text-blue-500", bg: "bg-blue-500/10" },
  { icon: BookOpen, label: "500+", subtext: "Quality PDFs", color: "text-green-500", bg: "bg-green-500/10" },
  { icon: Award, label: "4.9/5", subtext: "User Rating", color: "text-amber-500", bg: "bg-amber-500/10" },
  { icon: Star, label: "Daily", subtext: "New Content", color: "text-rose-500", bg: "bg-rose-500/10" },
]

export function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  useEffect(() => {
    if (!isAutoPlaying) return
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [isAutoPlaying])

  const goToNext = () => {
    setIsAutoPlaying(false)
    setCurrentIndex((prev) => (prev + 1) % testimonials.length)
  }

  const goToPrev = () => {
    setIsAutoPlaying(false)
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-muted/30 overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Star className="h-4 w-4 fill-current" />
            Student Testimonials
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-3">
            Trusted by <span className="text-primary">10,000+</span> Students
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-sm sm:text-base">
            See what students across India are saying about TechVyro PDF Library
          </p>
        </div>

        {/* Trust Indicators */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-10 sm:mb-14 max-w-3xl mx-auto">
          {trustIndicators.map((item, index) => (
            <div 
              key={index}
              className="flex flex-col items-center p-4 rounded-xl bg-card border border-border/50 hover:border-primary/30 hover:shadow-lg transition-all duration-300"
            >
              <div className={`flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl ${item.bg} mb-2`}>
                <item.icon className={`h-5 w-5 sm:h-6 sm:w-6 ${item.color}`} />
              </div>
              <p className="text-lg sm:text-xl font-bold text-foreground">{item.label}</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground">{item.subtext}</p>
            </div>
          ))}
        </div>

        {/* Testimonials Carousel */}
        <div className="relative max-w-4xl mx-auto">
          {/* Navigation Buttons */}
          <Button
            variant="outline"
            size="icon"
            className="absolute left-0 sm:-left-4 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-card shadow-lg border-border/50 hover:border-primary/50 hover:bg-primary/5"
            onClick={goToPrev}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            className="absolute right-0 sm:-right-4 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-card shadow-lg border-border/50 hover:border-primary/50 hover:bg-primary/5"
            onClick={goToNext}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>

          {/* Testimonial Card */}
          <div className="px-12 sm:px-16">
            <Card className="relative border-border/50 bg-card/80 backdrop-blur-sm overflow-hidden">
              {/* Quote decoration */}
              <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
                <Quote className="h-8 w-8 sm:h-12 sm:w-12 text-primary/10" />
              </div>
              
              <CardContent className="p-6 sm:p-8 lg:p-10">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
                  {/* Avatar */}
                  <Avatar className="h-16 w-16 sm:h-20 sm:w-20 border-4 border-primary/20 shrink-0">
                    <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground text-lg sm:text-xl font-bold">
                      {testimonials[currentIndex].avatar}
                    </AvatarFallback>
                  </Avatar>
                  
                  {/* Content */}
                  <div className="flex-1 text-center sm:text-left">
                    {/* Rating */}
                    <div className="flex items-center justify-center sm:justify-start gap-0.5 mb-3">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`h-4 w-4 sm:h-5 sm:w-5 ${
                            i < testimonials[currentIndex].rating 
                              ? "text-amber-500 fill-amber-500" 
                              : "text-muted-foreground/30"
                          }`} 
                        />
                      ))}
                    </div>
                    
                    {/* Testimonial Text */}
                    <p className="text-sm sm:text-base lg:text-lg text-foreground leading-relaxed mb-4">
                      {`"${testimonials[currentIndex].text}"`}
                    </p>
                    
                    {/* Author Info */}
                    <div>
                      <p className="font-semibold text-foreground">{testimonials[currentIndex].name}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {testimonials[currentIndex].role} • {testimonials[currentIndex].course}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Dots Navigation */}
          <div className="flex items-center justify-center gap-2 mt-6">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setIsAutoPlaying(false)
                  setCurrentIndex(index)
                }}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex 
                    ? "w-6 bg-primary" 
                    : "w-2 bg-border hover:bg-primary/50"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
