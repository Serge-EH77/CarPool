import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const userId = Number(body.userId)
    const isAvailable = body.isAvailable

    if (!Number.isInteger(userId) || userId <= 0) {
      return NextResponse.json(
        { error: "Invalid userId" },
        { status: 400 }
      )
    }

    if (typeof isAvailable !== "boolean") {
      return NextResponse.json(
        { error: "Invalid isAvailable" },
        { status: 400 }
      )
    }
 
    await db.query(
      "UPDATE users SET IsAvailable = ? WHERE UserID = ?",
      [isAvailable, userId]
    )

    return NextResponse.json({
      success: true,
      userId,
      isAvailable,
    })
  } catch (err) {
    console.error("Passenger availability error:", err)
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    )
  }
}