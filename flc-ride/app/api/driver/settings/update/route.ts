import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function POST(req: Request) {
  const body = await req.json()
  const { id, firstname, lastname, phone, car, capacity } = body

  await db.query(
    "UPDATE users SET firstname=?, lastname=?, phone=?, car=?, capacity=? WHERE UserId=?",
    [firstname, lastname, phone, car, capacity, id]
  )

  return NextResponse.json({ success: true })
}