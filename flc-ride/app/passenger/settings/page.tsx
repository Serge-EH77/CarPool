"use client"

import { useEffect, useState } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useRouter } from "next/navigation"
import { Circle, User } from "lucide-react"
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar"


export default function PassengerSettings() {
  const router = useRouter()

  const [form, setForm] = useState({
    firstname: "",
    lastname: "",
    phonenumber: "",
    address: ""
  })

  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  })

  const [firstname, setFirstname] = useState("")
  const [lastname, setLastname] = useState("")
 

  useEffect(() => {
    const firstname = localStorage.getItem("firstname")
    if (firstname) setFirstname(firstname)
    //userProfile()
  }, [])

  async function updateProfile() {
    const id = localStorage.getItem("userId")

    const res = await fetch("/api/passenger/settings/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...form })
    })

    const data = await res.json()
    if (data.success) {
      alert("Profile updated!")
     // userProfile()
    }
  }

  async function changePassword() {
    const id = localStorage.getItem("userId")

    const res = await fetch("/api/passenger/settings/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...passwordForm })
    })

    const data = await res.json()
    if (data.success) {
      alert("Password changed!")
      setPasswordForm({
        oldPassword: "",
        newPassword: "",
        confirmPassword: ""
      })
    } else alert(data.error)
  }

  {/*async function userProfile(){
    const id = localStorage.getItem("userId")
    const res = await fetch(`/api/passenger/settings/get?id=${id}`)
    const data = await res.json()
    if (!data.user) return

    setFirstname(data.user.firstname)
    setLastname(data.user.lastname)
  }*/}

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Passenger Settings</h1>
          <p className="text-muted-foreground">
            Manage your personal information and account security.
          </p>
        </div>

        <Button variant="outline" onClick={() => router.push("/passenger")}>
          Back to Dashboard
        </Button>
      </div>

      <Separator />
      {/*<div className="flex items-center gap-4 mb-4" >
        <Avatar className="w-16 h-16 mb-4">
          <AvatarFallback>
            <User className="w-16 h-16 mb-4" />
          </AvatarFallback>
          </Avatar>
          <p>
            <strong>{firstname} {lastname}</strong> 
          </p>
      </div>*/}
      
      {/* Profile Section */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Update your personal details.</CardDescription>
        </CardHeader>

        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            placeholder="First Name"
            value={form.firstname}
            onChange={(e) => setForm({ ...form, firstname: e.target.value })}
          />

          <Input
            placeholder="Last Name"
            value={form.lastname}
            onChange={(e) => setForm({ ...form, lastname: e.target.value })}
          />

          <Input
            placeholder="Phone Number"
            value={form.phonenumber}
            onChange={(e) => setForm({ ...form, phonenumber: e.target.value })}
          />

          <Button onClick={updateProfile}>
            Save Profile
          </Button>
        </CardContent>
      </Card>

      {/* Address Section */}
      <Card>
        <CardHeader>
          <CardTitle>Home Address</CardTitle>
          <CardDescription>Your pickup location for ride assignments.</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <Input
            placeholder="Home Address"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
          />

          <Button onClick={updateProfile}>Save Address</Button>
        </CardContent>
      </Card>

      {/* Password Section */}
      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>Keep your account secure.</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <Input
            type="password"
            placeholder="Old Password"
            onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
          />

          <Input
            type="password"
            placeholder="New Password"
            onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
          />

          <Input
            type="password"
            placeholder="Confirm New Password"
            onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
          />

          <Button onClick={changePassword}>Update Password</Button>
        </CardContent>
      </Card>
    </div>
  )
}