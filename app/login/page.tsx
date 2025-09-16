"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Heart, Eye, EyeOff, RefreshCw, Shield } from "lucide-react"
import { useAppStore } from "@/lib/store"
import { useToast } from "@/hooks/use-toast"

interface CaptchaData {
  question: string
  token: string
}

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    captchaAnswer: "",
  })
  const [captcha, setCaptcha] = useState<CaptchaData | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [captchaLoading, setCaptchaLoading] = useState(false)
  const router = useRouter()
  const { login } = useAppStore()
  const { toast } = useToast()

  // Load CAPTCHA on component mount
  useEffect(() => {
    loadCaptcha()
  }, [])

  const loadCaptcha = async () => {
    setCaptchaLoading(true)
    try {
      const response = await fetch("/api/captcha")
      if (response.ok) {
        const data = await response.json()
        setCaptcha(data)
      } else {
        toast({
          title: "Error loading CAPTCHA",
          description: "Please refresh the page and try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("CAPTCHA loading error:", error)
      toast({
        title: "Error loading CAPTCHA",
        description: "Please refresh the page and try again.",
        variant: "destructive",
      })
    } finally {
      setCaptchaLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!captcha || !formData.captchaAnswer) {
      toast({
        title: "CAPTCHA required",
        description: "Please solve the math problem to continue.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      /*const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          captchaAnswer: Number.parseInt(formData.captchaAnswer),
          captchaToken: captcha.token,
        }),
      })*/
     const response = await fetch("/api/auth/login", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  credentials: "include", // ✅ ensure cookies are sent
  body: JSON.stringify({
    email: formData.email,
    password: formData.password,
    captchaAnswer: Number.parseInt(formData.captchaAnswer),
    captchaToken: captcha.token,
  }),
})


      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Welcome back! 👋",
          description: "You have been logged in successfully.",
        })

        // Update store with user data
        useAppStore.getState().setCurrentUser(data.user)

        router.push("/dashboard")
      } else {
        toast({
          title: "Login failed",
          description: data.error || "Invalid credentials. Please try again.",
          variant: "destructive",
        })

        // Reload CAPTCHA on failed attempt
        loadCaptcha()
        setFormData((prev) => ({ ...prev, captchaAnswer: "" }))
      }
    } catch (error) {
      console.error("Login error:", error)
      toast({
        title: "Login failed",
        description: "There was an error logging you in. Please try again.",
        variant: "destructive",
      })

      // Reload CAPTCHA on error
      loadCaptcha()
      setFormData((prev) => ({ ...prev, captchaAnswer: "" }))
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950 dark:to-indigo-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600">
              <Heart className="h-5 w-5 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Community Connect
            </span>
          </Link>
        </div>

        <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Welcome back
            </CardTitle>
            <CardDescription>Sign in to your account to continue connecting with your community</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>

              {/* CAPTCHA */}
              <div>
                <label
                  htmlFor="captchaAnswer"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4" />
                    <span>Security Check</span>
                  </div>
                </label>
                <div className="flex space-x-2">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-md border">
                      <span className="text-lg font-mono">
                        {captchaLoading ? "Loading..." : captcha?.question || "Loading..."}
                      </span>
                      <span className="text-lg">=</span>
                      <Input
                        id="captchaAnswer"
                        name="captchaAnswer"
                        type="number"
                        required
                        value={formData.captchaAnswer}
                        onChange={handleChange}
                        placeholder="?"
                        className="w-20 text-center"
                        disabled={captchaLoading}
                      />
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={loadCaptcha}
                    disabled={captchaLoading}
                    className="px-3 bg-transparent"
                  >
                    <RefreshCw className={`h-4 w-4 ${captchaLoading ? "animate-spin" : ""}`} />
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <Link href="/forgot-password" className="text-blue-600 hover:text-blue-500 font-medium">
                    Forgot your password?
                  </Link>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading || captchaLoading || !captcha}
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
              >
                {isLoading ? "Signing in..." : "Sign in"}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-gray-600 dark:text-gray-400">Don't have an account? </span>
              <Link href="/register" className="text-blue-600 hover:text-blue-500 font-medium">
                Sign up
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
