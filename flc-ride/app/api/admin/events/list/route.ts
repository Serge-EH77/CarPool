import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
    const [rows] = await db.query<any[]>("SELECT * FROM events ORDER BY EventID ASC")

    const normalized = rows.map((row) => ({
        id: row.EventID,
        name: row.Name,
        date: row.Date instanceof Date
            ? `${String(row.Date.getMonth() + 1).padStart(2, "0")}-${String(row.Date.getDate()).padStart(2, "0")}-${row.Date.getFullYear()}`
            : row.Date,
        time: row.Time.slice(0, 5), 
        location: row.Location,
        status: row.Status
    }))
    return NextResponse.json({ events: normalized })
}
