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
  const [carModel, setCarModel] = useState("")
  const [licensePlate, setLicensePlate] = useState("")

  useEffect(() => {
    if (role) {
      setCurrentRole(role)
    }
  }, [role])

  const handleRegister = () => {
    console.log("Registering as:", currentRole, {
      firstname,
      lastname,
      email,
      password,
      confirmPassword,
      phonenumber,
      carModel,
      licensePlate,
    })
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
            placeholder="Phone Number"
            value={phonenumber}
            onChange={(e) => setPhonenumber(e.target.value)}
          />
          <Input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
            </>
          ) : null}

          <Button onClick={handleRegister} className="mt-2">
            Register as {currentRole}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
