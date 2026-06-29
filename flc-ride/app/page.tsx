"use client"

import { useState } from "react"
import { WelcomePage } from "@/components/WelcomePage"
import { LoginModal } from "@/components/auth/LoginModal"
import { RegisterModal } from "@/components/auth/RegisterModal"
export default function Home() {
  const [loginOpen, setLoginOpen] = useState(false)
  const [registerOpen, setRegisterOpen] = useState(false)
  const [selectedRole, setSelectedRole] = useState<"driver" | "passenger" | null>(null) 

  return (
    <>
      <WelcomePage
        onLogin={() => setLoginOpen(true)}
        onRegister={(role) => {
          setSelectedRole(role)
          setRegisterOpen(true)
        }}
      />

      <LoginModal 
        open={loginOpen} 
        onClose={() => setLoginOpen(false)} 
      />
      <RegisterModal
      open={registerOpen}
      onClose={() => setRegisterOpen(false)}
      role={selectedRole}
      />
    </>
  )
}
