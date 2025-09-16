"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Eye, EyeOff, CheckCircle, XCircle, User, Mail, Lock, ArrowRight, RefreshCw, Shield } from "lucide-react"

interface CaptchaData {
  question: string
  token: string
}

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    captchaAnswer: "",
  })
  const [captcha, setCaptcha] = useState<CaptchaData | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [captchaLoading, setCaptchaLoading] = useState(false)

  const router = useRouter()
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

  const validatePassword = (password: string) => {
    const requirements = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    }
    return requirements
  }

  const passwordRequirements = validatePassword(formData.password)
  const isPasswordValid = Object.values(passwordRequirements).every(Boolean)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    // Validation
    const newErrors: Record<string, string> = {}

    if (!formData.firstName.trim()) newErrors.firstName = "First name is required"
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required"
    if (!formData.email.trim()) newErrors.email = "Email is required"
    if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Please enter a valid email"
    if (!formData.password) newErrors.password = "Password is required"
    if (!isPasswordValid) newErrors.password = "Password does not meet requirements"
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }
    if (!formData.captchaAnswer) newErrors.captchaAnswer = "Please solve the math problem"

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    if (!captcha) {
      toast({
        title: "CAPTCHA required",
        description: "Please solve the math problem to continue.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
          captchaAnswer: Number.parseInt(formData.captchaAnswer),
          captchaToken: captcha.token,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Registration Successful! 🎉",
          description: data.message || "Please check your email to verify your account.",
        })
        router.push("/login?message=Please check your email to verify your account before logging in.")
      } else {
        toast({
          title: "Registration Failed",
          description: data.error || "Unable to create account. Please try again.",
          variant: "destructive",
        })

        // Reload CAPTCHA on failed attempt
        loadCaptcha()
        setFormData((prev) => ({ ...prev, captchaAnswer: "" }))
      }
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error.message || "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })

      // Reload CAPTCHA on error
      loadCaptcha()
      setFormData((prev) => ({ ...prev, captchaAnswer: "" }))
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mb-4">
            <User className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Join Our Community
          </h1>
          <p className="text-muted-foreground mt-2">Create your account to get started</p>
        </div>

        <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-sm">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl text-center">Create Account</CardTitle>
            <CardDescription className="text-center">
              Fill in your information to create your community account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                    className={errors.firstName ? "border-red-500" : ""}
                  />
                  {errors.firstName && <p className="text-sm text-red-500">{errors.firstName}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                    className={errors.lastName ? "border-red-500" : ""}
                  />
                  {errors.lastName && <p className="text-sm text-red-500">{errors.lastName}</p>}
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className={`pl-10 ${errors.email ? "border-red-500" : ""}`}
                  />
                </div>
                {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    className={`pl-10 pr-10 ${errors.password ? "border-red-500" : ""}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}

                {/* Password Requirements */}
                {formData.password && (
                  <div className="space-y-2 p-3 bg-slate-50 rounded-lg">
                    <p className="text-sm font-medium text-slate-700">Password Requirements:</p>
                    <div className="grid grid-cols-1 gap-1 text-xs">
                      <div className="flex items-center space-x-2">
                        {passwordRequirements.length ? (
                          <CheckCircle className="h-3 w-3 text-green-500" />
                        ) : (
                          <XCircle className="h-3 w-3 text-red-500" />
                        )}
                        <span className={passwordRequirements.length ? "text-green-700" : "text-red-700"}>
                          At least 8 characters
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {passwordRequirements.uppercase ? (
                          <CheckCircle className="h-3 w-3 text-green-500" />
                        ) : (
                          <XCircle className="h-3 w-3 text-red-500" />
                        )}
                        <span className={passwordRequirements.uppercase ? "text-green-700" : "text-red-700"}>
                          One uppercase letter
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {passwordRequirements.lowercase ? (
                          <CheckCircle className="h-3 w-3 text-green-500" />
                        ) : (
                          <XCircle className="h-3 w-3 text-red-500" />
                        )}
                        <span className={passwordRequirements.lowercase ? "text-green-700" : "text-red-700"}>
                          One lowercase letter
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {passwordRequirements.number ? (
                          <CheckCircle className="h-3 w-3 text-green-500" />
                        ) : (
                          <XCircle className="h-3 w-3 text-red-500" />
                        )}
                        <span className={passwordRequirements.number ? "text-green-700" : "text-red-700"}>
                          One number
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {passwordRequirements.special ? (
                          <CheckCircle className="h-3 w-3 text-green-500" />
                        ) : (
                          <XCircle className="h-3 w-3 text-red-500" />
                        )}
                        <span className={passwordRequirements.special ? "text-green-700" : "text-red-700"}>
                          One special character
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    className={`pl-10 pr-10 ${errors.confirmPassword ? "border-red-500" : ""}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword}</p>}
              </div>

              {/* CAPTCHA */}
              <div className="space-y-2">
                <Label htmlFor="captchaAnswer">
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4" />
                    <span>Security Check</span>
                  </div>
                </Label>
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
                        onChange={(e) => handleInputChange("captchaAnswer", e.target.value)}
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
                {errors.captchaAnswer && <p className="text-sm text-red-500">{errors.captchaAnswer}</p>}
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                disabled={isLoading || captchaLoading || !captcha}
              >
                {isLoading ? (
                  "Creating Account..."
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
                  Sign in here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
