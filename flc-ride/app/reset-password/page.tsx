"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const token = new URLSearchParams(window.location.search).get("token")
  const router = useRouter()

  const handleReset = async () => {
    if (password !== confirm) {
      alert("Passwords do not match")
      return
    }

    const res = await fetch("/api/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    })

    const data = await res.json()

    if (!data.success) {
      alert(data.error)
      return
    }

    router.push("reset-password/success")
  }

  return (
    <div className="p-6 max-w-lg mx-auto space-y-4">
      <h1 className="text-xl font-bold">Reset Password</h1>

      <Input
        type="password"
        placeholder="New password"
        value={password}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setPassword(e.target.value)
        }
      />

      <Input
        type="password"
        placeholder="Confirm password"
        value={confirm}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setConfirm(e.target.value)
        }
      />

      <Button onClick={handleReset}>Reset Password</Button>
    </div>
  )
}