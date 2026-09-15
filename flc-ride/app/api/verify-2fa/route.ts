import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function POST(req: Request) {
  const { userId, code } = await req.json()

  const [rows]: any = await db.query(
    "SELECT * FROM twofa_codes WHERE userId=? ORDER BY id DESC LIMIT 1",
    [userId]
  )

  const record = rows[0]
  if (!record) {
    return NextResponse.json({ error: "No code found" }, { status: 400 })
  }

  if (new Date() > new Date(record.expiresAt)) {
    return NextResponse.json({ error: "Code expired" }, { status: 400 })
  }

  if (record.code !== code) {
    return NextResponse.json({ error: "Invalid code" }, { status: 400 })
  }
  await db.query("DELETE FROM twofa_codes WHERE id=?", [record.id])

  return NextResponse.json({ success: true })
}