import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import crypto from "crypto"
import { transporter } from "@/lib/mail"

export async function POST(req: Request) {
  const { email } = await req.json()

  const [rows]: any = await db.query(
    "SELECT * FROM users WHERE Email = ? LIMIT 1",
    [email]
  )

  if (rows.length === 0) {
    return NextResponse.json({ error: "Email not found" }, { status: 400 })
  }

  const user = rows[0]

  const token = crypto.randomBytes(32).toString("hex")
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000)

  await db.query(
    "INSERT INTO password_resets (userId, token, expiresAt) VALUES (?, ?, ?)",
    [user.UserID, token, expiresAt]
  )

  const resetLink = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${token}`

  await transporter.sendMail({
    to: user.Email,
    subject: "Reset your password",
    text: `Click the link to reset your password: ${resetLink}`,
  })

  return NextResponse.json({ success: true })
}