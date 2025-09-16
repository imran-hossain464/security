"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, XCircle, Mail, ArrowRight, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function VerifyEmailPage() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  useEffect(() => {
    const token = searchParams.get("token")
    const email = searchParams.get("email")

    if (!token || !email) {
      setStatus("error")
      setMessage("Invalid verification link. Please check your email for the correct link.")
      return
    }

    verifyEmail(email, token)
  }, [searchParams])

  const verifyEmail = async (email: string, token: string) => {
    try {
      const response = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, token }),
      })

      const data = await response.json()

      if (response.ok) {
        setStatus("success")
        setMessage(data.message || "Email verified successfully!")
        toast({
          title: "Email Verified! ✅",
          description: "Your account has been verified. You can now log in.",
        })
      } else {
        setStatus("error")
        setMessage(data.error || "Verification failed. Please try again.")
        toast({
          title: "Verification Failed",
          description: data.error || "Verification failed. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Verification error:", error)
      setStatus("error")
      setMessage("An error occurred during verification. Please try again.")
      toast({
        title: "Verification Error",
        description: "An error occurred during verification. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950 dark:to-indigo-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600">
              {status === "loading" && <Loader2 className="h-8 w-8 text-white animate-spin" />}
              {status === "success" && <CheckCircle className="h-8 w-8 text-white" />}
              {status === "error" && <XCircle className="h-8 w-8 text-white" />}
            </div>
            <CardTitle className="text-2xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              {status === "loading" && "Verifying Email..."}
              {status === "success" && "Email Verified!"}
              {status === "error" && "Verification Failed"}
            </CardTitle>
            <CardDescription>
              {status === "loading" && "Please wait while we verify your email address."}
              {status === "success" && "Your email has been successfully verified."}
              {status === "error" && "There was a problem verifying your email."}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
              <Mail className="h-6 w-6 mx-auto mb-2 text-gray-600 dark:text-gray-400" />
              <p className="text-sm text-gray-600 dark:text-gray-400">{message}</p>
            </div>

            {status === "success" && (
              <Button
                onClick={() => router.push("/login")}
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
              >
                Continue to Login
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}

            {status === "error" && (
              <div className="space-y-2">
                <Button
                  onClick={() => router.push("/register")}
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                >
                  Register Again
                </Button>
                <Button variant="outline" onClick={() => router.push("/login")} className="w-full">
                  Back to Login
                </Button>
              </div>
            )}

            <div className="text-center text-sm">
              <Link href="/" className="text-blue-600 hover:text-blue-500 font-medium">
                ← Back to Home
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
