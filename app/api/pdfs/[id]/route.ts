import { createAdminClient } from "@/lib/supabase/admin"
import { NextResponse } from "next/server"

interface RouteProps {
  params: Promise<{ id: string }>
}

export async function DELETE(request: Request, { params }: RouteProps) {
  try {
    const { id } = await params
    
    // Verify admin token
    const authHeader = request.headers.get("Authorization")
    const token = authHeader?.replace("Bearer ", "")
    
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const adminPassword = process.env.ADMIN_PASSWORD
    if (!adminPassword) {
      return NextResponse.json({ error: "Admin not configured" }, { status: 500 })
    }

    try {
      const decoded = Buffer.from(token, "base64").toString("utf-8")
      const [storedPassword] = decoded.split(":")
      if (storedPassword !== adminPassword) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const supabase = createAdminClient()

    // Get the PDF to find the file path
    const { data: pdf, error: fetchError } = await supabase
      .from("pdfs")
      .select("file_path")
      .eq("id", id)
      .single()

    if (fetchError || !pdf) {
      return NextResponse.json({ error: "PDF not found" }, { status: 404 })
    }

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from("pdfs")
      .remove([pdf.file_path])

    if (storageError) {
      console.error("[v0] Storage delete error:", storageError)
      // Continue to delete database record even if storage fails
    }

    // Delete from database
    const { error: dbError } = await supabase
      .from("pdfs")
      .delete()
      .eq("id", id)

    if (dbError) {
      console.error("[v0] Database delete error:", dbError)
      return NextResponse.json({ error: "Failed to delete PDF" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] PDF DELETE error:", error)
    return NextResponse.json({ error: "An error occurred" }, { status: 500 })
  }
}
