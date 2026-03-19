import { createAdminClient } from "@/lib/supabase/admin"
import { NextResponse } from "next/server"

interface RouteProps {
  params: Promise<{ id: string }>
}

export async function POST(request: Request, { params }: RouteProps) {
  try {
    const { id } = await params
    const supabase = createAdminClient()

    // Increment download count
    const { error } = await supabase.rpc("increment_download_count", { pdf_id: id })

    if (error) {
      // If RPC doesn't exist, do a manual update
      const { error: updateError } = await supabase
        .from("pdfs")
        .update({ download_count: supabase.rpc("increment_download_count", { pdf_id: id }) })
        .eq("id", id)

      if (updateError) {
        // Fallback: get current count and increment
        const { data: pdf } = await supabase
          .from("pdfs")
          .select("download_count")
          .eq("id", id)
          .single()

        if (pdf) {
          await supabase
            .from("pdfs")
            .update({ download_count: (pdf.download_count || 0) + 1 })
            .eq("id", id)
        }
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error incrementing download count:", error)
    return NextResponse.json({ error: "Failed to track download" }, { status: 500 })
  }
}
