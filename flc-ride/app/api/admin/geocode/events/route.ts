import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { geocodeAddress, sleep } from "@/lib/geocode"

export async function POST(req: Request) {
  const { searchParams } = new URL(req.url)
  const dryRun = searchParams.get("dryRun") === "true"
  const force = searchParams.get("force") === "true"

  const whereClause = force ? "" : "WHERE Latitude IS NULL OR Longitude IS NULL"

  const [events]: any = await db.query(
    `SELECT EventID, Name, Location, Latitude, Longitude FROM events ${whereClause}`
  )

  const results: any[] = []
  let updated = 0

  for (const event of events) {
    if (!event.Location || !event.Location.trim()) {
      results.push({
        eventId: event.EventID,
        name: event.Name,
        location: event.Location,
        currentLat: event.Latitude,
        currentLng: event.Longitude,
        newLat: null,
        newLng: null,
        valid: false,
        error: "No location on file",
      })
      continue
    }

    let coords = null
    try {
      coords = await geocodeAddress(event.Location)
    } catch (err: any) {
      results.push({
        eventId: event.EventID,
        name: event.Name,
        location: event.Location,
        currentLat: event.Latitude,
        currentLng: event.Longitude,
        newLat: null,
        newLng: null,
        valid: false,
        error: err.message,
      })
      if (err.message.includes("ORS_API_KEY")) break
      await sleep(300)
      continue
    }

    results.push({
      eventId: event.EventID,
      name: event.Name,
      location: event.Location,
      currentLat: event.Latitude,
      currentLng: event.Longitude,
      newLat: coords?.lat ?? null,
      newLng: coords?.lng ?? null,
      valid: !!coords,
    })

    if (!dryRun && coords) {
      await db.query("UPDATE events SET Latitude=?, Longitude=? WHERE EventID=?", [
        coords.lat,
        coords.lng,
        event.EventID,
      ])
      updated++
    }

    await sleep(300)
  }

  return NextResponse.json({
    success: true,
    dryRun,
    force,
    totalChecked: events.length,
    updated,
    results,
  })
}