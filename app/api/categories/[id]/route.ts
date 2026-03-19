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
    
    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("id", id)

    if (error) {
      console.error("[v0] Error deleting category:", error)
      return NextResponse.json({ error: "Failed to delete category" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Category DELETE error:", error)
    return NextResponse.json({ error: "An error occurred" }, { status: 500 })
  }
}
