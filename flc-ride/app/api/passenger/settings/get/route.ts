import { NextResponse } from "next/server"
import { db } from "@/lib/db"

interface Passenger {
  UserId: number
  firstname: string
  lastname: string
  phone: string
  address?: string
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get("id")

  const [rows] = await db.query<any[]>(
    "SELECT * FROM users WHERE UserId=?",
    [id]
  )

  return NextResponse.json({ user: rows[0] })
}