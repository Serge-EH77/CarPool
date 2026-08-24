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
  const [step, setStep] = useState<"login" | "verify">("login")
  const [code, setCode] = useState("")
  const [userId, setUserId] = useState<number | null>(null)
  const [forgotStep, setForgotStep] = useState(false)
const [forgotEmail, setForgotEmail] = useState("")

  const router = useRouter()

  
  const handleLogin = async () => {
    const trustedDevice = localStorage.getItem("trustedDevice") === "true"

    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, trustedDevice }),
    })

    const data = await res.json()

    if (!res.ok) {
      alert(data.error || "Login failed")
      return
    }

    
    if (data.requires2fa) {
      setUserId(data.userId)
      setStep("verify")
      return
    }

    localStorage.setItem("firstname", data.user.firstname)
    localStorage.setItem("userId", data.user.id)
    localStorage.setItem("role", data.user.role)

    if (data.user.role === "admin") {
      router.push("/admin")
    } else if (data.user.role === "driver") {
      router.push("/driver")
    } else if (data.user.role === "passenger") {
      router.push("/passenger")
    }

    onClose()
    onLoginSuccess?.()
  }

  
  const handleVerifyCode = async () => {
    const res = await fetch("/api/verify-2fa", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, code }),
    })

    const data = await res.json()

    if (!data.success) {
      alert(data.error || "Verification failed")
      return
    }

    
    localStorage.setItem("trustedDevice", "true")

    
    const userRes = await fetch(`/api/user?id=${userId}`)
    const userData = await userRes.json()

    localStorage.setItem("firstname", userData.user.firstname)
    localStorage.setItem("userId", userData.user.id)
    localStorage.setItem("role", userData.user.role)

    if (userData.user.role === "admin") {
      router.push("/admin")
    } else if (userData.user.role === "driver") {
      router.push("/driver")
    } else if (userData.user.role === "passenger") {
      router.push("/passenger")
    }

    onClose()
    onLoginSuccess?.()
  }
  const handleResendCode = async () => {
    const res = await fetch("/api/resend-2fa", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    })

    const data = await res.json()

    if (!data.success) {
      alert("Failed to resend code")
      return
    }

    alert("A new code has been sent to your email.")
  }

  const handleForgotPassword = async () => {
    const res = await fetch("/api/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: forgotEmail }),
    })

    const data = await res.json()

    if (!data.success) {
      alert(data.error || "Failed to send reset link")
      return
    }

    alert("A reset link has been sent to your email.")
    setForgotStep(false)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {step === "login" ? "Sign In" : "Enter Verification Code"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {step === "login" && (
            <>
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
              <Button variant="outline" onClick={() => setForgotStep(true)}>
                Forgot Password
              </Button>
            </>
          )}

          {step === "verify" && (
            <>
              <p className="text-sm text-gray-600">
                A verification code was sent to your email.
              </p>

              <Input
                placeholder="Enter 6-digit code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />

              <Button onClick={handleVerifyCode}>Verify Code</Button>
              <Button variant="outline" onClick={handleResendCode}>
                Resend Code
              </Button>
            </>
          )}
          {forgotStep && (
            <div className="space-y-3">
              <Input
                placeholder="Enter your email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
              />

              <Button onClick={handleForgotPassword}>Send Reset Link</Button>

              <Button variant="outline" onClick={() => setForgotStep(false)}>
                Back
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}