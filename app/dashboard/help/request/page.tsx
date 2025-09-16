"use client"

import type React from "react"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { MapPin, Clock, AlertTriangle, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAppStore } from "@/lib/store"
import { useToast } from "@/hooks/use-toast"

export default function RequestHelpPage() {
  const { currentUser, createHelpPost } = useAppStore()
  const { toast } = useToast()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    location: "",
    urgency: "medium",
    timeframe: "",
    isUrgent: false,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) newErrors.title = "Title is required"
    if (!formData.description.trim()) newErrors.description = "Description is required"
    if (!formData.category) newErrors.category = "Category is required"
    if (!formData.location.trim()) newErrors.location = "Location is required"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!currentUser) {
      toast({
        title: "Error",
        description: "You must be logged in to request help.",
        variant: "destructive",
      })
      return
    }

    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const helpPostData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        location: formData.location.trim(),
        authorId: currentUser.id,
        author: `${currentUser.firstName} ${currentUser.lastName}`,
        avatar: currentUser.avatar,
        status: "active" as const,
        urgency: formData.urgency as "low" | "medium" | "high",
        likes: [],
        comments: [],
        timeframe: formData.timeframe.trim() || undefined,
        isUrgent: formData.isUrgent,
      }

      await createHelpPost(helpPostData)

      toast({
        title: "Help request created! 💝",
        description: "Your help request has been posted and is now visible to the community.",
      })

      router.push("/dashboard/help")
    } catch (error) {
      console.error("Error creating help post:", error)
      toast({
        title: "Error",
        description: "Failed to create help request. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  if (!currentUser) return null

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/help">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Help Network
            </Button>
          </Link>
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-pink-500 via-rose-500 to-red-500 p-8 text-white">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <h1 className="text-3xl font-bold mb-2">Request Help 💝</h1>
            <p className="text-white/90 text-lg">Let the community know how they can help you</p>
          </div>
          <div className="absolute top-4 right-4 opacity-20">
            <div className="w-32 h-32 rounded-full bg-white/10"></div>
          </div>
        </div>

        {/* Form */}
        <Card className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl">Help Request Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">What do you need help with? *</Label>
                <Input
                  id="title"
                  placeholder="Brief title for your help request..."
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  className={errors.title ? "border-red-500" : ""}
                />
                {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Detailed Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Provide more details about what you need help with, any specific requirements, and what would be most helpful..."
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  rows={4}
                  className={errors.description ? "border-red-500" : ""}
                />
                {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                  <SelectTrigger className={errors.category ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select help category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Shopping">🛒 Shopping & Errands</SelectItem>
                    <SelectItem value="Transportation">🚗 Transportation</SelectItem>
                    <SelectItem value="Moving">📦 Moving & Heavy Lifting</SelectItem>
                    <SelectItem value="Childcare">👶 Childcare</SelectItem>
                    <SelectItem value="Technology">💻 Technology Help</SelectItem>
                    <SelectItem value="Home">🏠 Home & Garden</SelectItem>
                    <SelectItem value="Pet Care">🐕 Pet Care</SelectItem>
                    <SelectItem value="Other">🤝 Other</SelectItem>
                  </SelectContent>
                </Select>
                {errors.category && <p className="text-sm text-red-500">{errors.category}</p>}
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="location"
                    placeholder="Where do you need help? (neighborhood, address, or general area)"
                    value={formData.location}
                    onChange={(e) => handleInputChange("location", e.target.value)}
                    className={`pl-10 ${errors.location ? "border-red-500" : ""}`}
                  />
                </div>
                {errors.location && <p className="text-sm text-red-500">{errors.location}</p>}
              </div>

              {/* Urgency and Timeframe */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="urgency">Urgency Level</Label>
                  <Select value={formData.urgency} onValueChange={(value) => handleInputChange("urgency", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">🟢 Low - No rush</SelectItem>
                      <SelectItem value="medium">🟡 Medium - Within a few days</SelectItem>
                      <SelectItem value="high">🔴 High - Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timeframe">Timeframe (Optional)</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="timeframe"
                      placeholder="When do you need this help?"
                      value={formData.timeframe}
                      onChange={(e) => handleInputChange("timeframe", e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              {/* Urgent Checkbox */}
              <div className="flex items-center space-x-2 p-4 rounded-lg bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800">
                <Checkbox
                  id="isUrgent"
                  checked={formData.isUrgent}
                  onCheckedChange={(checked) => handleInputChange("isUrgent", checked as boolean)}
                />
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  <Label htmlFor="isUrgent" className="text-sm font-medium text-orange-800 dark:text-orange-200">
                    This is an urgent request that needs immediate attention
                  </Label>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex space-x-4">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
                >
                  {isSubmitting ? "Posting Request..." : "Post Help Request 💝"}
                </Button>
                <Link href="/dashboard/help">
                  <Button type="button" variant="outline" disabled={isSubmitting}>
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Help Tips */}
        <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-3 text-blue-800 dark:text-blue-200">💡 Tips for a Great Help Request</h3>
            <ul className="space-y-2 text-sm text-blue-700 dark:text-blue-300">
              <li>• Be specific about what you need help with</li>
              <li>• Include relevant details like time, location, and any special requirements</li>
              <li>• Be clear about the urgency level</li>
              <li>• Consider offering something in return (like a meal, small payment, or future help)</li>
              <li>• Be responsive to people who offer to help</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
