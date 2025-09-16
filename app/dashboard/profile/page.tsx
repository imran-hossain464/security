"use client"

import type React from "react"

import { useState, useRef } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { User, Mail, MapPin, Calendar, Edit, Save, X, Heart, Star, Trophy, Camera, Upload } from "lucide-react"
import { useAppStore } from "@/lib/store"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"

export default function ProfilePage() {
  const { currentUser, updateUser, helpPosts, events, uploadAvatar } = useAppStore()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [formData, setFormData] = useState({
    firstName: currentUser?.firstName || "",
    lastName: currentUser?.lastName || "",
    email: currentUser?.email || "",
    location: currentUser?.location || "",
    bio: currentUser?.bio || "",
  })

  const handleSave = () => {
    if (!currentUser) return

    const updatedUser = { ...currentUser, ...formData }
    updateUser(updatedUser)
    setIsEditing(false)
    toast({
      title: "Profile Updated! ✨",
      description: "Your profile information has been successfully updated.",
    })
  }

  const handleCancel = () => {
    if (!currentUser) return

    setFormData({
      firstName: currentUser.firstName,
      lastName: currentUser.lastName,
      email: currentUser.email,
      location: currentUser.location || "",
      bio: currentUser.bio || "",
    })
    setIsEditing(false)
  }

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !currentUser) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file.",
        variant: "destructive",
      })
      return
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 2MB.",
        variant: "destructive",
      })
      return
    }

    setIsUploadingAvatar(true)

    try {
      const avatarUrl = await uploadAvatar(file)
      const updatedUser = { ...currentUser, avatar: avatarUrl }
      updateUser(updatedUser)

      toast({
        title: "Avatar updated! 📸",
        description: "Your profile picture has been updated successfully.",
      })
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to upload avatar. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  if (!currentUser) return null

  const userHelpPosts = helpPosts.filter((post) => post.authorId === currentUser.id)
  const userEvents = events.filter((event) => event.organizerId === currentUser.id)
  const totalLikes = userHelpPosts.reduce((sum, post) => sum + post.likes.length, 0)

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Colorful Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 p-8 text-white">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 rounded-full bg-white/20 backdrop-blur-sm">
                <User className="h-6 w-6" />
              </div>
              <h1 className="text-3xl font-bold">My Profile 👤</h1>
            </div>
            <p className="text-white/90 text-lg">
              Manage your profile information and view your community contributions
            </p>
          </div>
          <div className="absolute top-4 right-4 opacity-20">
            <div className="w-32 h-32 rounded-full bg-white/10"></div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Information */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    Profile Information
                  </CardTitle>
                  {!isEditing ? (
                    <Button
                      onClick={() => setIsEditing(true)}
                      className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  ) : (
                    <div className="flex space-x-2">
                      <Button
                        onClick={handleSave}
                        className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Save
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleCancel}
                        className="border-2 border-gray-300 hover:bg-gray-50 bg-transparent"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar Section */}
                <div className="flex items-center space-x-6">
                  <div className="relative">
                    <Avatar className="h-24 w-24 ring-4 ring-primary/20">
                      <AvatarImage src={currentUser.avatar || "/placeholder.svg"} alt={currentUser.firstName} />
                      <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-2xl">
                        {currentUser.firstName[0]}
                        {currentUser.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <Button
                      size="sm"
                      onClick={triggerFileInput}
                      disabled={isUploadingAvatar}
                      className="absolute -bottom-2 -right-2 rounded-full h-8 w-8 p-0 bg-gradient-to-r from-blue-500 to-indigo-600"
                    >
                      {isUploadingAvatar ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      ) : (
                        <Camera className="h-4 w-4" />
                      )}
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">
                      {currentUser.firstName} {currentUser.lastName}
                    </h2>
                    <p className="text-muted-foreground flex items-center">
                      <Mail className="h-4 w-4 mr-2" />
                      {currentUser.email}
                    </p>
                    <div className="flex items-center space-x-4 mt-2">
                      <Badge className="bg-green-100 text-green-700 border-green-200">🟢 Online</Badge>
                      <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                        ⭐ Score: {currentUser.communityScore}
                      </Badge>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={triggerFileInput}
                      disabled={isUploadingAvatar}
                      className="mt-2 bg-transparent"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {isUploadingAvatar ? "Uploading..." : "Change Avatar"}
                    </Button>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-base font-medium">
                      First Name
                    </Label>
                    {isEditing ? (
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => setFormData((prev) => ({ ...prev, firstName: e.target.value }))}
                        className="border-2 focus:border-indigo-500"
                      />
                    ) : (
                      <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800">{currentUser.firstName}</div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-base font-medium">
                      Last Name
                    </Label>
                    {isEditing ? (
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => setFormData((prev) => ({ ...prev, lastName: e.target.value }))}
                        className="border-2 focus:border-indigo-500"
                      />
                    ) : (
                      <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800">{currentUser.lastName}</div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-base font-medium">
                    Email
                  </Label>
                  {isEditing ? (
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                      className="border-2 focus:border-indigo-500"
                    />
                  ) : (
                    <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                      {currentUser.email}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location" className="text-base font-medium">
                    Location
                  </Label>
                  {isEditing ? (
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                      placeholder="Your city or neighborhood"
                      className="border-2 focus:border-indigo-500"
                    />
                  ) : (
                    <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                      {currentUser.location || "Not specified"}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio" className="text-base font-medium">
                    Bio
                  </Label>
                  {isEditing ? (
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => setFormData((prev) => ({ ...prev, bio: e.target.value }))}
                      placeholder="Tell us about yourself..."
                      className="min-h-[100px] border-2 focus:border-indigo-500"
                    />
                  ) : (
                    <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800 min-h-[100px]">
                      {currentUser.bio || "No bio added yet."}
                    </div>
                  )}
                </div>

                <div className="p-4 rounded-lg bg-gradient-to-r from-slate-50 to-white dark:from-slate-800 dark:to-slate-700">
                  <div className="flex items-center space-x-2 mb-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Member since</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{format(currentUser.joinDate, "MMMM d, yyyy")}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Stats Sidebar */}
          <div className="space-y-6">
            {/* Community Stats */}
            <Card className="border-0 shadow-xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Trophy className="h-5 w-5 text-emerald-600" />
                  <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                    Community Stats
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-white/50 dark:bg-black/20">
                  <div className="flex items-center space-x-2">
                    <Heart className="h-4 w-4 text-pink-500" />
                    <span className="text-sm font-medium">Help Posts</span>
                  </div>
                  <Badge className="bg-pink-100 text-pink-700 border-pink-200">{userHelpPosts.length}</Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-white/50 dark:bg-black/20">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium">Events Created</span>
                  </div>
                  <Badge className="bg-blue-100 text-blue-700 border-blue-200">{userEvents.length}</Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-white/50 dark:bg-black/20">
                  <div className="flex items-center space-x-2">
                    <Star className="h-4 w-4 text-amber-500" />
                    <span className="text-sm font-medium">Total Likes</span>
                  </div>
                  <Badge className="bg-amber-100 text-amber-700 border-amber-200">{totalLikes}</Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-white/50 dark:bg-black/20">
                  <div className="flex items-center space-x-2">
                    <Trophy className="h-4 w-4 text-purple-500" />
                    <span className="text-sm font-medium">Community Score</span>
                  </div>
                  <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                    {currentUser.communityScore}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Achievements */}
            <Card className="border-0 shadow-xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Star className="h-5 w-5 text-amber-600" />
                  <span className="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                    Achievements
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-3 p-3 rounded-lg bg-white/50 dark:bg-black/20">
                  <div className="p-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                    <User className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Community Member</p>
                    <p className="text-xs text-muted-foreground">Joined the platform</p>
                  </div>
                </div>
                {userHelpPosts.length > 0 && (
                  <div className="flex items-center space-x-3 p-3 rounded-lg bg-white/50 dark:bg-black/20">
                    <div className="p-2 rounded-full bg-gradient-to-r from-pink-500 to-rose-600 text-white">
                      <Heart className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Helper</p>
                      <p className="text-xs text-muted-foreground">Created help requests</p>
                    </div>
                  </div>
                )}
                {userEvents.length > 0 && (
                  <div className="flex items-center space-x-3 p-3 rounded-lg bg-white/50 dark:bg-black/20">
                    <div className="p-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
                      <Calendar className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Event Organizer</p>
                      <p className="text-xs text-muted-foreground">Organized community events</p>
                    </div>
                  </div>
                )}
                {currentUser.communityScore >= 50 && (
                  <div className="flex items-center space-x-3 p-3 rounded-lg bg-white/50 dark:bg-black/20">
                    <div className="p-2 rounded-full bg-gradient-to-r from-purple-500 to-violet-600 text-white">
                      <Trophy className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Community Champion</p>
                      <p className="text-xs text-muted-foreground">High community score</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
