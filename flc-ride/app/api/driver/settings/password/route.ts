import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import bcrypt from "bcrypt"

export async function POST(req: Request) {
  const body = await req.json()
  const { id, oldPassword, newPassword, confirmPassword } = body

  if (newPassword !== confirmPassword) {
    return NextResponse.json({ error: "Passwords do not match" }, { status: 400 })
  }

  const [rows] = await db.query<any[]>("SELECT password FROM users WHERE UserId=?", [id])
  const valid = await bcrypt.compare(oldPassword, rows[0].password)

  if (!valid) {
    return NextResponse.json({ error: "Old password incorrect" }, { status: 400 })
  }

  const hashed = await bcrypt.hash(newPassword, 10)
  await db.query("UPDATE users SET password=? WHERE UserId=?", [hashed, id])

  return NextResponse.json({ success: true })
}