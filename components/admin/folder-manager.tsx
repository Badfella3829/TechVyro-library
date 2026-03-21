"use client"

import { useState, useEffect } from "react"
import { 
  Folder, FolderPlus, ChevronRight, ChevronDown, Plus, Pencil, Trash2, 
  GripVertical, Check, X, Layers, FileText, Eye, EyeOff, Save,
  BookOpen, Code, Calculator, FlaskConical, Globe, Briefcase, Heart,
  Music, Camera, Palette, Cpu, Database, Server, Shield, Zap
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { toast } from "sonner"
import type { ContentFolder, ContentCategory, ContentSection } from "@/lib/types"

const ICONS = [
  { name: "Folder", icon: Folder },
  { name: "BookOpen", icon: BookOpen },
  { name: "Code", icon: Code },
  { name: "Calculator", icon: Calculator },
  { name: "FlaskConical", icon: FlaskConical },
  { name: "Globe", icon: Globe },
  { name: "Briefcase", icon: Briefcase },
  { name: "Heart", icon: Heart },
  { name: "Music", icon: Music },
  { name: "Camera", icon: Camera },
  { name: "Palette", icon: Palette },
  { name: "Cpu", icon: Cpu },
  { name: "Database", icon: Database },
  { name: "Server", icon: Server },
  { name: "Shield", icon: Shield },
  { name: "Zap", icon: Zap },
  { name: "FileText", icon: FileText },
  { name: "Layers", icon: Layers },
]

const COLORS = [
  { name: "Blue", value: "#3b82f6" },
  { name: "Green", value: "#22c55e" },
  { name: "Red", value: "#ef4444" },
  { name: "Purple", value: "#a855f7" },
  { name: "Orange", value: "#f97316" },
  { name: "Pink", value: "#ec4899" },
  { name: "Cyan", value: "#06b6d4" },
  { name: "Yellow", value: "#eab308" },
  { name: "Indigo", value: "#6366f1" },
  { name: "Teal", value: "#14b8a6" },
]

function generateId() {
  return Math.random().toString(36).substring(2, 15)
}

function getIconComponent(iconName: string) {
  const found = ICONS.find(i => i.name === iconName)
  return found ? found.icon : Folder
}

export function FolderManager() {
  const [folders, setFolders] = useState<ContentFolder[]>([])
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  
  // Dialog states
  const [folderDialog, setFolderDialog] = useState(false)
  const [categoryDialog, setCategoryDialog] = useState(false)
  const [sectionDialog, setSectionDialog] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState(false)
  
  // Edit states
  const [editingFolder, setEditingFolder] = useState<ContentFolder | null>(null)
  const [editingCategory, setEditingCategory] = useState<{ folderId: string; category: ContentCategory } | null>(null)
  const [editingSection, setEditingSection] = useState<{ folderId: string; categoryId: string; section: ContentSection } | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'folder' | 'category' | 'section'; id: string; folderId?: string; categoryId?: string } | null>(null)
  
  // Form states
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    icon: "Folder",
    color: "#3b82f6",
    pdfCount: 0
  })
  
  // Target parent for adding
  const [targetFolderId, setTargetFolderId] = useState<string>("")
  const [targetCategoryId, setTargetCategoryId] = useState<string>("")

  useEffect(() => {
    const saved = localStorage.getItem("techvyro_folders")
    if (saved) {
      try {
        setFolders(JSON.parse(saved))
      } catch (e) {
        setFolders([])
      }
    }
  }, [])

  const saveFolders = (newFolders: ContentFolder[]) => {
    setFolders(newFolders)
    localStorage.setItem("techvyro_folders", JSON.stringify(newFolders))
  }

  const toggleFolder = (id: string) => {
    const newSet = new Set(expandedFolders)
    if (newSet.has(id)) {
      newSet.delete(id)
    } else {
      newSet.add(id)
    }
    setExpandedFolders(newSet)
  }

  const toggleCategory = (id: string) => {
    const newSet = new Set(expandedCategories)
    if (newSet.has(id)) {
      newSet.delete(id)
    } else {
      newSet.add(id)
    }
    setExpandedCategories(newSet)
  }

  // FOLDER OPERATIONS
  const openAddFolder = () => {
    setEditingFolder(null)
    setFormData({ name: "", description: "", icon: "Folder", color: "#3b82f6", pdfCount: 0 })
    setFolderDialog(true)
  }

  const openEditFolder = (folder: ContentFolder) => {
    setEditingFolder(folder)
    setFormData({ 
      name: folder.name, 
      description: folder.description, 
      icon: folder.icon, 
      color: folder.color,
      pdfCount: 0
    })
    setFolderDialog(true)
  }

  const saveFolder = () => {
    if (!formData.name.trim()) {
      toast.error("Folder name is required")
      return
    }

    if (editingFolder) {
      const updated = folders.map(f => 
        f.id === editingFolder.id 
          ? { ...f, name: formData.name, description: formData.description, icon: formData.icon, color: formData.color }
          : f
      )
      saveFolders(updated)
      toast.success("Folder updated")
    } else {
      const newFolder: ContentFolder = {
        id: generateId(),
        name: formData.name,
        description: formData.description,
        icon: formData.icon,
        color: formData.color,
        categories: [],
        order: folders.length,
        enabled: true,
        createdAt: new Date().toISOString()
      }
      saveFolders([...folders, newFolder])
      toast.success("Folder created")
    }
    setFolderDialog(false)
  }

  // CATEGORY OPERATIONS
  const openAddCategory = (folderId: string) => {
    setTargetFolderId(folderId)
    setEditingCategory(null)
    setFormData({ name: "", description: "", icon: "BookOpen", color: "#22c55e", pdfCount: 0 })
    setCategoryDialog(true)
  }

  const openEditCategory = (folderId: string, category: ContentCategory) => {
    setTargetFolderId(folderId)
    setEditingCategory({ folderId, category })
    setFormData({ 
      name: category.name, 
      description: category.description, 
      icon: category.icon, 
      color: category.color,
      pdfCount: 0
    })
    setCategoryDialog(true)
  }

  const saveCategory = () => {
    if (!formData.name.trim()) {
      toast.error("Category name is required")
      return
    }

    const updated = folders.map(folder => {
      if (folder.id !== targetFolderId) return folder

      if (editingCategory) {
        return {
          ...folder,
          categories: folder.categories.map(cat =>
            cat.id === editingCategory.category.id
              ? { ...cat, name: formData.name, description: formData.description, icon: formData.icon, color: formData.color }
              : cat
          )
        }
      } else {
        const newCategory: ContentCategory = {
          id: generateId(),
          name: formData.name,
          description: formData.description,
          icon: formData.icon,
          color: formData.color,
          sections: [],
          order: folder.categories.length,
          enabled: true
        }
        return { ...folder, categories: [...folder.categories, newCategory] }
      }
    })

    saveFolders(updated)
    toast.success(editingCategory ? "Category updated" : "Category created")
    setCategoryDialog(false)
  }

  // SECTION OPERATIONS
  const openAddSection = (folderId: string, categoryId: string) => {
    setTargetFolderId(folderId)
    setTargetCategoryId(categoryId)
    setEditingSection(null)
    setFormData({ name: "", description: "", icon: "FileText", color: "#3b82f6", pdfCount: 0 })
    setSectionDialog(true)
  }

  const openEditSection = (folderId: string, categoryId: string, section: ContentSection) => {
    setTargetFolderId(folderId)
    setTargetCategoryId(categoryId)
    setEditingSection({ folderId, categoryId, section })
    setFormData({ 
      name: section.name, 
      description: section.description, 
      icon: section.icon, 
      color: "#3b82f6",
      pdfCount: section.pdfCount
    })
    setSectionDialog(true)
  }

  const saveSection = () => {
    if (!formData.name.trim()) {
      toast.error("Section name is required")
      return
    }

    const updated = folders.map(folder => {
      if (folder.id !== targetFolderId) return folder

      return {
        ...folder,
        categories: folder.categories.map(cat => {
          if (cat.id !== targetCategoryId) return cat

          if (editingSection) {
            return {
              ...cat,
              sections: cat.sections.map(sec =>
                sec.id === editingSection.section.id
                  ? { ...sec, name: formData.name, description: formData.description, icon: formData.icon, pdfCount: formData.pdfCount }
                  : sec
              )
            }
          } else {
            const newSection: ContentSection = {
              id: generateId(),
              name: formData.name,
              description: formData.description,
              icon: formData.icon,
              pdfCount: formData.pdfCount,
              order: cat.sections.length,
              enabled: true
            }
            return { ...cat, sections: [...cat.sections, newSection] }
          }
        })
      }
    })

    saveFolders(updated)
    toast.success(editingSection ? "Section updated" : "Section created")
    setSectionDialog(false)
  }

  // DELETE OPERATIONS
  const openDeleteDialog = (type: 'folder' | 'category' | 'section', id: string, folderId?: string, categoryId?: string) => {
    setDeleteTarget({ type, id, folderId, categoryId })
    setDeleteDialog(true)
  }

  const confirmDelete = () => {
    if (!deleteTarget) return

    let updated: ContentFolder[]

    if (deleteTarget.type === 'folder') {
      updated = folders.filter(f => f.id !== deleteTarget.id)
    } else if (deleteTarget.type === 'category') {
      updated = folders.map(f => 
        f.id === deleteTarget.folderId 
          ? { ...f, categories: f.categories.filter(c => c.id !== deleteTarget.id) }
          : f
      )
    } else {
      updated = folders.map(f => 
        f.id === deleteTarget.folderId 
          ? { 
              ...f, 
              categories: f.categories.map(c => 
                c.id === deleteTarget.categoryId 
                  ? { ...c, sections: c.sections.filter(s => s.id !== deleteTarget.id) }
                  : c
              )
            }
          : f
      )
    }

    saveFolders(updated)
    toast.success(`${deleteTarget.type.charAt(0).toUpperCase() + deleteTarget.type.slice(1)} deleted`)
    setDeleteDialog(false)
    setDeleteTarget(null)
  }

  // TOGGLE ENABLED
  const toggleFolderEnabled = (id: string) => {
    const updated = folders.map(f => f.id === id ? { ...f, enabled: !f.enabled } : f)
    saveFolders(updated)
  }

  const toggleCategoryEnabled = (folderId: string, categoryId: string) => {
    const updated = folders.map(f => 
      f.id === folderId 
        ? { ...f, categories: f.categories.map(c => c.id === categoryId ? { ...c, enabled: !c.enabled } : c) }
        : f
    )
    saveFolders(updated)
  }

  const toggleSectionEnabled = (folderId: string, categoryId: string, sectionId: string) => {
    const updated = folders.map(f => 
      f.id === folderId 
        ? { 
            ...f, 
            categories: f.categories.map(c => 
              c.id === categoryId 
                ? { ...c, sections: c.sections.map(s => s.id === sectionId ? { ...s, enabled: !s.enabled } : s) }
                : c
            )
          }
        : f
    )
    saveFolders(updated)
  }

  // MOVE OPERATIONS
  const moveFolder = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= folders.length) return
    
    const newFolders = [...folders]
    const temp = newFolders[index]
    newFolders[index] = newFolders[newIndex]
    newFolders[newIndex] = temp
    
    saveFolders(newFolders.map((f, i) => ({ ...f, order: i })))
  }

  const getTotalPdfs = (folder: ContentFolder) => {
    return folder.categories.reduce((acc, cat) => 
      acc + cat.sections.reduce((sAcc, sec) => sAcc + sec.pdfCount, 0), 0
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Content Structure</h2>
          <p className="text-sm text-muted-foreground">
            Manage folders, categories, and sections
          </p>
        </div>
        <Button onClick={openAddFolder} className="gap-2">
          <FolderPlus className="h-4 w-4" />
          Add Folder
        </Button>
      </div>

      {/* Folder Tree */}
      <div className="space-y-3">
        {folders.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Folder className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground text-center">No folders created yet</p>
              <p className="text-sm text-muted-foreground/70 text-center mt-1">
                Create your first folder to organize content
              </p>
              <Button onClick={openAddFolder} className="mt-4 gap-2">
                <Plus className="h-4 w-4" />
                Create Folder
              </Button>
            </CardContent>
          </Card>
        ) : (
          folders.map((folder, folderIndex) => {
            const FolderIcon = getIconComponent(folder.icon)
            const isExpanded = expandedFolders.has(folder.id)
            
            return (
              <Card key={folder.id} className={`transition-all ${!folder.enabled ? 'opacity-60' : ''}`}>
                <Collapsible open={isExpanded} onOpenChange={() => toggleFolder(folder.id)}>
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-6 w-6"
                              onClick={(e) => { e.stopPropagation(); moveFolder(folderIndex, 'up') }}
                              disabled={folderIndex === 0}
                            >
                              <GripVertical className="h-4 w-4" />
                            </Button>
                          </div>
                          {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                          <div 
                            className="h-10 w-10 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: folder.color + '20' }}
                          >
                            <FolderIcon className="h-5 w-5" style={{ color: folder.color }} />
                          </div>
                          <div>
                            <CardTitle className="text-base flex items-center gap-2">
                              {folder.name}
                              {!folder.enabled && (
                                <Badge variant="secondary" className="text-xs">Hidden</Badge>
                              )}
                            </CardTitle>
                            <CardDescription className="text-xs">
                              {folder.categories.length} categories | {getTotalPdfs(folder)} PDFs
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          <Switch 
                            checked={folder.enabled} 
                            onCheckedChange={() => toggleFolderEnabled(folder.id)}
                          />
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditFolder(folder)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => openDeleteDialog('folder', folder.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent>
                    <CardContent className="pt-0 pb-4 pl-12">
                      {/* Categories */}
                      <div className="space-y-2">
                        {folder.categories.map((category) => {
                          const CategoryIcon = getIconComponent(category.icon)
                          const isCatExpanded = expandedCategories.has(category.id)
                          
                          return (
                            <Collapsible key={category.id} open={isCatExpanded} onOpenChange={() => toggleCategory(category.id)}>
                              <div className={`border rounded-lg ${!category.enabled ? 'opacity-60' : ''}`}>
                                <CollapsibleTrigger asChild>
                                  <div className="flex items-center justify-between p-3 cursor-pointer hover:bg-muted/50 transition-colors">
                                    <div className="flex items-center gap-3">
                                      {isCatExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                      <div 
                                        className="h-8 w-8 rounded-md flex items-center justify-center"
                                        style={{ backgroundColor: category.color + '20' }}
                                      >
                                        <CategoryIcon className="h-4 w-4" style={{ color: category.color }} />
                                      </div>
                                      <div>
                                        <p className="font-medium text-sm flex items-center gap-2">
                                          {category.name}
                                          {!category.enabled && <Badge variant="secondary" className="text-[10px]">Hidden</Badge>}
                                        </p>
                                        <p className="text-xs text-muted-foreground">{category.sections.length} sections</p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                                      <Switch 
                                        checked={category.enabled} 
                                        onCheckedChange={() => toggleCategoryEnabled(folder.id, category.id)}
                                      />
                                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditCategory(folder.id, category)}>
                                        <Pencil className="h-3.5 w-3.5" />
                                      </Button>
                                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => openDeleteDialog('category', category.id, folder.id)}>
                                        <Trash2 className="h-3.5 w-3.5" />
                                      </Button>
                                    </div>
                                  </div>
                                </CollapsibleTrigger>
                                
                                <CollapsibleContent>
                                  <div className="px-3 pb-3 pl-10 space-y-1.5">
                                    {/* Sections */}
                                    {category.sections.map((section) => {
                                      const SectionIcon = getIconComponent(section.icon)
                                      
                                      return (
                                        <div 
                                          key={section.id} 
                                          className={`flex items-center justify-between p-2 rounded-md bg-muted/30 ${!section.enabled ? 'opacity-60' : ''}`}
                                        >
                                          <div className="flex items-center gap-2">
                                            <SectionIcon className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-sm">{section.name}</span>
                                            <Badge variant="outline" className="text-[10px]">{section.pdfCount} PDFs</Badge>
                                            {!section.enabled && <Badge variant="secondary" className="text-[10px]">Hidden</Badge>}
                                          </div>
                                          <div className="flex items-center gap-1">
                                            <Switch 
                                              checked={section.enabled} 
                                              onCheckedChange={() => toggleSectionEnabled(folder.id, category.id, section.id)}
                                            />
                                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => openEditSection(folder.id, category.id, section)}>
                                              <Pencil className="h-3 w-3" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => openDeleteDialog('section', section.id, folder.id, category.id)}>
                                              <Trash2 className="h-3 w-3" />
                                            </Button>
                                          </div>
                                        </div>
                                      )
                                    })}
                                    
                                    {/* Add Section Button */}
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      className="w-full mt-2 gap-2 border-dashed"
                                      onClick={() => openAddSection(folder.id, category.id)}
                                    >
                                      <Plus className="h-3.5 w-3.5" />
                                      Add Section
                                    </Button>
                                  </div>
                                </CollapsibleContent>
                              </div>
                            </Collapsible>
                          )
                        })}
                        
                        {/* Add Category Button */}
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full gap-2 border-dashed"
                          onClick={() => openAddCategory(folder.id)}
                        >
                          <Plus className="h-3.5 w-3.5" />
                          Add Category
                        </Button>
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            )
          })
        )}
      </div>

      {/* Folder Dialog */}
      <Dialog open={folderDialog} onOpenChange={setFolderDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingFolder ? "Edit Folder" : "Create Folder"}</DialogTitle>
            <DialogDescription>
              {editingFolder ? "Update folder details" : "Create a new folder to organize categories"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Folder Name</Label>
              <Input 
                value={formData.name} 
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Engineering"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea 
                value={formData.description} 
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description"
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Icon</Label>
                <Select value={formData.icon} onValueChange={(v) => setFormData({ ...formData, icon: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ICONS.map(({ name, icon: Icon }) => (
                      <SelectItem key={name} value={name}>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          {name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Color</Label>
                <Select value={formData.color} onValueChange={(v) => setFormData({ ...formData, color: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COLORS.map(({ name, value }) => (
                      <SelectItem key={value} value={value}>
                        <div className="flex items-center gap-2">
                          <div className="h-4 w-4 rounded-full" style={{ backgroundColor: value }} />
                          {name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFolderDialog(false)}>Cancel</Button>
            <Button onClick={saveFolder} className="gap-2">
              <Save className="h-4 w-4" />
              {editingFolder ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Category Dialog */}
      <Dialog open={categoryDialog} onOpenChange={setCategoryDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCategory ? "Edit Category" : "Create Category"}</DialogTitle>
            <DialogDescription>
              {editingCategory ? "Update category details" : "Create a new category inside the folder"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Category Name</Label>
              <Input 
                value={formData.name} 
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Mathematics"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea 
                value={formData.description} 
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description"
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Icon</Label>
                <Select value={formData.icon} onValueChange={(v) => setFormData({ ...formData, icon: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ICONS.map(({ name, icon: Icon }) => (
                      <SelectItem key={name} value={name}>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          {name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Color</Label>
                <Select value={formData.color} onValueChange={(v) => setFormData({ ...formData, color: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COLORS.map(({ name, value }) => (
                      <SelectItem key={value} value={value}>
                        <div className="flex items-center gap-2">
                          <div className="h-4 w-4 rounded-full" style={{ backgroundColor: value }} />
                          {name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCategoryDialog(false)}>Cancel</Button>
            <Button onClick={saveCategory} className="gap-2">
              <Save className="h-4 w-4" />
              {editingCategory ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Section Dialog */}
      <Dialog open={sectionDialog} onOpenChange={setSectionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingSection ? "Edit Section" : "Create Section"}</DialogTitle>
            <DialogDescription>
              {editingSection ? "Update section details" : "Create a new section inside the category"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Section Name</Label>
              <Input 
                value={formData.name} 
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Calculus"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea 
                value={formData.description} 
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description"
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Icon</Label>
                <Select value={formData.icon} onValueChange={(v) => setFormData({ ...formData, icon: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ICONS.map(({ name, icon: Icon }) => (
                      <SelectItem key={name} value={name}>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          {name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>PDF Count</Label>
                <Input 
                  type="number"
                  min={0}
                  value={formData.pdfCount} 
                  onChange={(e) => setFormData({ ...formData, pdfCount: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSectionDialog(false)}>Cancel</Button>
            <Button onClick={saveSection} className="gap-2">
              <Save className="h-4 w-4" />
              {editingSection ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete {deleteTarget?.type}?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. {deleteTarget?.type === 'folder' && "All categories and sections inside will also be deleted."}
              {deleteTarget?.type === 'category' && "All sections inside will also be deleted."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog(false)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
