import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { token } = await request.json()
    const adminPassword = process.env.ADMIN_PASSWORD

    if (!adminPassword || !token) {
      return NextResponse.json({ valid: false })
    }

    // Decode and verify token
    try {
      const decoded = Buffer.from(token, "base64").toString("utf-8")
      const [storedPassword, timestamp] = decoded.split(":")
      
      // Check if password matches and token is less than 24 hours old
      const tokenAge = Date.now() - parseInt(timestamp, 10)
      const maxAge = 24 * 60 * 60 * 1000 // 24 hours

      if (storedPassword === adminPassword && tokenAge < maxAge) {
        return NextResponse.json({ valid: true })
      }
    } catch {
      // Invalid token format
    }

    return NextResponse.json({ valid: false })
  } catch (error) {
    console.error("[v0] Verify error:", error)
    return NextResponse.json({ valid: false })
  }
}
