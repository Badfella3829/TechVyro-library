"use client"

import { useState } from "react"
import { Plus, Trash2, Palette } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field"
import { toast } from "sonner"
import type { Category } from "@/lib/types"

interface CategoryManagerProps {
  categories: Category[]
  onChange: () => void
}

const PRESET_COLORS = [
  "#3B82F6", // Blue
  "#10B981", // Green
  "#8B5CF6", // Purple
  "#EC4899", // Pink
  "#F59E0B", // Amber
  "#EF4444", // Red
  "#06B6D4", // Cyan
  "#6366F1", // Indigo
]

export function CategoryManager({ categories, onChange }: CategoryManagerProps) {
  const [name, setName] = useState("")
  const [color, setColor] = useState(PRESET_COLORS[0])
  const [isAdding, setIsAdding] = useState(false)

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    
    if (!name.trim()) {
      toast.error("Please enter a category name")
      return
    }

    setIsAdding(true)

    try {
      const token = sessionStorage.getItem("admin_token")
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ name, color }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to add category")
      }

      toast.success("Category added successfully!")
      setName("")
      setColor(PRESET_COLORS[0])
      onChange()
    } catch (error) {
      console.error("[v0] Add category error:", error)
      toast.error(error instanceof Error ? error.message : "Failed to add category")
    } finally {
      setIsAdding(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this category?")) {
      return
    }

    try {
      const token = sessionStorage.getItem("admin_token")
      const response = await fetch(`/api/categories/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to delete category")
      }

      toast.success("Category deleted successfully!")
      onChange()
    } catch (error) {
      console.error("[v0] Delete category error:", error)
      toast.error(error instanceof Error ? error.message : "Failed to delete category")
    }
  }

  return (
    <div className="space-y-6">
      {/* Add Category Form */}
      <form onSubmit={handleAdd} className="space-y-4">
        <FieldGroup>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="categoryName">Category Name</FieldLabel>
              <Input
                id="categoryName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Marketing, Legal, Reports"
              />
            </Field>
            
            <Field>
              <FieldLabel>Color</FieldLabel>
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  {PRESET_COLORS.map((presetColor) => (
                    <button
                      key={presetColor}
                      type="button"
                      className={`h-8 w-8 rounded-full transition-transform hover:scale-110 ${
                        color === presetColor ? "ring-2 ring-offset-2 ring-primary" : ""
                      }`}
                      style={{ backgroundColor: presetColor }}
                      onClick={() => setColor(presetColor)}
                    />
                  ))}
                </div>
              </div>
            </Field>
          </div>

          <Button 
            type="submit" 
            disabled={isAdding || !name.trim()}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            {isAdding ? "Adding..." : "Add Category"}
          </Button>
        </FieldGroup>
      </form>

      {/* Categories List */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-muted-foreground">
          Existing Categories ({categories.length})
        </h3>
        
        {categories.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            No categories yet. Create one above!
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <div
                key={category.id}
                className="flex items-center gap-2 rounded-lg border border-border/50 px-3 py-2 bg-card"
              >
                <Badge
                  style={{
                    backgroundColor: category.color,
                    color: "#fff",
                  }}
                >
                  {category.name}
                </Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-muted-foreground hover:text-destructive"
                  onClick={() => handleDelete(category.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
