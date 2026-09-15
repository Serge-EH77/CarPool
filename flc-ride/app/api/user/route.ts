import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get("id")

  const [rows]: any = await db.query(
    "SELECT * FROM users WHERE UserID = ? LIMIT 1",
    [id]
  )

  const user = rows[0]

  return NextResponse.json({
    user: {
      id: user.UserID,
      email: user.Email,
      role: user.Role,
      firstname: user.FirstName,
    },
  })
}