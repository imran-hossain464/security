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
import { ArrowLeft, Save, Calendar } from "lucide-react"
import Link from "next/link"
import { useAppStore } from "@/lib/store"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"

const categories = [
  "Community Meeting",
  "Social Gathering",
  "Volunteer Work",
  "Educational Workshop",
  "Sports & Recreation",
  "Arts & Culture",
  "Food & Dining",
  "Health & Wellness",
  "Family & Kids",
  "Other",
]

export default function EditEventPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const { events, updateEvent, currentUser } = useAppStore()

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    date: "",
    startTime: "",
    endTime: "",
    location: "",
    maxAttendees: "",
    contactInfo: "",
  })
  const [isLoading, setIsLoading] = useState(false)

  const event = events.find((e) => e.id === params.id)

  useEffect(() => {
    if (event) {
      if (event.organizerId !== currentUser?.id) {
        toast({
          title: "Access denied",
          description: "You can only edit your own events.",
          variant: "destructive",
        })
        router.push("/dashboard/events")
        return
      }

      setFormData({
        title: event.title,
        description: event.description,
        category: event.category,
        date: format(event.date, "yyyy-MM-dd"),
        startTime: event.startTime,
        endTime: event.endTime,
        location: event.location,
        maxAttendees: event.maxAttendees?.toString() || "",
        contactInfo: event.contactInfo || "",
      })
    }
  }, [event, currentUser, router, toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!event) return

    setIsLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const updatedEvent = {
      ...event,
      ...formData,
      date: new Date(formData.date),
      maxAttendees: formData.maxAttendees ? Number.parseInt(formData.maxAttendees) : undefined,
      updatedAt: new Date(),
    }

    updateEvent(updatedEvent)

    toast({
      title: "Event updated!",
      description: "Your event has been updated successfully.",
    })

    router.push("/dashboard/events")
    setIsLoading(false)
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  if (!event) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Event not found.</p>
          <Button asChild className="mt-4">
            <Link href="/dashboard/events">Back to Events</Link>
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
              <Link href="/dashboard/events">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Events
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Edit Event</h1>
              <p className="text-muted-foreground">Update your event details</p>
            </div>
          </div>
        </div>

        <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Event Details
              </span>
            </CardTitle>
            <CardDescription>Update the information about your community event</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Event Title *
                  </label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleChange("title", e.target.value)}
                    placeholder="What's the name of your event?"
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
                  <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Date *
                  </label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleChange("date", e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="startTime"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Start Time *
                  </label>
                  <Input
                    id="startTime"
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => handleChange("startTime", e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    End Time
                  </label>
                  <Input
                    id="endTime"
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => handleChange("endTime", e.target.value)}
                  />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Location *
                  </label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleChange("location", e.target.value)}
                    placeholder="Where will the event take place?"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="maxAttendees"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Max Attendees
                  </label>
                  <Input
                    id="maxAttendees"
                    type="number"
                    value={formData.maxAttendees}
                    onChange={(e) => handleChange("maxAttendees", e.target.value)}
                    placeholder="Leave empty for unlimited"
                    min="1"
                  />
                </div>

                <div>
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
                    placeholder="How should people contact you?"
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
                    placeholder="Describe your event, what to expect, what to bring, etc."
                    rows={4}
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <Button variant="outline" asChild>
                  <Link href="/dashboard/events">Cancel</Link>
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
                      Update Event
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
