"use client"

import { useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar, Users, Heart, MessageSquare, Clock, MapPin, Plus, ArrowRight, Star } from "lucide-react"
import Link from "next/link"
import { useAppStore } from "@/lib/store"
import { format } from "date-fns"

export default function DashboardPage() {
  const {
    currentUser,
    helpPosts = [],
    events = [],
    forumPosts = [],
    fetchHelpPosts,
    fetchEvents,
    fetchForumPosts,
  } = useAppStore()

  useEffect(() => {
    // Fetch all data when component mounts
    const loadData = async () => {
      try {
        await Promise.all([fetchHelpPosts(), fetchEvents(), fetchForumPosts()])
      } catch (error) {
        console.error("Error loading dashboard data:", error)
      }
    }

    if (currentUser) {
      loadData()
    }
  }, [currentUser, fetchHelpPosts, fetchEvents, fetchForumPosts])

  // Safe array operations with fallbacks
  const upcomingEvents = (events || []).filter((event) => new Date(event.date) > new Date()).slice(0, 3)
  const recentHelpPosts = (helpPosts || []).slice(0, 3)
  const recentForumPosts = (forumPosts || []).slice(0, 3)

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "high":
        return "bg-red-100 text-red-700 border-red-200"
      case "medium":
        return "bg-yellow-100 text-yellow-700 border-yellow-200"
      case "low":
        return "bg-green-100 text-green-700 border-green-200"
      default:
        return "bg-gray-100 text-gray-700 border-gray-200"
    }
  }

  const getCommunityLevel = (score: number) => {
    if (score >= 1000) return { level: "Legend", color: "from-yellow-500 to-orange-500", icon: "👑" }
    if (score >= 500) return { level: "Champion", color: "from-purple-500 to-pink-500", icon: "🏆" }
    if (score >= 200) return { level: "Contributor", color: "from-blue-500 to-indigo-500", icon: "⭐" }
    if (score >= 50) return { level: "Helper", color: "from-green-500 to-teal-500", icon: "🌟" }
    return { level: "Newcomer", color: "from-gray-500 to-slate-500", icon: "🌱" }
  }

  if (!currentUser) return null

  const userLevel = getCommunityLevel(currentUser.communityScore || 0)

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-500 p-8 text-white">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Welcome back, {currentUser.firstName}! 👋</h1>
              <p className="text-white/90 text-lg">Ready to make a difference in your community today?</p>
              <div className="flex items-center space-x-4 mt-4">
                <Badge className={`bg-gradient-to-r ${userLevel.color} text-white border-0`}>
                  {userLevel.icon} {userLevel.level}
                </Badge>
                <div className="flex items-center space-x-2 text-white/90">
                  <Star className="h-4 w-4" />
                  <span>{currentUser.communityScore || 0} points</span>
                </div>
              </div>
            </div>
            <div className="hidden md:block">
              <Avatar className="h-20 w-20 ring-4 ring-white/20">
                <AvatarImage src={currentUser.avatar || "/placeholder.svg"} alt={currentUser.firstName} />
                <AvatarFallback className="bg-white/20 text-white text-xl">
                  {currentUser.firstName[0]}
                  {currentUser.lastName[0]}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
          <div className="absolute top-4 right-4 opacity-20">
            <div className="w-32 h-32 rounded-full bg-white/10"></div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-500 to-teal-500 text-white overflow-hidden relative">
            <div className="absolute inset-0 bg-black/10"></div>
            <CardHeader className="relative z-10">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-white/90">Help Posts</CardTitle>
                <Heart className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold">{helpPosts.length}</div>
              <p className="text-xs text-white/80">Active requests</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-cyan-500 text-white overflow-hidden relative">
            <div className="absolute inset-0 bg-black/10"></div>
            <CardHeader className="relative z-10">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-white/90">Events</CardTitle>
                <Calendar className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold">{upcomingEvents.length}</div>
              <p className="text-xs text-white/80">Upcoming events</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-violet-500 text-white overflow-hidden relative">
            <div className="absolute inset-0 bg-black/10"></div>
            <CardHeader className="relative z-10">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-white/90">Forum Posts</CardTitle>
                <MessageSquare className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold">{forumPosts.length}</div>
              <p className="text-xs text-white/80">Discussions</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-pink-500 to-rose-500 text-white overflow-hidden relative">
            <div className="absolute inset-0 bg-black/10"></div>
            <CardHeader className="relative z-10">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-white/90">Community</CardTitle>
                <Users className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold">
                {
                  new Set([
                    ...helpPosts.map((p) => p.authorId),
                    ...events.map((e) => e.organizerId),
                    ...forumPosts.map((p) => p.authorId),
                  ]).size
                }
              </div>
              <p className="text-xs text-white/80">Active members</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/dashboard/help/request">
            <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-950/20 dark:to-rose-950/20 hover:scale-105">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-pink-500 to-rose-500 rounded-full flex items-center justify-center">
                  <Heart className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-pink-800 dark:text-pink-200">Request Help</h3>
                <p className="text-pink-600 dark:text-pink-300 mb-4">
                  Need assistance? Let the community know how they can help you.
                </p>
                <Button className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Request
                </Button>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/events/create">
            <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 hover:scale-105">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                  <Calendar className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-blue-800 dark:text-blue-200">Create Event</h3>
                <p className="text-blue-600 dark:text-blue-300 mb-4">
                  Organize a community event and bring people together.
                </p>
                <Button className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600">
                  <Plus className="h-4 w-4 mr-2" />
                  Plan Event
                </Button>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/forum">
            <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20 hover:scale-105">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-violet-500 rounded-full flex items-center justify-center">
                  <MessageSquare className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-purple-800 dark:text-purple-200">Join Discussion</h3>
                <p className="text-purple-600 dark:text-purple-300 mb-4">
                  Share ideas and connect with your community members.
                </p>
                <Button className="bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Start Discussion
                </Button>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Help Posts */}
          <Card className="border-0 shadow-xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Heart className="h-5 w-5 text-pink-500" />
                  <span>Recent Help Requests</span>
                </CardTitle>
                <Link href="/dashboard/help">
                  <Button variant="ghost" size="sm">
                    View All <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {recentHelpPosts.length > 0 ? (
                <div className="space-y-4">
                  {recentHelpPosts.map((post) => (
                    <div
                      key={post.id}
                      className="flex items-start space-x-3 p-3 rounded-lg bg-gradient-to-r from-slate-50 to-white dark:from-slate-800 dark:to-slate-700"
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={post.avatar || "/placeholder.svg"} alt={post.author} />
                        <AvatarFallback className="bg-gradient-to-br from-pink-500 to-rose-600 text-white">
                          {post.author
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium truncate">{post.title}</h4>
                          <Badge className={getUrgencyColor(post.urgency)}>{post.urgency}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{post.author}</p>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-3 w-3" />
                            <span>{post.location}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{format(new Date(post.createdAt), "MMM d")}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Heart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No help requests yet</p>
                  <p className="text-sm">Be the first to ask for help!</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          <Card className="border-0 shadow-xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-blue-500" />
                  <span>Upcoming Events</span>
                </CardTitle>
                <Link href="/dashboard/events">
                  <Button variant="ghost" size="sm">
                    View All <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {upcomingEvents.length > 0 ? (
                <div className="space-y-4">
                  {upcomingEvents.map((event) => (
                    <div
                      key={event.id}
                      className="flex items-start space-x-3 p-3 rounded-lg bg-gradient-to-r from-slate-50 to-white dark:from-slate-800 dark:to-slate-700"
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={event.avatar || "/placeholder.svg"} alt={event.organizer} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                          {event.organizer
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium truncate">{event.title}</h4>
                          <Badge variant="outline">{event.category}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">by {event.organizer}</p>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>{format(new Date(event.date), "MMM d, h:mm a")}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Users className="h-3 w-3" />
                            <span>{event.attendees.length} attending</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No upcoming events</p>
                  <p className="text-sm">Create the first community event!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Forum Activity */}
        <Card className="border-0 shadow-xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5 text-purple-500" />
                <span>Recent Forum Discussions</span>
              </CardTitle>
              <Link href="/dashboard/forum">
                <Button variant="ghost" size="sm">
                  View All <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentForumPosts.length > 0 ? (
              <div className="space-y-4">
                {recentForumPosts.map((post) => (
                  <div
                    key={post.id}
                    className="flex items-start space-x-3 p-3 rounded-lg bg-gradient-to-r from-slate-50 to-white dark:from-slate-800 dark:to-slate-700"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={post.avatar || "/placeholder.svg"} alt={post.author} />
                      <AvatarFallback className="bg-gradient-to-br from-purple-500 to-violet-600 text-white">
                        {post.author
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium truncate">{post.title}</h4>
                        <Badge variant="outline">{post.category}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">by {post.author}</p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Heart className="h-3 w-3" />
                          <span>{post.likes.length} likes</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MessageSquare className="h-3 w-3" />
                          <span>{post.replies.length} replies</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{format(new Date(post.createdAt), "MMM d")}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No forum discussions yet</p>
                <p className="text-sm">Start the first conversation!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
