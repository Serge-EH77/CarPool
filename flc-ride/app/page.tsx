"use client"

import { WelcomePage } from "@/components/WelcomePage"

export default function Home() {
  return (
    <WelcomePage
      onLogin={() => console.log("Login")}
      onRegister={(role) => console.log("Register as:", role)}
    />
  )
}
