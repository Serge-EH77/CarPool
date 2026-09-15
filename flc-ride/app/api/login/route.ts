import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import bcrypt from "bcryptjs"
import { transporter } from "@/lib/mail"  

function generateCode() {
  return String(Math.floor(100000 + Math.random() * 900000))
}

export async function POST(req: Request) {
  try {
    const { email, password, trustedDevice } = await req.json()   

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

    if (trustedDevice === true) {
      return NextResponse.json({
        success: true,
        requires2fa: false,
        user: {
          id: user.UserID,
          email: user.Email,
          role: user.Role,
          firstname: user.FirstName,
        },
      })
    }

    const code = generateCode()
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000)

    await db.query(
      "INSERT INTO twofa_codes (userId, code, expiresAt) VALUES (?, ?, ?)",
      [user.UserID, code, expiresAt]
    )
   

    await transporter.sendMail({
      to: user.Email,
      subject: "Your verification code",
      text: `Your verification code is ${code}. It expires in 5 minutes.`,
    })

    return NextResponse.json({
      success: true,
      requires2fa: true,
      userId: user.UserID,
    })
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}