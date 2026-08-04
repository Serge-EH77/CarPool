"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Calendar, Clock, MapPin, Phone, Car, Navigation, User } from "lucide-react"

const useEffect = require("react").useEffect
const nextSundayService = {
  date: "Sunday, January 14, 2024",
  time: "10:00 AM – 12:00 PM",
  location: "Main Church Building",
}

const mockPassengers = [
  {
    id: 1,
    name: "Sarah Johnson",
    address: "123 Oak Street, Springfield",
    distance: "2.3 miles away",
  },
  {
    id: 2,
    name: "Michael Chen",
    address: "456 Pine Avenue, Springfield",
    distance: "1.8 miles away",
  },
  {
    id: 3,
    name: "Emma Rodriguez",
    address: "789 Maple Drive, Springfield",
    distance: "3.1 miles away",
  },
]

interface DriverPageProps {
  onLogout: () => void
}



export function DriverPage({ onLogout }: DriverPageProps) {
  const [isAvailable, setIsAvailable] = useState(false)
   const [firstname, setFirstname] = useState("")

  useEffect(() => {
  const name = localStorage.getItem("firstname")
  console.log("Loaded firstname:", name)
  if (name) setFirstname(name)
}, [])

  async function toggleDriverAvailability(value: boolean) {
    const userId = Number(localStorage.getItem("userId"))
    setIsAvailable(value)
    await fetch("/api/driver/availability", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, isAvailable: value }),
    })
  }
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Driver Dashboard</h1>
            <p className="text-gray-600">Manage your transportation assignments</p>
          </div>
          <Button onClick={onLogout} variant="outline">
            Logout
          </Button>
        </div>

        {/* Welcome Banner */}
        <div className="bg-black-600 text-black p-4 rounded-lg shadow">
          <h2 className="text-xl font-bold">
            Welcome back, {firstname}
          </h2>
        </div>

        {/* Service Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Next Sunday Service
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-sm">{nextSundayService.date}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="text-sm">{nextSundayService.time}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-500" />
                <span className="text-sm">{nextSundayService.location}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Availability Toggle */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="h-5 w-5" />
              Driver Availability
            </CardTitle>
            <CardDescription> Let us know if you're available to drive for this service</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
             <Switch
                id="availability"
                checked={isAvailable}
                onCheckedChange={(value) => toggleDriverAvailability(value)}
              />
              <label htmlFor="availability" className="text-sm font-medium">
                I'm available to drive for this service
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Assigned Passengers */}
        {isAvailable && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Assigned Passengers
                <Badge variant="secondary">{mockPassengers.length}</Badge>
              </CardTitle>
              <CardDescription>Passengers assigned to your vehicle</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockPassengers.map((passenger) => (
                  <div key={passenger.id} className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">{passenger.name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="h-3 w-3" />
                        <span>{passenger.address}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Navigation className="h-3 w-3 text-blue-500" />
                        <span className="text-sm text-blue-600">{passenger.distance}</span>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      <Phone className="mr-2 h-4 w-4" />
                      Contact
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {!isAvailable && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-gray-500">
                <Car className="mx-auto h-12 w-12 text-gray-300" />
                <h3 className="mt-2 text-sm font-medium">No assignments yet</h3>
                <p className="mt-1 text-sm">Toggle your availability to see passenger assignments</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
