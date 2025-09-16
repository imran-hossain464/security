"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"
import { useAppStore } from "@/lib/store"
import { useToast } from "@/hooks/use-toast"

const categories = [
  "Moving & Transportation",
  "Pet Care",
  "Home & Garden",
  "Childcare",
  "Elder Care",
  "Technology Help",
  "Food & Cooking",
  "Emergency",
  "Other",
]

const urgencyLevels = [
  { value: "low", label: "Low - Can wait a few days", color: "bg-green-100 text-green-800" },
  { value: "medium", label: "Medium - Needed this week", color: "bg-yellow-100 text-yellow-800" },
  { value: "high", label: "High - Needed today", color: "bg-red-100 text-red-800" },
]

export default function EditHelpPostPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const { helpPosts, updateHelpPost, currentUser } = useAppStore()

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    urgency: "",
    location: "",
    contactInfo: "",
    timeframe: "",
  })
  const [isLoading, setIsLoading] = useState(false)

  const helpPost = helpPosts.find((post) => post.id === params.id)

  useEffect(() => {
    if (helpPost) {
      if (helpPost.authorId !== currentUser?.id) {
        toast({
          title: "Access denied",
          description: "You can only edit your own help posts.",
          variant: "destructive",
        })
        router.push("/dashboard/help")
        return
      }

      setFormData({
        title: helpPost.title,
        description: helpPost.description,
        category: helpPost.category,
        urgency: helpPost.urgency,
        location: helpPost.location,
        contactInfo: helpPost.contactInfo || "",
        timeframe: helpPost.timeframe || "",
      })
    }
  }, [helpPost, currentUser, router, toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!helpPost) return

    setIsLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const updatedPost = {
      ...helpPost,
      ...formData,
      updatedAt: new Date(),
    }

    updateHelpPost(updatedPost)

    toast({
      title: "Help post updated!",
      description: "Your help request has been updated successfully.",
    })

    router.push("/dashboard/help")
    setIsLoading(false)
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  if (!helpPost) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Help post not found.</p>
          <Button asChild className="mt-4">
            <Link href="/dashboard/help">Back to Help Posts</Link>
          </Button>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/help">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Help Posts
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Edit Help Request</h1>
              <p className="text-muted-foreground">Update your help request details</p>
            </div>
          </div>
        </div>

        <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
          <CardHeader>
            <CardTitle className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Help Request Details
            </CardTitle>
            <CardDescription>Update the information about what help you need</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Title *
                  </label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleChange("title", e.target.value)}
                    placeholder="Brief description of help needed"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category *
                  </label>
                  <Select value={formData.category} onValueChange={(value) => handleChange("category", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label htmlFor="urgency" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Urgency Level *
                  </label>
                  <Select value={formData.urgency} onValueChange={(value) => handleChange("urgency", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select urgency level" />
                    </SelectTrigger>
                    <SelectContent>
                      {urgencyLevels.map((level) => (
                        <SelectItem key={level.value} value={level.value}>
                          <div className="flex items-center space-x-2">
                            <Badge className={level.color}>{level.value.toUpperCase()}</Badge>
                            <span>{level.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Location *
                  </label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleChange("location", e.target.value)}
                    placeholder="Where is help needed?"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="timeframe"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Timeframe
                  </label>
                  <Input
                    id="timeframe"
                    value={formData.timeframe}
                    onChange={(e) => handleChange("timeframe", e.target.value)}
                    placeholder="When do you need help? (e.g., This weekend, Next Tuesday)"
                  />
                </div>

                <div className="md:col-span-2">
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Description *
                  </label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                    placeholder="Provide detailed information about what help you need..."
                    rows={4}
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label
                    htmlFor="contactInfo"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Contact Information
                  </label>
                  <Input
                    id="contactInfo"
                    value={formData.contactInfo}
                    onChange={(e) => handleChange("contactInfo", e.target.value)}
                    placeholder="How should people contact you? (phone, email, etc.)"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <Button variant="outline" asChild>
                  <Link href="/dashboard/help">Cancel</Link>
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                >
                  {isLoading ? (
                    "Updating..."
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Update Help Request
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
