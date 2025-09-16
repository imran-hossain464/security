"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bell, Heart, Calendar, MessageCircle, Users, Trash2, Check, CheckCheck } from "lucide-react"
import { useAppStore } from "@/lib/store"
import { format } from "date-fns"
import { useToast } from "@/hooks/use-toast"
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

export default function NotificationsPage() {
  const { notifications, currentUser, markNotificationAsRead, markAllNotificationsAsRead, deleteNotification } =
    useAppStore()
  const { toast } = useToast()

  const userNotifications = notifications
    .filter((notification) => notification.userId === currentUser?.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const unreadCount = userNotifications.filter((n) => !n.isRead).length

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "help_request":
        return Heart
      case "event_reminder":
      case "event_update":
        return Calendar
      case "message":
        return MessageCircle
      case "forum_reply":
        return Users
      case "like":
        return Heart
      case "comment":
        return MessageCircle
      default:
        return Bell
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "help_request":
        return "from-pink-500 to-rose-500"
      case "event_reminder":
      case "event_update":
        return "from-blue-500 to-indigo-600"
      case "message":
        return "from-emerald-500 to-teal-600"
      case "forum_reply":
        return "from-purple-500 to-violet-600"
      case "like":
        return "from-red-500 to-pink-500"
      case "comment":
        return "from-orange-500 to-amber-500"
      default:
        return "from-gray-500 to-slate-600"
    }
  }

  const handleMarkAsRead = (notificationId: string) => {
    markNotificationAsRead(notificationId)
    toast({
      title: "Notification marked as read",
      description: "The notification has been marked as read.",
    })
  }

  const handleMarkAllAsRead = () => {
    if (!currentUser) return
    markAllNotificationsAsRead(currentUser.id)
    toast({
      title: "All notifications marked as read",
      description: "All your notifications have been marked as read.",
    })
  }

  const handleDelete = (notificationId: string) => {
    deleteNotification(notificationId)
    toast({
      title: "Notification deleted",
      description: "The notification has been removed.",
    })
  }

  if (!currentUser) return null

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Colorful Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500 via-orange-600 to-red-500 p-8 text-white">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Notifications 🔔</h1>
              <p className="text-white/90 text-lg">Stay updated with all your community activities and interactions</p>
            </div>
            <div className="flex items-center space-x-3">
              {unreadCount > 0 && (
                <Button
                  onClick={handleMarkAllAsRead}
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                >
                  <CheckCheck className="h-4 w-4 mr-2" />
                  Mark All Read
                </Button>
              )}
              <Badge className="bg-white/20 text-white border-white/30 text-lg px-3 py-1">{unreadCount} unread</Badge>
            </div>
          </div>
          <div className="absolute top-4 right-4 opacity-20">
            <div className="w-32 h-32 rounded-full bg-white/10"></div>
          </div>
        </div>

        {/* Notifications Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white overflow-hidden relative">
            <div className="absolute inset-0 bg-black/10"></div>
            <CardHeader className="relative z-10">
              <CardTitle className="text-lg text-white/90">Total</CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold">{userNotifications.length}</div>
              <p className="text-xs text-white/80">All notifications</p>
            </CardContent>
            <div className="absolute -bottom-4 -right-4 w-16 h-16 rounded-full bg-white/10"></div>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-500 to-teal-500 text-white overflow-hidden relative">
            <div className="absolute inset-0 bg-black/10"></div>
            <CardHeader className="relative z-10">
              <CardTitle className="text-lg text-white/90">Unread</CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold">{unreadCount}</div>
              <p className="text-xs text-white/80">Need attention</p>
            </CardContent>
            <div className="absolute -bottom-4 -right-4 w-16 h-16 rounded-full bg-white/10"></div>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-violet-500 text-white overflow-hidden relative">
            <div className="absolute inset-0 bg-black/10"></div>
            <CardHeader className="relative z-10">
              <CardTitle className="text-lg text-white/90">Today</CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold">
                {
                  userNotifications.filter((n) => new Date(n.createdAt).toDateString() === new Date().toDateString())
                    .length
                }
              </div>
              <p className="text-xs text-white/80">Recent activity</p>
            </CardContent>
            <div className="absolute -bottom-4 -right-4 w-16 h-16 rounded-full bg-white/10"></div>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-pink-500 to-rose-500 text-white overflow-hidden relative">
            <div className="absolute inset-0 bg-black/10"></div>
            <CardHeader className="relative z-10">
              <CardTitle className="text-lg text-white/90">This Week</CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold">
                {
                  userNotifications.filter((n) => {
                    const weekAgo = new Date()
                    weekAgo.setDate(weekAgo.getDate() - 7)
                    return new Date(n.createdAt) >= weekAgo
                  }).length
                }
              </div>
              <p className="text-xs text-white/80">Past 7 days</p>
            </CardContent>
            <div className="absolute -bottom-4 -right-4 w-16 h-16 rounded-full bg-white/10"></div>
          </Card>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
            Your Notifications ✨
          </h2>

          {userNotifications.length > 0 ? (
            userNotifications.map((notification) => {
              const IconComponent = getNotificationIcon(notification.type)
              const colorClass = getNotificationColor(notification.type)

              return (
                <Card
                  key={notification.id}
                  className={`border-0 shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 ${
                    !notification.isRead ? "ring-2 ring-primary/20" : ""
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-4">
                      <div className={`p-3 rounded-full bg-gradient-to-br ${colorClass} text-white flex-shrink-0`}>
                        <IconComponent className="h-5 w-5" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className="font-semibold text-lg">{notification.title}</h3>
                              {!notification.isRead && (
                                <Badge className="bg-primary text-primary-foreground">New</Badge>
                              )}
                            </div>
                            <p className="text-muted-foreground mb-2">{notification.content}</p>
                            <p className="text-sm text-muted-foreground">
                              {format(notification.createdAt, "MMM d, yyyy 'at' h:mm a")}
                            </p>
                          </div>

                          <div className="flex items-center space-x-2 ml-4">
                            {!notification.isRead && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleMarkAsRead(notification.id)}
                                className="text-blue-600 hover:bg-blue-50"
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                            )}
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Notification</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete this notification? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(notification.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          ) : (
            <Card className="border-0 shadow-xl bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
              <CardContent className="text-center py-12">
                <Bell className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                <h3 className="text-xl font-semibold mb-2">No notifications yet</h3>
                <p className="text-muted-foreground mb-6">
                  When you receive notifications about community activities, they'll appear here.
                </p>
                <div className="flex justify-center space-x-4">
                  <div className="text-center">
                    <div className="p-3 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 text-white mx-auto mb-2 w-fit">
                      <Heart className="h-4 w-4" />
                    </div>
                    <p className="text-sm text-muted-foreground">Help requests</p>
                  </div>
                  <div className="text-center">
                    <div className="p-3 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white mx-auto mb-2 w-fit">
                      <Calendar className="h-4 w-4" />
                    </div>
                    <p className="text-sm text-muted-foreground">Event updates</p>
                  </div>
                  <div className="text-center">
                    <div className="p-3 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white mx-auto mb-2 w-fit">
                      <MessageCircle className="h-4 w-4" />
                    </div>
                    <p className="text-sm text-muted-foreground">New messages</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
