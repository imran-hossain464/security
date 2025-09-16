"use client"

import { useState, useEffect } from "react"
import { useAppStore } from "@/lib/store"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Calendar, Clock, MapPin, Users, Plus, Search, Filter, Edit, Trash2, UserPlus, UserMinus } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { useToast } from "@/hooks/use-toast"

export default function EventsPage() {
  const { currentUser, events, fetchEvents, joinEvent, leaveEvent, deleteEvent } = useAppStore()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      await fetchEvents()
      setIsLoading(false)
    }
    loadData()
  }, [fetchEvents])

  // Filter events based on search and filters
  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.organizer.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || event.category === selectedCategory
    const matchesStatus = selectedStatus === "all" || event.status === selectedStatus

    return matchesSearch && matchesCategory && matchesStatus
  })

  const categories = ["Environment", "Charity", "Community", "Education", "Health", "Sports", "Other"]
  const statusOptions = ["upcoming", "ongoing", "completed", "cancelled"]

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Environment":
        return "bg-green-100 text-green-800 border-green-200"
      case "Charity":
        return "bg-red-100 text-red-800 border-red-200"
      case "Community":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "Education":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "Health":
        return "bg-pink-100 text-pink-800 border-pink-200"
      case "Sports":
        return "bg-orange-100 text-orange-800 border-orange-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "ongoing":
        return "bg-green-100 text-green-800 border-green-200"
      case "completed":
        return "bg-gray-100 text-gray-800 border-gray-200"
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const handleJoinEvent = async (eventId: string) => {
    if (!currentUser) return

    joinEvent(eventId, currentUser.id)

    toast({
      title: "Joined event! 🎉",
      description: "You have successfully joined this event.",
    })
  }

  const handleLeaveEvent = async (eventId: string) => {
    if (!currentUser) return

    leaveEvent(eventId, currentUser.id)

    toast({
      title: "Left event",
      description: "You have left this event.",
    })
  }

  const handleDeleteEvent = async (eventId: string) => {
    deleteEvent(eventId)
    toast({
      title: "Event deleted",
      description: "Your event has been successfully deleted.",
    })
  }

  const isUserAttending = (event: any) => {
    return event.attendees.some((attendee: any) => attendee.userId === currentUser?.id)
  }

  const canJoinEvent = (event: any) => {
    return (
      event.attendees.length < event.maxAttendees &&
      !isUserAttending(event) &&
      event.organizerId !== currentUser?.id &&
      event.status === "upcoming"
    )
  }

  if (!currentUser) return null

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Colorful Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 p-8 text-white">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Community Events 🎉</h1>
              <p className="text-white/90 text-lg">Discover and join events in your community</p>
            </div>
            <Link href="/dashboard/events/create">
              <Button className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                <Plus className="h-4 w-4 mr-2" />
                Create Event
              </Button>
            </Link>
          </div>
          <div className="absolute top-4 right-4 opacity-20">
            <div className="w-32 h-32 rounded-full bg-white/10"></div>
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-[140px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    {statusOptions.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Events */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">Loading events...</span>
          </div>
        ) : filteredEvents.length === 0 ? (
          <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800">
            <CardContent className="text-center py-12">
              <Calendar className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-xl font-semibold mb-2">No events found</h3>
              <p className="text-muted-foreground mb-6">
                {searchTerm || selectedCategory !== "all" || selectedStatus !== "all"
                  ? "Try adjusting your search or filters"
                  : "Be the first to create an event in your community"}
              </p>
              <Link href="/dashboard/events/create">
                <Button className="bg-gradient-to-r from-blue-500 to-indigo-600">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Event
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredEvents.map((event) => (
              <Card
                key={event.id}
                className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={event.avatar || "/placeholder.svg?height=40&width=40"}
                          alt={event.organizer}
                        />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                          {event.organizer
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-lg">{event.title}</h3>
                        <p className="text-sm text-muted-foreground">by {event.organizer}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getCategoryColor(event.category)}>{event.category}</Badge>
                      <Badge className={getStatusColor(event.status)}>{event.status}</Badge>
                      {event.organizerId === currentUser.id && (
                        <div className="flex space-x-1">
                          <Link href={`/dashboard/events/edit/${event.id}`}>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-600">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Event</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this event? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteEvent(event.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">{event.description}</p>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-2" />
                      {format(event.date, "MMM d, yyyy")}
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <Clock className="h-4 w-4 mr-2" />
                      {event.startTime} - {event.endTime}
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-2" />
                      {event.location}
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <Users className="h-4 w-4 mr-2" />
                      {event.attendees.length}/{event.maxAttendees} attending
                    </div>
                  </div>

                  {/* Attendees */}
                  {event.attendees.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Attendees:</p>
                      <div className="flex -space-x-2">
                        {event.attendees.slice(0, 5).map((attendee) => (
                          <Avatar key={attendee.userId} className="h-8 w-8 border-2 border-background">
                            <AvatarImage
                              src={attendee.avatar || "/placeholder.svg?height=32&width=32"}
                              alt={attendee.name}
                            />
                            <AvatarFallback className="text-xs bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                              {attendee.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                        {event.attendees.length > 5 && (
                          <div className="h-8 w-8 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                            <span className="text-xs font-medium">+{event.attendees.length - 5}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="text-sm text-muted-foreground">
                      Created {format(event.createdAt, "MMM d, yyyy")}
                    </div>
                    <div className="flex space-x-2">
                      {event.organizerId !== currentUser.id && (
                        <>
                          {isUserAttending(event) ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleLeaveEvent(event.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <UserMinus className="h-4 w-4 mr-1" />
                              Leave
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => handleJoinEvent(event.id)}
                              disabled={!canJoinEvent(event)}
                              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                            >
                              <UserPlus className="h-4 w-4 mr-1" />
                              {event.attendees.length >= event.maxAttendees ? "Full" : "Join"}
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
