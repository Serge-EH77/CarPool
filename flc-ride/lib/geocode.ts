const ORS_API_KEY = process.env.ORS_API_KEY

export interface GeocodedPoint {
  lat: number
  lng: number
}


export async function geocodeAddress(address: string): Promise<GeocodedPoint | null> {
  if (!ORS_API_KEY) {
    throw new Error("Missing ORS_API_KEY environment variable")
  }
  if (!address || !address.trim()) return null

  const url = new URL("https://api.openrouteservice.org/geocode/search")
  url.searchParams.set("api_key", ORS_API_KEY)
  url.searchParams.set("text", address)
  url.searchParams.set("size", "1")
  

  const res = await fetch(url.toString())

  if (!res.ok) {
    console.error(`ORS geocoding failed (${res.status}) for "${address}"`)
    return null
  }

  const data = await res.json()
  const feature = data?.features?.[0]
  if (!feature) return null

  const [lng, lat] = feature.geometry.coordinates
  return { lat, lng }
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}