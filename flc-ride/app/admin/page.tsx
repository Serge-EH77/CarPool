"use client"

import { useEffect, useMemo, useState } from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Calendar, Car, User, Settings, Trash2, Rocket, CircleOff, AlertTriangle } from "lucide-react"
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
  capacity: number
}
interface Event {
  id: number
  name: string
  date: string
  time: string
  location: string
  status: string
}

interface PairingResult {
  passengerId: number
  passengerName: string
  driverId: number
  driverName: string
  dp: number
  pe: number
  score: number
}

interface SkippedPassenger {
  id: number
  name: string
  reason: string
}

export default function AdminPage() {
  const router = useRouter()
  const [allowed, setAllowed] = useState(false)

  const [events, setEvents] = useState<Event[]>([])
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [passengers, setPassengers] = useState<Passenger[]>([])

  const [pairings, setPairings] = useState<PairingResult[]>([])
  const [unassignedPassengers, setUnassignedPassengers] = useState<SkippedPassenger[]>([])
  const [pairingLoading, setPairingLoading] = useState(false)
  const [pairingSaving, setPairingSaving] = useState(false)
  const [pairingDirty, setPairingDirty] = useState(false)
  const [manuallyEdited, setManuallyEdited] = useState<Set<number>>(new Set())

  const [newEvent, setNewEvent] = useState({
    Name: "",
    Date: "",
    Time: "",
    Location: ""
  })

  const driverGroups = useMemo(() => {
    const groups: { [driverId: number]: { driverName: string; passengers: PairingResult[] } } = {}

    for (const p of pairings) {
      if (!groups[p.driverId]) {
        groups[p.driverId] = { driverName: p.driverName, passengers: [] }
      }
      groups[p.driverId].passengers.push(p)
    }

    return Object.entries(groups).map(([driverId, group]) => ({
      driverId: Number(driverId),
      driverName: group.driverName,
      passengers: group.passengers,
    }))
  }, [pairings])

  
  const idleDrivers = useMemo(() => {
    if (pairings.length === 0 || drivers.length === 0) return []
    const assignedDriverIds = new Set(driverGroups.map((g) => g.driverId))
    return drivers.filter((d) => !assignedDriverIds.has(d.UserId))
  }, [drivers, driverGroups, pairings])

  async function runAutoPairing() {
    setPairingLoading(true)

    const res = await fetch("/api/admin/pairing/run", {
      method: "POST",
    })
    const data = await res.json()

    setPairingLoading(false)

    if (!data.success) {
      alert("Failed to run pairing")
      return
    }

    setPairings(data.pairings)
    setUnassignedPassengers(data.skipped || [])
    setManuallyEdited(new Set())
    setPairingDirty(false)
  }

  
  function handleReassign(passengerId: number, newDriverId: number) {
    const newDriver = drivers.find((d) => d.UserId === newDriverId)
    if (!newDriver) return

    setPairings((prev) =>
      prev.map((p) =>
        p.passengerId === passengerId
          ? {
              ...p,
              driverId: newDriver.UserId,
              driverName: `${newDriver.firstname} ${newDriver.lastname}`,
            }
          : p
      )
    )

    setManuallyEdited((prev) => new Set(prev).add(passengerId))
    setPairingDirty(true)
  }

  async function saveAllPairings() {
    setPairingSaving(true)

    const res = await fetch("/api/admin/pairing/manual", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pairings: pairings.map((p) => ({
          passengerId: p.passengerId,
          driverId: p.driverId,
        })),
      }),
    })

    const data = await res.json()
    setPairingSaving(false)

    if (!data.success) {
      alert("Failed to save pairing changes")
      return
    }

    setPairingDirty(false)
    setManuallyEdited(new Set())
    alert("Pairing changes saved")
  }

  const [openEventDialog, setOpenEventDialog] = useState(false)

  useEffect(() => {
    const role = localStorage.getItem("role")
    if (role === "admin") setAllowed(true)
    else router.push("/")
  }, [])

  if (!allowed) return null

  async function handleLogout() {
    localStorage.clear()
    router.push("/")
  }

  async function showEvents() {
    const res = await fetch("/api/admin/events/list")
    const data = await res.json()
    setEvents(data.events)
  }

  async function displayDrivers() {
    const res = await fetch("/api/admin/users/drivers/display")
    const data = await res.json()
    setDrivers(data.drivers)
  }

  async function displayPassengers() {
    const res = await fetch("/api/admin/users/passengers/display")
    const data = await res.json()
    setPassengers(data.passengers)
  }

  async function addEvent() {
    const res = await fetch("/api/admin/events/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newEvent)
    })

    const data = await res.json()

    if (data.success) {
      alert("Event added!")
      setOpenEventDialog(false)
      setNewEvent({ Name: "", Date: "", Time: "", Location: "" })
      showEvents()
    }
  }
  async function deleteEvent(){
    const res = await fetch("/api/admin/events/delete",{
      method: "POST",
      headers: { "Content-Type": "application/json" },
      
    })
  }

  async function setLive(id: number) {
    const res = await fetch("/api/admin/events/setLive", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: "active" })
    })

    const data = await res.json()
    if (data.success) {
      alert("Event is now live")
      showEvents()
    }
  }
  async function remLive(id: number) {
    const res = await fetch("/api/admin/events/remLive", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: "inactive" })
    })

    const data = await res.json()
    if (data.success) {
      showEvents()
    }
  }

  return (
      <div className="w-full max-w-7xl mx-auto px-4">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Settings className="h-6 w-6 text-red-500" />
          Admin Dashboard
        </h1>
        <Button variant="outline" onClick={handleLogout}>Logout</Button>
      </header>

      <Tabs defaultValue="events" className="max-w-6xl mx-auto">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="pairing">Pairing</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="events">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-500" />
                Events
              </CardTitle>
              <CardDescription>Manage church events</CardDescription>
            </CardHeader>

            <CardContent>
              <div className="flex gap-2 mb-4">
                <Button onClick={() => setOpenEventDialog(true)}>Add Event</Button>
                <Button onClick={showEvents}>View Events</Button>
              </div>
              {events.length > 0 && (
  <div className="overflow-x-auto">
    <table className="min-w-full border">
      <thead className="bg-gray-100">
        <tr>
          <th className="p-2">Name</th>
          <th className="p-2">Date</th>
          <th className="p-2">Time</th>
          <th className="p-2">Location</th>
          <th className="p-2">Status</th>
          <th className="p-2">Actions</th>
        </tr>
      </thead>
      <tbody>
        {events.map((event) => (
          <tr key={event.id}>
            <td className="p-2">{event.name}</td>
            <td className="p-2">{event.date}</td>
            <td className="p-2">{event.time}</td>
            <td className="p-2">{event.location}</td>
            <td className="p-2">{event.status}</td>
            <td className="p-2">
              <Button
                variant="outline"
                disabled={event.status === "active"}
                onClick={() => setLive(event.id)}
              >
                <Rocket color="green" /> Set Live
              </Button>
              <Button
                variant="outline"
                disabled={event.status === "inactive"}
                onClick={() => remLive(event.id)}
              >
                <CircleOff /> Retire Event
              </Button>
              <Button variant="outline">
                <Trash2 color="red" /> Delete Event
              </Button>
                         </td>
                          </tr>
                         ))}
                    </tbody>
                   </table>
                </div>
              )}
              
            </CardContent>
          </Card>

          <Dialog open={openEventDialog} onOpenChange={setOpenEventDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Event</DialogTitle>
              </DialogHeader>

              <div className="flex flex-col gap-3">
                <Input placeholder="Event Name" onChange={(e) => setNewEvent({ ...newEvent, Name: e.target.value })} />
                <Input type="date" onChange={(e) => setNewEvent({ ...newEvent, Date: e.target.value })} />
                <Input type="time" onChange={(e) => setNewEvent({ ...newEvent, Time: e.target.value })} />
                <Input placeholder="Location" onChange={(e) => setNewEvent({ ...newEvent, Location: e.target.value })} />
              </div>

              <DialogFooter>
                <Button onClick={addEvent}>Save</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-red-500" />
                Users
              </CardTitle>
              <CardDescription>View drivers and passengers</CardDescription>
            </CardHeader>

            <CardContent>
              <div className="flex gap-2 mb-4">
                <Button onClick={displayPassengers}>Passengers</Button>
                <Button onClick={displayDrivers}>Drivers</Button>
              </div>

              {passengers.length > 0 && (
                <table className="w-full border mb-6">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="p-2">First Name</th>
                      <th className="p-2">Last Name</th>
                      <th className="p-2">Availability</th>
                    </tr>
                  </thead>
                  <tbody>
                    {passengers.map((p) => (
                      <tr key={p.UserId}>
                        <td className="p-2">{p.firstname}</td>
                        <td className="p-2">{p.lastname}</td>
                        <td className="p-2">{p.isAvailable ? "Available" : "Not Available"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {drivers.length > 0 && (
                <table className="w-full border">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="p-2">First Name</th>
                      <th className="p-2">Last Name</th>
                      <th className="p-2">Availability</th>
                    </tr>
                  </thead>
                  <tbody>
                    {drivers.map((d) => (
                      <tr key={d.UserId}>
                        <td className="p-2">{d.firstname}</td>
                        <td className="p-2">{d.lastname}</td>
                        <td className="p-2">{d.isAvailable ? "Available" : "Not Available"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pairing">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="h-5 w-5 text-green-500" />
                Ride Pairing
              </CardTitle>
              <CardDescription>
                Automatic pairing grouped by driver — edit any passenger's driver inline, then save.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="flex gap-2 mb-4 items-center">
                <Button onClick={runAutoPairing} disabled={pairingLoading}>
                  {pairingLoading ? "Running..." : "Run Auto Pairing"}
                </Button>

                <Button
                  onClick={saveAllPairings}
                  disabled={!pairingDirty || pairingSaving}
                  variant={pairingDirty ? "default" : "outline"}
                >
                  {pairingSaving ? "Saving..." : "Save Changes"}
                </Button>

                {pairingDirty && (
                  <span className="text-sm text-amber-600">
                    Unsaved changes — click Save Changes to persist.
                  </span>
                )}
              </div>

              {driverGroups.length === 0 && (
                <p className="text-sm text-gray-500">
                  No pairings yet. Run auto pairing to generate assignments.
                </p>
              )}

              {driverGroups.map((group) => (
                <div key={group.driverId} className="border rounded-lg overflow-hidden mb-4">
                  <div className="bg-gray-100 px-3 py-2 font-semibold flex justify-between items-center">
                    <span>{group.driverName}</span>
                    <span className="text-sm text-gray-500 font-normal">
                      {group.passengers.length} passenger{group.passengers.length === 1 ? "" : "s"}
                    </span>
                  </div>

                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="p-2 text-left">Passenger</th>
                        <th className="p-2 text-left">Driver → Passenger (mi)</th>
                        <th className="p-2 text-left">Passenger → Event (mi)</th>
                        <th className="p-2 text-left">Score</th>
                        <th className="p-2 text-left">Reassign Driver</th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.passengers.map((p) => (
                        <tr
                          key={p.passengerId}
                          className={manuallyEdited.has(p.passengerId) ? "bg-amber-50" : ""}
                        >
                          <td className="p-2">
                            {p.passengerName}
                            {manuallyEdited.has(p.passengerId) && (
                              <span className="ml-2 text-xs text-amber-600 font-medium">(edited)</span>
                            )}
                          </td>
                          <td className="p-2">{p.dp}</td>
                          <td className="p-2">{p.pe}</td>
                          <td className="p-2 font-bold">{p.score}</td>
                          <td className="p-2">
                            <select
                              className="border p-1 rounded w-full"
                              value={p.driverId}
                              onChange={(e) => handleReassign(p.passengerId, Number(e.target.value))}
                            >
                              {drivers.map((d) => (
                                <option key={d.UserId} value={d.UserId}>
                                  {d.firstname} {d.lastname} (cap: {d.capacity})
                                </option>
                              ))}
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}

              
              {unassignedPassengers.length > 0 && (
                <div className="border border-amber-300 rounded-lg overflow-hidden mb-4">
                  <div className="bg-amber-50 px-3 py-2 font-semibold flex items-center gap-2 text-amber-800">
                    <AlertTriangle className="h-4 w-4" />
                    Unassigned Passengers
                    <span className="text-sm text-amber-700 font-normal">
                      ({unassignedPassengers.length})
                    </span>
                  </div>
                  <table className="w-full text-sm">
                    <thead className="bg-amber-50/50">
                      <tr>
                        <th className="p-2 text-left">Passenger</th>
                        <th className="p-2 text-left">Reason</th>
                      </tr>
                    </thead>
                    <tbody>
                      {unassignedPassengers.map((u) => (
                        <tr key={u.id}>
                          <td className="p-2">{u.name}</td>
                          <td className="p-2 text-gray-600">{u.reason}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Idle drivers — everyone from the Users tab's driver list who
                  ended up with zero passengers in this pairing result. Only
                  shows once both a pairing has run and the driver list has
                  been loaded (via Users → Drivers). */}
              {idleDrivers.length > 0 && (
                <div className="border rounded-lg overflow-hidden mb-4">
                  <div className="bg-gray-100 px-3 py-2 font-semibold flex items-center gap-2">
                    <Car className="h-4 w-4 text-gray-500" />
                    Idle Drivers
                    <span className="text-sm text-gray-500 font-normal">
                      ({idleDrivers.length})
                    </span>
                  </div>
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="p-2 text-left">Driver</th>
                        <th className="p-2 text-left">Capacity</th>
                      </tr>
                    </thead>
                    <tbody>
                      {idleDrivers.map((d) => (
                        <tr key={d.UserId}>
                          <td className="p-2">{d.firstname} {d.lastname}</td>
                          <td className="p-2 text-gray-600">{d.capacity}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
              <CardDescription>System configuration</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button
                  onClick={async () => {
                    const res = await fetch("/api/admin/geocode/users?dryRun=true", {
                      method: "POST"
                    })
                    const data = await res.json()
                    alert(`Dry Run Complete: ${data.results.length} users checked`)
                  }}
                >
                  Dry Run: Preview User Geocoding
                </Button>

                <Button
                  onClick={async () => {
                    const res = await fetch("/api/admin/geocode/users?dryRun=false", {
                      method: "POST"
                    })
                    const data = await res.json()
                    alert(`Geocoding Complete: ${data.updated} users updated`)
                  }}
                >
                  Run Geocoding Queue (Update Users)
                </Button>

                <Button
                  onClick={async () => {
                    const res = await fetch("/api/admin/geocode/events?dryRun=true", {
                      method: "POST"
                    })
                    const data = await res.json()
                    alert(`Dry Run Complete: ${data.results.length} events checked`)
                  }}
                >
                  Dry Run: Preview Event Geocoding
                </Button>

                <Button
                  onClick={async () => {
                    const res = await fetch("/api/admin/geocode/events?dryRun=false", {
                      method: "POST"
                    })
                    const data = await res.json()
                    alert(`Geocoding Complete: ${data.updated} events updated`)
                  }}
                >
                  Run Geocoding Queue (Update Events)
                </Button>
                <Button
                onClick={async () => {
                  const res = await fetch("/api/admin/register/invite", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                  })
                  const data = await res.json()

                  if (data.success) {
                    navigator.clipboard.writeText(data.inviteUrl)
                    
                  }
                }}
              >
                Generate Registration Link
              </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
  )
}