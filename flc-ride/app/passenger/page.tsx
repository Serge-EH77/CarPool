"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Clock, Calendar, User, BookOpen, Phone, Car } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export default function PassengerPage() {
  const [isAvailable, setIsAvailable] = useState(false)
  const [liveEvent, setLiveEvent] = useState<any>(null)
  const [firstname, setFirstname] = useState("")
  const [assignment, setAssignment] = useState<any>(null)

  const router = useRouter()

  async function togglePassengerAvailability(value: boolean) {
    const userId = Number(localStorage.getItem("userId"))
    setIsAvailable(value)

    await fetch("/api/passenger/availability", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, isAvailable: value }),
    })

    if (value) fetchAssignment()
  }

  async function fetchLiveEvent() {
    try {
      const res = await fetch("/api/admin/events/getLive")
      const data = await res.json()
      setLiveEvent(data.event)
    } catch (error) {
      console.error("Failed to fetch live event:", error)
    }
  }

  async function fetchAssignment() {
    try {
      const passengerId = Number(localStorage.getItem("userId"))
      if (!passengerId) return

      const res = await fetch("/api/passenger/assignment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passengerId })
      })

      const data = await res.json()
      setAssignment(data)
    } catch (error) {
      console.error("Failed to fetch passenger assignment:", error)
    }
  }

  async function handleLogout() {
    localStorage.removeItem("firstname")
    localStorage.removeItem("userId")
    localStorage.removeItem("role")
    router.push("/")
  }

  useEffect(() => {
    const name = localStorage.getItem("firstname")
    if (name) setFirstname(name)

    fetchLiveEvent()
    fetchAssignment()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="mx-auto max-w-4xl space-y-6">

        {/* Header */}
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Passenger Dashboard</h1>
            <p className="text-gray-600">Your ride requests and updates</p>
          </div>
          <div className="flex items-center gap-4">
            <Button onClick={() => router.push("/passenger/settings")} variant="secondary">
              Settings
            </Button>
            <Button onClick={handleLogout} variant="outline">
              Logout
            </Button>
          </div>
        </div>

        {/* Availability */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Your Availability
            </CardTitle>
            <CardDescription>Let us know if you'll be attending this service</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Switch
                id="availability"
                checked={isAvailable}
                onCheckedChange={(value) => togglePassengerAvailability(value)}
              />
              <label htmlFor="availability" className="text-sm font-medium">
                I will be attending
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Service */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Upcoming Service
            </CardTitle>
            <CardDescription>Your next ride information</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {liveEvent ? (
              <>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <BookOpen className="h-4 w-4" />
                  <span>{liveEvent.name}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span>{liveEvent.date}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span>{liveEvent.location}</span>
                </div>

                {/* DRIVER ASSIGNMENT */}
                {assignment?.assigned ? (
                  <div className="border rounded-lg p-4 space-y-2 bg-white">
                    <h3 className="font-semibold flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Your Driver
                    </h3>

                    <p className="text-sm">
                      {assignment.driver.FirstName} {assignment.driver.LastName}
                    </p>

                    <p className="text-sm text-gray-600">
                      <Phone className="inline h-4 w-4 mr-1" />
                      {assignment.driver.PhoneNumber}
                    </p>

                    <p className="text-sm text-gray-600">
                      <Car className="inline h-4 w-4 mr-1" />
                      {assignment.driver.CarModel} ({assignment.driver.LicensePlate})
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <User className="h-4 w-4" />
                    <span>Driver details will appear once assigned</span>
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm text-gray-600">No service is scheduled at the moment.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}