"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"

interface RegisterModalProps {
  open: boolean
  onClose: () => void
  role: "driver" | "passenger" | null
}

export function RegisterModal({ open, onClose, role }: RegisterModalProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
const [confirmPassword, setConfirmPassword] = useState("")

  const handleRegister = () => {
    console.log("Registering as:", role, "with:", email, password, confirmPassword)
    onClose()
  }
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Register as {role === "driver" ? "Driver" : "Passenger" }
          </DialogTitle>
        </DialogHeader>
          <div className="flex flex-col gap-4">
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

            <Button onClick={handleRegister}>Register as a {role}</Button>
          </div>
      </DialogContent>
    </Dialog>
  )
}
