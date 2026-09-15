import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { transporter } from "@/lib/mail"

function generateCode() {
  return String(Math.floor(100000 + Math.random() * 900000))
}

export async function POST(req: Request) {
  const { userId } = await req.json()

  const [rows]: any = await db.query(
    "SELECT * FROM users WHERE UserID = ? LIMIT 1",
    [userId]
  )

  if (rows.length === 0) {
    return NextResponse.json({ error: "User not found" }, { status: 400 })
  }

  const user = rows[0]

  const code = generateCode()
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000)

  await db.query(
    "INSERT INTO twofa_codes (userId, code, expiresAt) VALUES (?, ?, ?)",
    [userId, code, expiresAt]
  )

  await transporter.sendMail({
    to: user.Email,
    subject: "Your new verification code",
    text: `Your new verification code is ${code}. It expires in 5 minutes.`,
  })

  return NextResponse.json({ success: true })
}