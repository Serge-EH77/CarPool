import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import bcrypt from "bcryptjs"

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()

    const [rows]: any = await db.query(
      "SELECT * FROM users WHERE email = ? LIMIT 1",
      [email]
    )
    if (rows.length === 0) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 400 })
    }

    const user = rows[0]

    const match = await bcrypt.compare(password, user.Password)
    if (!match) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 400 })
    }
    return NextResponse.json({
      success: true,
      user: {
        id: user.UserID,
        email: user.Email,
        role: user.Role,
        firstname: user.FirstName,
      },
    })
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
