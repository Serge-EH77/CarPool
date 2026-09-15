import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import crypto from "crypto"

export async function POST(req: Request) {
  const token = crypto.randomBytes(32).toString("hex")
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

  await db.query(
    "INSERT INTO registration_tokens (Token, ExpiresAt) VALUES (?, ?)",
    [token, expires]
  )

  return NextResponse.json({
    success: true,
    inviteUrl: `${process.env.NEXT_PUBLIC_BASE_URL}?token=${token}`
  })
}