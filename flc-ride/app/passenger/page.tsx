"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Clock, Calendar, User } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { useState } from "react"

interface PassengerPageProps {
  onLogout: () => void
}

export default function PassengerPage({ onLogout }: PassengerPageProps) {
  const [isAvailable, setIsAvailable] = useState(false)

  async function togglePassengerAvailability(value: boolean) {
    const userId = Number(localStorage.getItem("userId"))
    setIsAvailable(value)
    await fetch("/api/passenger/availability", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, isAvailable: value }),
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Passenger Dashboard</h1>
            <p className="text-gray-600">Your ride requests and updates</p>
          </div>
          <Button onClick={onLogout} variant="outline">
            Logout
          </Button>
        </div>

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

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Upcoming Service
            </CardTitle>
            <CardDescription>Your next ride information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="h-4 w-4" />
              <span>Sunday at 10:00 AM</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="h-4 w-4" />
              <span>Main Church Building</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <User className="h-4 w-4" />
              <span>Driver details will appear once assigned</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}