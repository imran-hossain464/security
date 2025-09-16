"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  User,
  Bell,
  Shield,
  Camera,
  Save,
  Eye,
  EyeOff,
  Trophy,
  Star,
  Calendar,
  MapPin,
  Mail,
  Phone,
} from "lucide-react"
import { useAppStore } from "@/lib/store"
import { useToast } from "@/hooks/use-toast"
import { getScoreLevel, getProgressToNextLevel, getPointsToNextLevel } from "@/lib/community-score"

export default function SettingsPage() {
  const { currentUser, updateProfile, isAuthenticated } = useAppStore()
  const { toast } = useToast()

  const [isLoading, setIsLoading] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    bio: "",
    location: "",
    phone: "",
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const [preferences, setPreferences] = useState({
    notifications: {
      email: true,
      push: true,
      helpRequests: true,
      events: true,
      messages: true,
    },
    privacy: {
      showEmail: false,
      showPhone: false,
      showLocation: true,
    },
  })

  useEffect(() => {
    if (currentUser) {
      setProfileData({
        firstName: currentUser.firstName || "",
        lastName: currentUser.lastName || "",
        email: currentUser.email || "",
        bio: currentUser.bio || "",
        location: currentUser.location || "",
        phone: currentUser.phone || "",
      })

      if (currentUser.preferences) {
        setPreferences(currentUser.preferences)
      }
    }
  }, [currentUser])

  const handleProfileUpdate = async () => {
    setIsLoading(true)
    try {
      await updateProfile(profileData)
      toast({
        title: "Profile updated! ✅",
        description: "Your profile information has been saved successfully.",
      })
    } catch (error) {
      toast({
        title: "Update failed",
        description: "There was an error updating your profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "New passwords do not match. Please try again.",
        variant: "destructive",
      })
      return
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      })

      if (response.ok) {
        toast({
          title: "Password changed! 🔒",
          description: "Your password has been updated successfully.",
        })
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        })
      } else {
        const error = await response.json()
        toast({
          title: "Password change failed",
          description: error.error || "There was an error changing your password.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Password change failed",
        description: "There was an error changing your password. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handlePreferencesUpdate = async () => {
    setIsLoading(true)
    try {
      await updateProfile({ preferences })
      toast({
        title: "Preferences updated! ⚙️",
        description: "Your notification and privacy preferences have been saved.",
      })
    } catch (error) {
      toast({
        title: "Update failed",
        description: "There was an error updating your preferences. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB.",
        variant: "destructive",
      })
      return
    }

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please select a valid image file.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        await updateProfile({ avatar: data.url })
        toast({
          title: "Avatar updated! 📸",
          description: "Your profile picture has been updated successfully.",
        })
      } else {
        throw new Error("Upload failed")
      }
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "There was an error uploading your avatar. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!isAuthenticated || !currentUser) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Please log in to access settings.</p>
        </div>
      </DashboardLayout>
    )
  }

  const currentLevel = getScoreLevel(currentUser.communityScore)
  const progressToNext = getProgressToNextLevel(currentUser.communityScore)
  const pointsToNext = getPointsToNextLevel(currentUser.communityScore)

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-500 p-8 text-white">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <h1 className="text-3xl font-bold mb-2">Account Settings ⚙️</h1>
            <p className="text-white/90 text-lg">Manage your profile, preferences, and account security</p>
          </div>
          <div className="absolute top-4 right-4 opacity-20">
            <div className="w-32 h-32 rounded-full bg-white/10"></div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Overview */}
          <div className="lg:col-span-1">
            <Card className="border-0 shadow-xl bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
              <CardHeader className="text-center">
                <div className="relative mx-auto mb-4">
                  <Avatar className="h-24 w-24 ring-4 ring-primary/20">
                    <AvatarImage src={currentUser.avatar || "/placeholder.svg"} alt={currentUser.firstName} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-2xl">
                      {currentUser.firstName[0]}
                      {currentUser.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <label
                    htmlFor="avatar-upload"
                    className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-2 cursor-pointer hover:bg-primary/90 transition-colors"
                  >
                    <Camera className="h-4 w-4" />
                  </label>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarUpload}
                    disabled={isLoading}
                  />
                </div>
                <CardTitle className="text-xl">
                  {currentUser.firstName} {currentUser.lastName}
                </CardTitle>
                <CardDescription className="flex items-center justify-center gap-2">
                  <Mail className="h-4 w-4" />
                  {currentUser.email}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Community Level */}
                <div className="text-center">
                  <Badge className={`${currentLevel.color} mb-2`}>
                    <Trophy className="h-3 w-3 mr-1" />
                    {currentLevel.name}
                  </Badge>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Community Score</span>
                      <span className="font-bold">{currentUser.communityScore}</span>
                    </div>
                    <Progress value={progressToNext} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      {pointsToNext > 0 ? `${pointsToNext} points to next level` : "Max level reached!"}
                    </p>
                  </div>
                </div>

                <Separator />

                {/* Quick Stats */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-blue-500" />
                      <span className="text-sm">Joined</span>
                    </div>
                    <span className="text-sm font-medium">{new Date(currentUser.joinedAt).toLocaleDateString()}</span>
                  </div>
                  {currentUser.location && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-green-500" />
                        <span className="text-sm">Location</span>
                      </div>
                      <span className="text-sm font-medium">{currentUser.location}</span>
                    </div>
                  )}
                  {currentUser.phone && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-purple-500" />
                        <span className="text-sm">Phone</span>
                      </div>
                      <span className="text-sm font-medium">{currentUser.phone}</span>
                    </div>
                  )}
                </div>

                {/* Level Benefits */}
                <div className="bg-muted/50 rounded-lg p-3">
                  <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-500" />
                    Level Benefits
                  </h4>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    {currentLevel.benefits.map((benefit, index) => (
                      <li key={index}>• {benefit}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Settings Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Information */}
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profile Information
                </CardTitle>
                <CardDescription>Update your personal information and bio</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={profileData.firstName}
                      onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={profileData.lastName}
                      onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                      placeholder="Doe"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={profileData.location}
                    onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                    placeholder="City, State"
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={profileData.bio}
                    onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                    placeholder="Tell us about yourself..."
                    className="min-h-[100px]"
                  />
                </div>

                <Button onClick={handleProfileUpdate} disabled={isLoading} className="w-full">
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? "Saving..." : "Save Profile"}
                </Button>
              </CardContent>
            </Card>

            {/* Password Change */}
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Change Password
                </CardTitle>
                <CardDescription>Update your account password for security</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showCurrentPassword ? "text" : "password"}
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      placeholder="Enter current password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="newPassword">New Password</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      placeholder="Enter new password"
                      minLength={6}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      placeholder="Confirm new password"
                      minLength={6}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <Button
                  onClick={handlePasswordChange}
                  disabled={
                    isLoading ||
                    !passwordData.currentPassword ||
                    !passwordData.newPassword ||
                    !passwordData.confirmPassword
                  }
                  className="w-full"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  {isLoading ? "Changing..." : "Change Password"}
                </Button>
              </CardContent>
            </Card>

            {/* Notification Preferences */}
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notification Preferences
                </CardTitle>
                <CardDescription>Choose how you want to be notified about community activities</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="email-notifications">Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                    </div>
                    <Switch
                      id="email-notifications"
                      checked={preferences.notifications.email}
                      onCheckedChange={(checked) =>
                        setPreferences({
                          ...preferences,
                          notifications: { ...preferences.notifications, email: checked },
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="push-notifications">Push Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive browser push notifications</p>
                    </div>
                    <Switch
                      id="push-notifications"
                      checked={preferences.notifications.push}
                      onCheckedChange={(checked) =>
                        setPreferences({
                          ...preferences,
                          notifications: { ...preferences.notifications, push: checked },
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="help-requests">Help Request Alerts</Label>
                      <p className="text-sm text-muted-foreground">Get notified about new help requests</p>
                    </div>
                    <Switch
                      id="help-requests"
                      checked={preferences.notifications.helpRequests}
                      onCheckedChange={(checked) =>
                        setPreferences({
                          ...preferences,
                          notifications: { ...preferences.notifications, helpRequests: checked },
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="event-notifications">Event Reminders</Label>
                      <p className="text-sm text-muted-foreground">Get reminded about upcoming events</p>
                    </div>
                    <Switch
                      id="event-notifications"
                      checked={preferences.notifications.events}
                      onCheckedChange={(checked) =>
                        setPreferences({
                          ...preferences,
                          notifications: { ...preferences.notifications, events: checked },
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="message-notifications">Message Notifications</Label>
                      <p className="text-sm text-muted-foreground">Get notified about new messages</p>
                    </div>
                    <Switch
                      id="message-notifications"
                      checked={preferences.notifications.messages}
                      onCheckedChange={(checked) =>
                        setPreferences({
                          ...preferences,
                          notifications: { ...preferences.notifications, messages: checked },
                        })
                      }
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-medium">Privacy Settings</h4>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="show-email">Show Email Publicly</Label>
                      <p className="text-sm text-muted-foreground">Allow others to see your email address</p>
                    </div>
                    <Switch
                      id="show-email"
                      checked={preferences.privacy.showEmail}
                      onCheckedChange={(checked) =>
                        setPreferences({
                          ...preferences,
                          privacy: { ...preferences.privacy, showEmail: checked },
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="show-phone">Show Phone Publicly</Label>
                      <p className="text-sm text-muted-foreground">Allow others to see your phone number</p>
                    </div>
                    <Switch
                      id="show-phone"
                      checked={preferences.privacy.showPhone}
                      onCheckedChange={(checked) =>
                        setPreferences({
                          ...preferences,
                          privacy: { ...preferences.privacy, showPhone: checked },
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="show-location">Show Location Publicly</Label>
                      <p className="text-sm text-muted-foreground">Allow others to see your location</p>
                    </div>
                    <Switch
                      id="show-location"
                      checked={preferences.privacy.showLocation}
                      onCheckedChange={(checked) =>
                        setPreferences({
                          ...preferences,
                          privacy: { ...preferences.privacy, showLocation: checked },
                        })
                      }
                    />
                  </div>
                </div>

                <Button onClick={handlePreferencesUpdate} disabled={isLoading} className="w-full">
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? "Saving..." : "Save Preferences"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
