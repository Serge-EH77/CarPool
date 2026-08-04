"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Calendar, Clock, MapPin, Phone, Car, Navigation, User } from "lucide-react"
import { useRouter } from "next/navigation"


export default function AdminPage(){
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
        <div className="flex flex-col gap-4">
            <Card>
                <CardHeader>
                    <CardTitle>Admin Page</CardTitle>
                    <CardDescription>Manage your application settings and configurations.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-2">
                            <User size={20} />
                            <span>Manage Users</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Car size={20} />
                            <span>Vehicle Management</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Navigation size={20} />
                            <span>Route Planning</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Calendar size={20} />
                            <span>Schedule Management</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock size={20} />
                            <span>Time Tracking</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <MapPin size={20} />
                            <span>Location Services</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Phone size={20} />
                            <span>Contact Management</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>  
    )
}