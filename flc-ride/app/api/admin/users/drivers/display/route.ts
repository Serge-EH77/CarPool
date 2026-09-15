import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  const [rows] = await db.query<any[]>(
    "SELECT UserID, FirstName, LastName, Email, IsAvailable, Capacity FROM users WHERE role = 'driver' ORDER BY LastName ASC"
  )

 
  const normalized = rows.map((row) => ({
    UserId: row.UserID,
    firstname: row.FirstName,
    lastname: row.LastName,
    email: row.Email,
    isAvailable: Boolean(row.IsAvailable),
    capacity: row.Capacity,
  }))

  return NextResponse.json({ drivers: normalized })
}