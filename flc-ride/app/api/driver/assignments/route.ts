import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function POST(req: Request) {
  const { driverId } = await req.json()

  // Get driver info
  const [[driver]]: any = await db.query(
    "SELECT UserID, FirstName, LastName, Latitude, Longitude FROM users WHERE UserID=? AND Role='driver'",
    [driverId]
  )

  if (!driver) {
    return NextResponse.json({ error: "Driver not found" }, { status: 404 })
  }

  // Get active event
  const [[event]]: any = await db.query(
    "SELECT * FROM events WHERE status='active' LIMIT 1"
  )

  // Get passengers assigned to this driver
  const [passengers]: any = await db.query(
    "SELECT UserID, FirstName, LastName, Address, Latitude, Longitude FROM users WHERE AssignedDriverId=? AND Role='passenger' AND IsAvailable=1",
    [driverId]
  )

  return NextResponse.json({
    driver,
    event,
    passengers
  })
}