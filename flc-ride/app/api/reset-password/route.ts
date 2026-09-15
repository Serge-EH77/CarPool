import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import bcrypt from "bcryptjs"

export async function POST(req: Request) {
  const { token, password } = await req.json()

  const [rows]: any = await db.query(
    "SELECT * FROM password_resets WHERE token = ? LIMIT 1",
    [token]
  )

  if (rows.length === 0) {
    return NextResponse.json({ error: "Invalid token" }, { status: 400 })
  }

  const record = rows[0]

  if (new Date() > new Date(record.expiresAt)) {
    return NextResponse.json({ error: "Token expired" }, { status: 400 })
  }

  const hashed = await bcrypt.hash(password, 10)

  await db.query(
    "UPDATE users SET Password = ? WHERE UserID = ?",
    [hashed, record.userId]
  )

  await db.query("DELETE FROM password_resets WHERE id = ?", [record.id])

  return NextResponse.json({ success: true })
}