import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function GET() {
  try {
    const supabase = await createClient()
    if (!supabase) return NextResponse.json({ error: "DB not configured" }, { status: 503 })

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { data, error } = await supabase
      .from("user_credits")
      .select("*")
      .eq("user_id", user.id)
      .single()

    if (error || !data) {
      // Auto-create credits record for new user
      const admin = createAdminClient()
      const referralCode = Math.random().toString(36).substring(2, 8).toUpperCase()
      const { data: created } = await admin
        .from("user_credits")
        .insert({ user_id: user.id, credits: 10, is_premium: false, referral_code: referralCode })
        .select()
        .single()
      return NextResponse.json({ credits: created })
    }

    return NextResponse.json({ credits: data })
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    if (!supabase) return NextResponse.json({ error: "DB not configured" }, { status: 503 })

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await request.json()
    const action = body.action as string

    const admin = createAdminClient()

    if (action === "use") {
      // Deduct 1 credit
      const { data: current } = await admin
        .from("user_credits")
        .select("credits, is_premium")
        .eq("user_id", user.id)
        .single()

      if (!current) return NextResponse.json({ error: "Account not found" }, { status: 404 })
      if (!current.is_premium && current.credits <= 0) {
        return NextResponse.json({ error: "No credits left", credits: 0 }, { status: 402 })
      }

      if (!current.is_premium) {
        const { data: updated } = await admin
          .from("user_credits")
          .update({ credits: current.credits - 1 })
          .eq("user_id", user.id)
          .select()
          .single()
        return NextResponse.json({ success: true, credits: updated })
      }

      return NextResponse.json({ success: true, credits: current })
    }

    if (action === "referral") {
      // Apply referral code from another user
      const code = body.code as string
      if (!code) return NextResponse.json({ error: "Code required" }, { status: 400 })

      const { data: referrer } = await admin
        .from("user_credits")
        .select("user_id, credits")
        .eq("referral_code", code.toUpperCase())
        .single()

      if (!referrer) return NextResponse.json({ error: "Invalid referral code" }, { status: 404 })
      if (referrer.user_id === user.id) return NextResponse.json({ error: "Cannot use your own code" }, { status: 400 })

      // Check not already referred
      const { data: mine } = await admin
        .from("user_credits")
        .select("referred_by, credits")
        .eq("user_id", user.id)
        .single()

      if (mine?.referred_by) return NextResponse.json({ error: "Already used a referral code" }, { status: 400 })

      // Give 5 credits to both
      await admin
        .from("user_credits")
        .update({ credits: (referrer.credits || 0) + 5 })
        .eq("user_id", referrer.user_id)

      const { data: updated } = await admin
        .from("user_credits")
        .update({ credits: (mine?.credits || 0) + 5, referred_by: code.toUpperCase() })
        .eq("user_id", user.id)
        .select()
        .single()

      return NextResponse.json({ success: true, credits: updated, bonusEarned: 5 })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
