import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { geocodeAddress, sleep } from "@/lib/geocode"

export async function POST(req: Request) {
  const { searchParams } = new URL(req.url)
  const dryRun = searchParams.get("dryRun") === "true"
  const force = searchParams.get("force") === "true"

  const whereClause = force ? "" : "WHERE Latitude IS NULL OR Longitude IS NULL"

  const [users]: any = await db.query(
    `SELECT UserID, FirstName, LastName, Address, Latitude, Longitude FROM users ${whereClause}`
  )

  const results: any[] = []
  let updated = 0

  for (const user of users) {
    const name = `${user.FirstName} ${user.LastName}`

    if (!user.Address || !user.Address.trim()) {
      results.push({
        userId: user.UserID,
        name,
        address: user.Address,
        currentLat: user.Latitude,
        currentLng: user.Longitude,
        newLat: null,
        newLng: null,
        valid: false,
        error: "No address on file",
      })
      continue
    }

    let coords = null
    try {
      coords = await geocodeAddress(user.Address)
    } catch (err: any) {
      results.push({
        userId: user.UserID,
        name,
        address: user.Address,
        currentLat: user.Latitude,
        currentLng: user.Longitude,
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
      userId: user.UserID,
      name,
      address: user.Address,
      currentLat: user.Latitude,
      currentLng: user.Longitude,
      newLat: coords?.lat ?? null,
      newLng: coords?.lng ?? null,
      valid: !!coords,
    })

    if (!dryRun && coords) {
      await db.query("UPDATE users SET Latitude=?, Longitude=? WHERE UserID=?", [
        coords.lat,
        coords.lng,
        user.UserID,
      ])
      updated++
    }
    await sleep(300)
  }

  return NextResponse.json({
    success: true,
    dryRun,
    force,
    totalChecked: users.length,
    updated,
    results,
  })
}