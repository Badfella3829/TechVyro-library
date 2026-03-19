import { NextResponse } from "next/server"
import { createHash } from "crypto"

export async function POST(request: Request) {
  try {
    const { password } = await request.json()
    const adminPassword = process.env.ADMIN_PASSWORD

    if (!adminPassword) {
      return NextResponse.json(
        { error: "Admin password not configured" },
        { status: 500 }
      )
    }

    if (password !== adminPassword) {
      return NextResponse.json(
        { error: "Invalid password" },
        { status: 401 }
      )
    }

    // Create a simple token (hash of password + timestamp)
    const token = createHash("sha256")
      .update(`${adminPassword}-${Date.now()}`)
      .digest("hex")

    // Store token in memory (for demo; in production, use a proper session store)
    // For simplicity, we'll verify by checking if the token was created with the correct password
    const tokenData = Buffer.from(`${adminPassword}:${Date.now()}`).toString("base64")

    return NextResponse.json({ token: tokenData })
  } catch (error) {
    console.error("[v0] Login error:", error)
    return NextResponse.json(
      { error: "An error occurred" },
      { status: 500 }
    )
  }
}
