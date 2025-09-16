"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CalendarIcon, ChevronLeft, ChevronRight, MapPin, Clock, Users, Plus } from "lucide-react"
import { useAppStore } from "@/lib/store"
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isSameMonth,
  isToday,
  addMonths,
  subMonths,
} from "date-fns"
import Link from "next/link"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function CalendarPage() {
  const { events, currentUser } = useAppStore()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [categoryFilter, setCategoryFilter] = useState<string>("all")

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const filteredEvents = categoryFilter === "all" ? events : events.filter((event) => event.category === categoryFilter)

  const getEventsForDate = (date: Date) => {
    return filteredEvents.filter((event) => isSameDay(new Date(event.date), date))
  }

  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : []

  const categories = [...new Set(events.map((event) => event.category))]

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate(direction === "prev" ? subMonths(currentDate, 1) : addMonths(currentDate, 1))
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Environment":
        return "bg-green-100 text-green-700 border-green-200"
      case "Charity":
        return "bg-red-100 text-red-700 border-red-200"
      case "Community":
        return "bg-blue-100 text-blue-700 border-blue-200"
      case "Social":
        return "bg-purple-100 text-purple-700 border-purple-200"
      case "Education":
        return "bg-indigo-100 text-indigo-700 border-indigo-200"
      case "Health":
        return "bg-pink-100 text-pink-700 border-pink-200"
      case "Sports":
        return "bg-orange-100 text-orange-700 border-orange-200"
      case "Arts":
        return "bg-violet-100 text-violet-700 border-violet-200"
      default:
        return "bg-gray-100 text-gray-700 border-gray-200"
    }
  }

  if (!currentUser) return null

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Colorful Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 p-8 text-white">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Event Calendar 📅</h1>
              <p className="text-white/90 text-lg">View all community events in a beautiful calendar interface</p>
            </div>
            <div className="flex items-center space-x-3">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-48 bg-white/20 border-white/30 text-white">
                  <SelectValue placeholder="Filter by category" />
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
              <Link href="/dashboard/events/create">
                <Button className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                  <Plus className="h-4 w-4 mr-2" />
                  New Event
                </Button>
              </Link>
            </div>
          </div>
          <div className="absolute top-4 right-4 opacity-20">
            <div className="w-32 h-32 rounded-full bg-white/10"></div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-3">
            <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    {format(currentDate, "MMMM yyyy")}
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" onClick={() => navigateMonth("prev")} className="border-2">
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())} className="border-2">
                      Today
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => navigateMonth("next")} className="border-2">
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-2 mb-4">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                    <div key={day} className="p-2 text-center font-semibold text-muted-foreground">
                      {day}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-2">
                  {daysInMonth.map((day) => {
                    const dayEvents = getEventsForDate(day)
                    const isSelected = selectedDate && isSameDay(day, selectedDate)
                    const isCurrentMonth = isSameMonth(day, currentDate)

                    return (
                      <div
                        key={day.toISOString()}
                        className={`
                          min-h-[100px] p-2 border rounded-lg cursor-pointer transition-all duration-200
                          ${isSelected ? "bg-primary/10 border-primary" : "border-border hover:bg-muted/50"}
                          ${!isCurrentMonth ? "opacity-50" : ""}
                          ${isToday(day) ? "ring-2 ring-primary/50" : ""}
                        `}
                        onClick={() => setSelectedDate(day)}
                      >
                        <div className={`text-sm font-medium mb-1 ${isToday(day) ? "text-primary" : ""}`}>
                          {format(day, "d")}
                        </div>
                        <div className="space-y-1">
                          {dayEvents.slice(0, 2).map((event) => (
                            <div
                              key={event.id}
                              className={`text-xs p-1 rounded truncate ${getCategoryColor(event.category)}`}
                            >
                              {event.title}
                            </div>
                          ))}
                          {dayEvents.length > 2 && (
                            <div className="text-xs text-muted-foreground">+{dayEvents.length - 2} more</div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Event Details Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Selected Date Events */}
            <Card className="border-0 shadow-xl bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
              <CardHeader>
                <CardTitle className="text-lg bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {selectedDate ? format(selectedDate, "MMM d, yyyy") : "Select a Date"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedDate ? (
                  selectedDateEvents.length > 0 ? (
                    <div className="space-y-4">
                      {selectedDateEvents.map((event) => (
                        <div
                          key={event.id}
                          className="p-3 rounded-lg bg-gradient-to-r from-slate-50 to-white dark:from-slate-800 dark:to-slate-700"
                        >
                          <div className="flex items-start space-x-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={event.avatar || "/placeholder.svg"} alt={event.organizer} />
                              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm">
                                {event.organizer
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-sm truncate">{event.title}</h4>
                              <p className="text-xs text-muted-foreground">by {event.organizer}</p>
                              <div className="flex items-center space-x-2 mt-2 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                <span>{event.startTime}</span>
                              </div>
                              <div className="flex items-center space-x-2 mt-1 text-xs text-muted-foreground">
                                <MapPin className="h-3 w-3" />
                                <span className="truncate">{event.location}</span>
                              </div>
                              <div className="flex items-center space-x-2 mt-1 text-xs text-muted-foreground">
                                <Users className="h-3 w-3" />
                                <span>
                                  {event.attendees.length}/{event.maxAttendees}
                                </span>
                              </div>
                              <Badge className={`mt-2 text-xs ${getCategoryColor(event.category)}`}>
                                {event.category}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p className="text-sm">No events on this date</p>
                    </div>
                  )
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-sm">Click on a date to view events</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Upcoming Events */}
            <Card className="border-0 shadow-xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20">
              <CardHeader>
                <CardTitle className="text-lg bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  Upcoming Events
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filteredEvents
                    .filter((event) => new Date(event.date) >= new Date())
                    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                    .slice(0, 5)
                    .map((event) => (
                      <div
                        key={event.id}
                        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-white/50 dark:hover:bg-black/20 transition-colors"
                      >
                        <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-center min-w-[40px]">
                          <div className="text-xs font-medium">{format(event.date, "MMM")}</div>
                          <div className="text-sm font-bold">{format(event.date, "d")}</div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{event.title}</p>
                          <p className="text-xs text-muted-foreground">{event.startTime}</p>
                        </div>
                      </div>
                    ))}
                  {filteredEvents.filter((event) => new Date(event.date) >= new Date()).length === 0 && (
                    <div className="text-center py-4 text-muted-foreground">
                      <CalendarIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No upcoming events</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Calendar Stats */}
            <Card className="border-0 shadow-xl bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/20 dark:to-purple-950/20">
              <CardHeader>
                <CardTitle className="text-lg bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                  This Month
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Total Events</span>
                  <Badge className="bg-violet-100 text-violet-700 border-violet-200">
                    {events.filter((event) => isSameMonth(new Date(event.date), currentDate)).length}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Your Events</span>
                  <Badge className="bg-purple-100 text-purple-700 border-purple-200">
                    {
                      events.filter(
                        (event) =>
                          event.organizerId === currentUser.id && isSameMonth(new Date(event.date), currentDate),
                      ).length
                    }
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Attending</span>
                  <Badge className="bg-pink-100 text-pink-700 border-pink-200">
                    {
                      events.filter(
                        (event) =>
                          event.attendees.includes(currentUser.id) && isSameMonth(new Date(event.date), currentDate),
                      ).length
                    }
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
