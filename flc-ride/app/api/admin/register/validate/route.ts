import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const token = searchParams.get("token")

  if (!token)
    return NextResponse.json({ valid: false })

  const [rows]: any = await db.query(
    "SELECT * FROM registration_tokens WHERE Token=?",
    [token]
  )

  if (rows.length === 0)
    return NextResponse.json({ valid: false })

  const t = rows[0]

  if (t.Used)
    return NextResponse.json({ valid: false })

  if (new Date(t.ExpiresAt) < new Date())
    return NextResponse.json({ valid: false })

  return NextResponse.json({ valid: true, email: t.Email })
}