import { createAdminClient, isAdminConfigured } from "@/lib/supabase/admin"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization")
    const token = authHeader?.replace("Bearer ", "")

    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const adminPassword = process.env.ADMIN_PASSWORD
    if (!adminPassword) return NextResponse.json({ error: "Admin not configured" }, { status: 500 })

    try {
      const decoded = Buffer.from(token, "base64").toString("utf-8")
      const [storedPassword] = decoded.split(":")
      if (storedPassword !== adminPassword) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    if (!isAdminConfigured()) return NextResponse.json({ error: "Database not configured" }, { status: 503 })

    const body = await request.json()
    const { title, description, filePath, fileSize, categoryId, replace } = body

    if (!title?.trim()) return NextResponse.json({ error: "Title is required" }, { status: 400 })
    if (!filePath) return NextResponse.json({ error: "File path is required" }, { status: 400 })

    const supabase = createAdminClient()

    // Check for existing PDF with same title
    const { data: existingPdf } = await supabase
      .from("pdfs")
      .select("id, file_path")
      .ilike("title", title.trim())
      .single()

    if (existingPdf) {
      if (!replace) {
        // Not replacing — clean up the newly uploaded file and return error
        await supabase.storage.from("pdfs").remove([filePath])
        return NextResponse.json({ error: "A PDF with this title already exists", duplicate: true }, { status: 400 })
      }

      // Replace mode — delete the old file from storage, update DB record
      if (existingPdf.file_path && existingPdf.file_path !== filePath) {
        await supabase.storage.from("pdfs").remove([existingPdf.file_path]).catch(() => {})
      }

      const { data: updatedPdf, error: updateError } = await supabase
        .from("pdfs")
        .update({
          description: description?.trim() || null,
          file_path: filePath,
          file_size: fileSize || null,
          category_id: categoryId || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingPdf.id)
        .select()
        .single()

      if (updateError) {
        console.error("[save-metadata] Replace update error:", updateError)
        await supabase.storage.from("pdfs").remove([filePath]).catch(() => {})
        return NextResponse.json({ error: "Failed to replace PDF" }, { status: 500 })
      }

      return NextResponse.json({ pdf: updatedPdf, replaced: true })
    }

    // New PDF — insert
    const { data: pdf, error: dbError } = await supabase
      .from("pdfs")
      .insert({
        title: title.trim(),
        description: description?.trim() || null,
        file_path: filePath,
        file_size: fileSize || null,
        category_id: categoryId || null,
        view_count: 0,
      })
      .select()
      .single()

    if (dbError) {
      console.error("[save-metadata] Database insert error:", dbError)
      await supabase.storage.from("pdfs").remove([filePath]).catch(() => {})
      return NextResponse.json({ error: "Failed to save PDF metadata" }, { status: 500 })
    }

    return NextResponse.json({ pdf })
  } catch (error) {
    console.error("[save-metadata] Error:", error)
    return NextResponse.json({ error: "An error occurred" }, { status: 500 })
  }
}
