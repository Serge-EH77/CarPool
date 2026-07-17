"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function AdminPage() {
  const router = useRouter()
  const [allowed, setAllowed] = useState(false)

  useEffect(() => {
    const role = localStorage.getItem("role")
    if (role === "admin") {
      setAllowed(true)
    } else {
      router.push("/")
    }
  }, [router])

  if (!allowed) return null

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      {/* later: events, drivers, passengers, assignments */}
    </div>
  )
}