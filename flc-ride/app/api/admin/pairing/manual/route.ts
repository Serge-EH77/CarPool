import { NextResponse } from "next/server"
import { db } from "@/lib/db"

interface PairingUpdate {
  passengerId: number
  driverId: number
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  const pairings: PairingUpdate[] = body?.pairings

  if (!Array.isArray(pairings) || pairings.length === 0) {
    return NextResponse.json(
      { success: false, error: "Expected a non-empty 'pairings' array" },
      { status: 400 }
    )
  }

  for (const p of pairings) {
    if (!Number.isFinite(p.passengerId) || !Number.isFinite(p.driverId)) {
      return NextResponse.json(
        { success: false, error: "Each pairing needs a numeric passengerId and driverId" },
        { status: 400 }
      )
    }
  }

  
  const conn = await db.getConnection()
  try {
    await conn.beginTransaction()
    for (const p of pairings) {
      await conn.query(
        "UPDATE users SET AssignedDriverId=? WHERE UserID=? AND Role='passenger'",
        [p.driverId, p.passengerId]
      )
    }
    await conn.commit()
  } catch (err: any) {
    await conn.rollback()
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  } finally {
    conn.release()
  }

  return NextResponse.json({ success: true, updated: pairings.length })
}