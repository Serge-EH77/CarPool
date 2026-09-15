import { NextResponse } from "next/server"
import { db } from "@/lib/db"

function haversine(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 3958.8
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export async function POST() {

  const [eventRows]: any = await db.query(
    "SELECT * FROM events WHERE status='active' LIMIT 1"
  )

  if (eventRows.length === 0)
    return NextResponse.json({ error: "No live event" }, { status: 400 })

  const event = eventRows[0]


  const [driverRows]: any = await db.query(
    "SELECT UserID, FirstName, LastName, Latitude, Longitude, Capacity FROM users WHERE Role='driver' AND IsAvailable=1"
  )

  const [passengerRows]: any = await db.query(
    "SELECT UserID, FirstName, LastName, Latitude, Longitude FROM users WHERE Role='passenger' AND IsAvailable=1"
  )

  const drivers = driverRows.map((d: any) => ({
    id: d.UserID,
    name: `${d.FirstName} ${d.LastName}`,
    lat: d.Latitude,
    lng: d.Longitude,
    remaining: d.Capacity,
  }))

  const passengers = passengerRows.map((p: any) => ({
    id: p.UserID,
    name: `${p.FirstName} ${p.LastName}`,
    lat: p.Latitude,
    lng: p.Longitude,
  }))

  
  const skipped: { id: number; name: string; reason: string }[] = []

  // Build every valid (driver, passenger) candidate with its score first,
  // instead of picking a driver per-passenger as we go. Processing
  // passengers one at a time in whatever order the DB returned them meant
  // an earlier passenger could take the best driver even when a later
  // passenger needed it more — the result depended on row order. Sorting
  // all candidates once up front and assigning cheapest-first removes
  // that dependency; same haversine distances, same 0.6/0.4 weighting,
  // just an order-independent walk over them.
  interface Candidate {
    passengerIdx: number
    driverIdx: number
    dp: number
    pe: number
    score: number
  }

  const candidates: Candidate[] = []

  passengers.forEach((passenger: any, passengerIdx: number) => {
    if (passenger.lat == null || passenger.lng == null) {
      skipped.push({ id: passenger.id, name: passenger.name, reason: "Passenger has no coordinates" })
      return
    }

    const pe = haversine(passenger.lat, passenger.lng, event.Latitude, event.Longitude)
    if (isNaN(pe)) {
      skipped.push({ id: passenger.id, name: passenger.name, reason: "Could not compute distance to event" })
      return
    }

    drivers.forEach((driver: any, driverIdx: number) => {
      if (driver.lat == null || driver.lng == null) return
      const dp = haversine(passenger.lat, passenger.lng, driver.lat, driver.lng)
      if (isNaN(dp)) return

      const score = dp * 0.6 + pe * 0.4
      candidates.push({ passengerIdx, driverIdx, dp, pe, score })
    })
  })

  candidates.sort((a, b) => a.score - b.score)

  const assignedPassengers = new Set<number>()
  const remainingCapacity = drivers.map((d: any) => d.remaining)
  const pairings: any[] = []

  for (const c of candidates) {
    if (assignedPassengers.has(c.passengerIdx)) continue
    if (remainingCapacity[c.driverIdx] <= 0) continue

    const passenger = passengers[c.passengerIdx]
    const driver = drivers[c.driverIdx]

    pairings.push({
      passengerId: passenger.id,
      passengerName: passenger.name,
      driverId: driver.id,
      driverName: driver.name,
      dp: Number(c.dp.toFixed(2)),
      pe: Number(c.pe.toFixed(2)),
      score: Number(c.score.toFixed(2)),
    })

    assignedPassengers.add(c.passengerIdx)
    remainingCapacity[c.driverIdx] -= 1
  }

  // Anyone not already flagged above (missing coordinates) but still
  // unassigned ran out of drivers with remaining capacity.
 passengers.forEach((passenger: any, passengerIdx: number) => {
    const alreadyNoted = skipped.some((s) => s.id === passenger.id)
    if (!assignedPassengers.has(passengerIdx) && !alreadyNoted) {
      skipped.push({
        id: passenger.id,
        name: passenger.name,
        reason: "No available driver with remaining capacity",
      })
    }
  })

  // Persist transactionally. If one update fails partway through, none
  // of them stick, instead of leaving half the table saved.
  if (pairings.length > 0) {
    const conn = await db.getConnection()
    try {
      await conn.beginTransaction()
      for (const p of pairings) {
        await conn.query(
          "UPDATE users SET AssignedDriverId=? WHERE UserID=? AND Role='passenger' AND IsAvailable=1",
          [p.driverId, p.passengerId]
        )
      }
      await conn.commit()
    } catch (err: any) {
      await conn.rollback()
      return NextResponse.json(
        { success: false, error: `Failed to save assignments: ${err.message}` },
        { status: 500 }
      )
    } finally {
      conn.release()
    }
  }
  console.log(`Pairing run complete: ${pairings.length} assigned, ${skipped.length} skipped.`)

  return NextResponse.json({ success: true, pairings, skipped })
}