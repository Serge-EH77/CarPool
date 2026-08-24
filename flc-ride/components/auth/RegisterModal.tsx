"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useEffect, useState } from "react"
import { Car, Users } from "lucide-react"

interface RegisterModalProps {
  open: boolean
  onClose: () => void
  role: "driver" | "passenger" | null
}

export function RegisterModal({ open, onClose, role }: RegisterModalProps) {
  const [currentRole, setCurrentRole] = useState<"driver" | "passenger">(
    role ?? "passenger"
  )
  const [firstname, setFirstname] = useState("")
  const [lastname, setLastname] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [phonenumber, setPhonenumber] = useState("")
  const [capacity, setCapacity] = useState ("")
  const [carModel, setCarModel] = useState("")
  const [licensePlate, setLicensePlate] = useState("")
  const [address, setAddress] = useState("")

  useEffect(() => {
    if (role) {
      setCurrentRole(role)
    }
  }, [role])

  const handleRegister = async() => {
    const validatePassword = (password: string) => {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password);
};
    if (!validatePassword(password)) {
      alert("Password must contain upper, lower, number, and be at least 8 characters");
      return;
}
    if(password !== confirmPassword){
        alert("Passwords do not match")
        return
    }
    const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json"},
        body: JSON.stringify({
            firstname,
            lastname,
            email,
            password,
            phonenumber,
            role: currentRole,
            ...(currentRole === "driver" ? { carModel, licensePlate } : {}),
            address,
            capacity,
        })
    })
    const data = await res.json()

    if(!res.ok){
        alert(data.error || "Registration failed")
        return
    }
    alert("Registration successful! Welcome, " + data.user.firstname)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Register for FLCRide</DialogTitle>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <Button
              variant={currentRole === "passenger" ? "secondary" : "outline"}
              className="w-full sm:w-auto"
              onClick={() => setCurrentRole("passenger")}
            >
              <Users className="mr-2 h-4 w-4" />
              Passenger
            </Button>
            <Button
              variant={currentRole === "driver" ? "secondary" : "outline"}
              className="w-full sm:w-auto"
              onClick={() => setCurrentRole("driver")}
            >
              <Car className="mr-2 h-4 w-4" />
              Driver
            </Button>
          </div>
        </DialogHeader>

        <div className="mt-6 flex flex-col gap-4">
          <Input
            placeholder="First Name"
            value={firstname}
            onChange={(e) => setFirstname(e.target.value)}
          />
          <Input
            placeholder="Last Name"
            value={lastname}
            onChange={(e) => setLastname(e.target.value)}
          />
          <Input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
                placeholder="Address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
          <Input
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Input
            placeholder="Confirm Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <Input 
            placeholder = "Your phone number"
            type = "tel"
            value = {phonenumber}
            onChange= {(e) => setPhonenumber(e.target.value)}
          />
          {currentRole === "driver" ? (
            <>
              <Input
                placeholder="Car Model"
                value={carModel}
                onChange={(e) => setCarModel(e.target.value)}
              />
              <Input
                placeholder="License Plate"
                value={licensePlate}
                onChange={(e) => setLicensePlate(e.target.value)}
              />
              <Input 
                placeholder = "How many people can you pick up"
                type = "number"
                value = {capacity}
                min ="1"
                onChange= {(e) => setCapacity(e.target.value)}
              />
            </>
          ) : null}
        </div>
        <Button onClick={handleRegister} className="mt-2">
            Register as {currentRole}
        </Button>
      </DialogContent>
    </Dialog>
  )
}
