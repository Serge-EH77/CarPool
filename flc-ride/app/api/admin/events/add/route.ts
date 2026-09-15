import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const { Name, Date, Time, Location } = body

    if (!Name || !Date || !Time || !Location) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    await db.query(
      "INSERT INTO events (Name, Date, Time, Location) VALUES (?, ?, ?, ?)",
      [Name, Date, Time, Location]
    )

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Create event error:", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}