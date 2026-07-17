"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { useRouter } from "next/navigation"

interface LoginModalProps {
  open: boolean
  onClose: () => void
  onLoginSuccess?: () => void
}

export function LoginModal({ open, onClose, onLoginSuccess }: LoginModalProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const router = useRouter()

  const handleLogin = async () => {
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })
    const data = await res.json()

    if (!res.ok) {
      alert(data.error || "Login failed")
      return
    }
    localStorage.setItem("firstname", data.user.firstname)

    if (data.user.role === "admin") {
      localStorage.setItem("firstname", data.user.firstname)
      localStorage.setItem("role", data.user.role)
      router.push("/admin")
    }
    if (data.user.role === "driver") {
      router.push("/driver")
    } else if (data.user.role === "passenger") {
      router.push("/passenger")
    }
    alert("Login successful! Welcome, " + data.user.firstname)
    onClose()
    onLoginSuccess?.()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Sign In</DialogTitle>
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

          <Button onClick={handleLogin}>Sign In</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
