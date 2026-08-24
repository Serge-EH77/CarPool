"use client"

import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { useRouter } from "next/navigation"

export default function ResetSuccessPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="max-w-md w-full text-center">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Password Reset Successful</CardTitle>
          <CardDescription>
            Your password has been updated. You can now log in with your new credentials.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <Button className="w-full" onClick={() => router.push("/")}>
            Return to Login
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}