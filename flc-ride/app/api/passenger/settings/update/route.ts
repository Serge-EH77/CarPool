import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function POST(req: Request) {
  const body = await req.json()
  const { id, firstname, lastname, phonenumber, address } = body

  await db.query(
    "UPDATE users SET Firstname=?, Lastname=?, PhoneNumber=?, Address=? WHERE UserId=?",
    [firstname, lastname, phonenumber, address, id]
  )

  return NextResponse.json({ success: true })
}