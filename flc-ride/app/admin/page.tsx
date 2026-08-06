"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Car, Settings, User } from "lucide-react"
import { useRouter } from "next/navigation"

interface Passenger {
  UserId: number
  firstname: string
  lastname: string
  isAvailable: boolean
}

interface Driver {
  UserId: number
  firstname: string
  lastname: string
  isAvailable: boolean
}

export default function AdminPage() {
  const router = useRouter()
  const [allowed, setAllowed] = useState(false)

  const [passengers, setPassengers] = useState<Passenger[]>([])
  const [drivers, setDrivers] = useState<Driver[]>([])

  useEffect(() => {
    const role = localStorage.getItem("role")
    if (role === "admin") {
      setAllowed(true)
    } else {
      router.push("/")
    }
  }, [router])

  if (!allowed) return null

  async function handleLogout() {
    localStorage.removeItem("firstname")
    localStorage.removeItem("userId")
    localStorage.removeItem("role")
    router.push("/")
  }

  async function displayPassengers() {
    const res = await fetch("/api/admin/users/passengers/display")
    const data = await res.json()
    setPassengers(data.passengers)
  }

  async function displayDrivers() {
    const res = await fetch("/api/admin/users/drivers/display")
    const data = await res.json()
    setDrivers(data.drivers)
  }

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" style={{ color: "blue" }} />
            <Car className="h-5 w-5" style={{ color: "green" }} />
            <Settings className="h-5 w-5" style={{ color: "red" }} />
            <h1 className="text-2xl font-bold text-gray-900">Admin Page</h1>
          </CardTitle>
          <CardDescription>
            Manage events, ride pairing, and other configurations.
          </CardDescription>

          <div className="flex justify-end">
            <Button onClick={handleLogout} variant="outline">
              Logout
            </Button>
          </div>
        </CardHeader>
      </Card>
         <div className="flex flex-col gap-4" style={{ minHeight: "70px", justifyContent: "center", alignItems: "center" }}>
            <div className="flex items-center gap-2">
              <Button className="flex items-center gap-2">
                <User size={20} />
                <span>Manage Users</span>
              </Button>
              <Button className="flex items-center gap-2">
                <Car size={20} />
                <span>Ride Planning</span>
              </Button>
              <Button className="flex items-center gap-2">
                <Calendar size={20} />
                <span>Events Management</span>
              </Button>
            </div>
          </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" style={{ color: "blue" }} />
            Events
          </CardTitle>
          <CardDescription>Create and edit your events.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" style={{ color: "red" }} />
            Users Info
          </CardTitle>
          <CardDescription>Passengers and Drivers</CardDescription>
        </CardHeader>

        <CardContent>
          <div className="flex items-center gap-2">
            <Button onClick={displayPassengers}><h1>Passengers</h1></Button>
            <Button onClick={displayDrivers}><h1>Drivers</h1></Button>
          </div>

          {passengers.length > 0 && (
            <div className="mt-4">
              <h2 className="font-bold">Passengers</h2>
              <table style={{ width: "65%", borderCollapse: "collapse" }}>
                <thead className="bg-gray-200" style={{ borderBottom: "1px solid #ccc" }}>
                    <tr>
                    <th style={{ textAlign: "left", padding: "8px" }}>First name</th>
                    <th style={{ textAlign: "left", padding: "8px" }}>Last name</th>
                    <th style={{ textAlign: "left", padding: "8px" }}>Availability</th>
                    </tr>
                </thead>

                <tbody>
                {passengers.map((p, index) => (
                  <tr key={index}>
                    <td style={{ padding: "8px" }}>{p.firstname}</td>
                    <td style={{ padding: "8px" }}>{p.lastname}</td>
                    <td style={{ padding: "8px" }}>
                      {p.isAvailable ? "Available" : "Not Available"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

          {drivers.length > 0 && (
            <div className="mt-4">
                <h2 className="font-bold">Drivers</h2>

                <table style={{ width: "65%", borderCollapse: "collapse" }}>
                <thead className="bg-gray-200" style={{ borderBottom: "1px solid #ccc" }}>
                    <tr>
                    <th style={{ textAlign: "left", padding: "8px" }}>First name</th>
                    <th style={{ textAlign: "left", padding: "8px" }}>Last name</th>
                    <th style={{ textAlign: "left", padding: "8px" }}>Availability</th>
                    </tr>
                </thead>

                <tbody>
                    {drivers.map((d, index) => (
                    <tr key={index}>
                        <td style={{ padding: "8px" }}>{d.firstname}</td>
                        <td style={{ padding: "8px" }}>{d.lastname}</td>
                        <td style={{ padding: "8px" }}>
                        {d.isAvailable ? "Available" : "Not Available"}
                        </td>
                    </tr>
                    ))}
            </tbody>
            </table>
        </div>
        )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="h-5 w-5" style={{ color: "green" }} />
            Ride Pairing
          </CardTitle>
          <CardDescription>Match drivers and passengers.</CardDescription>

          <div className="flex gap-2 mt-2">
            <Button><h1>Available Drivers</h1></Button>
            <Button><h1>Available Passengers</h1></Button>
          </div>
        </CardHeader>
      </Card>
    </div>
  )
}