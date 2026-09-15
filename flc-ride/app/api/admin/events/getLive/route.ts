import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const [rows] = await db.query<any[]>(
      "SELECT * FROM events WHERE Status = 'active' ORDER BY Date ASC LIMIT 1"
    )

    if (rows.length === 0) {
      return NextResponse.json({ event: null })
    }

    const row = rows[0]
    const event = {
      eventID: row.EventID,
      name: row.Name,
      date: row.Date instanceof Date
        ? `${String(row.Date.getMonth() + 1).padStart(2, "0")}-${String(row.Date.getDate()).padStart(2, "0")}-${row.Date.getFullYear()}`
        : row.Date,
      time: row.Time.slice(0, 5),
      location: row.Location,
      status: row.Status
    }

    return NextResponse.json({ event })
  } catch (err) {
    console.error("Live event fetch error:", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}