"use client"

import { FC, ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { HeartIcon, Car, Users, MapPin, Shield, Heart, Zap, BusIcon } from "lucide-react"
import { useState } from "react"

export interface WelcomePageProps {
  onLogin: () => void
  onRegister: (role: "driver" | "passenger") => void
}

export const WelcomePage: FC<WelcomePageProps> = ({ onLogin, onRegister }) => {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex gap-2 items-center">
            <div className="flex h-8 w-8 justify-center rounded-full bg-neutral-950 items-center">
              <BusIcon className="text-white w-5 h-11" />
            </div>
            <span className="text-lg font-semibold text-gray-900">FLCRide</span>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={onLogin}>Sign In</Button>
            <Button onClick={() => onRegister("passenger")}>Get Started</Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="px-4 sm:px-6 lg:px-4 py-0">
        <div className="mx-auto max-w-7xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl py-3.5">
            First Love Transportation
            <span className="block text-gray-900">Drive Together, Serve Together</span>
          </h1>
        </div>
      </section>

      {/* How it works */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">How It Works</h2>
            <p className="mt-4 text-lg text-gray-600">
              Simple steps to connect drivers and passengers in our church community
            </p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <StepCard icon={<Users className="h-6 w-6 text-blue-600" />} title="Register">
              Sign up as a driver or passenger to join our transportation network.
            </StepCard>

            <StepCard icon={<MapPin className="h-6 w-6 text-green-600" />} title="Get Matched">
              Coordinators match passengers with nearby drivers for each service.
            </StepCard>

            <StepCard icon={<Car className="h-6 w-6 text-purple-600" />} title="Ride Together">
              Connect with your driver, share the journey, and worship together.
            </StepCard>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-gray-50 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Why Choose FLCRide?
            </h2>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <Benefit icon={Shield} title="Safe & Trusted">
              All drivers are verified church members committed to safe transportation.
            </Benefit>

            <Benefit icon={Heart} title="Community Focused">
              Build relationships and strengthen our church community through shared rides.
            </Benefit>

            <Benefit icon={Zap} title="Easy to Use">
              Simple dashboard to manage your rides and connect with other members.
            </Benefit>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Ready to Get Started?
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Join our transportation ministry and help ensure everyone can attend church services.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" onClick={() => onRegister("passenger")} className="w-full px-8 sm:w-auto">
              <Users className="mr-2 h-5 w-5" />
              Register as a Passenger
            </Button>

            <Button size="lg" variant="outline" onClick={() => onRegister("driver")} className="w-full px-8 sm:w-auto">
              <Car className="mr-2 h-5 w-5" />
              Register as a Driver
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-8 text-center">
          <div className="flex items-center justify-center gap-2">
            <div className="flex items-center justify-center rounded-full flex-col w-14 h-14 bg-black">
              <HeartIcon className="text-white w-9 h-10" />
            </div>
          </div>
          <p className="mt-2 text-sm text-gray-600">
            Connecting our community through shared transportation
          </p>
        </div>
      </footer>
    </div>
  )
}

/* Helper Components */

interface StepCardProps {
  icon: ReactNode
  title: string
  children: ReactNode
}

const StepCard: FC<StepCardProps> = ({ icon, title, children }) => (
  <div className="rounded-lg border p-6 text-center shadow-sm">
    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
      {icon}
    </div>
    <h3 className="text-lg font-semibold">{title}</h3>
    <p className="mt-2 text-sm text-gray-600">{children}</p>
  </div>
)

interface BenefitProps {
  icon: typeof Shield
  title: string
  children: ReactNode
}

const Benefit: FC<BenefitProps> = ({ icon: Icon, title, children }) => (
  <div className="text-center">
    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
      <Icon className="h-8 w-8 text-red-900" />
    </div>
    <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
    <p className="mt-2 text-sm text-gray-600">{children}</p>
  </div>
)
