import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function POST(req: Request) {
  const { passengerId } = await req.json()

  const [[passenger]]: any = await db.query(
    "SELECT AssignedDriverId FROM users WHERE UserID=? AND Role='passenger' AND IsAvailable=1",
    [passengerId]
  )

  if (!passenger) {
    return NextResponse.json({ error: "Passenger not found" }, { status: 404 })
  }

  if (!passenger.AssignedDriverId) {
    return NextResponse.json({ assigned: false })
  }

  const [[driver]]: any = await db.query(
    "SELECT FirstName, LastName, PhoneNumber, CarModel, LicensePlate FROM users WHERE UserID=?",
    [passenger.AssignedDriverId]
  )

  const [[event]]: any = await db.query(
    "SELECT * FROM events WHERE status='active' LIMIT 1"
  )

  return NextResponse.json({
    assigned: true,
    driver,
    event
  })
}