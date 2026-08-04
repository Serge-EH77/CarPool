import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
    const [rows] = await db.query("SELECT * FROM events ORDER BY EventID DESC")
    return NextResponse.json(rows)
}
