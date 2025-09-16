"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MessageSquare, Heart, TrendingUp, Users, Plus, Send, Edit, Trash2, Filter, Search } from "lucide-react"
import { useAppStore } from "@/lib/store"
import { format } from "date-fns"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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

export default function ForumPage() {
  const { forumPosts, currentUser, createForumPost, updateForumPost, deleteForumPost, fetchForumPosts } = useAppStore()
  const { toast } = useToast()

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [replyInputs, setReplyInputs] = useState<Record<string, string>>({})
  const [expandedReplies, setExpandedReplies] = useState<Record<string, boolean>>({})
  const [isLoading, setIsLoading] = useState(true)

  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
    category: "",
  })

  useEffect(() => {
    const loadPosts = async () => {
      setIsLoading(true)
      await fetchForumPosts()
      setIsLoading(false)
    }
    loadPosts()
  }, [fetchForumPosts])

  const categories = [
    { value: "all", label: "All Categories", icon: "🌟" },
    { value: "General", label: "General Discussion", icon: "💬" },
    { value: "Help", label: "Help & Support", icon: "🆘" },
    { value: "Events", label: "Community Events", icon: "🎉" },
    { value: "Announcements", label: "Announcements", icon: "📢" },
    { value: "Ideas", label: "Ideas & Suggestions", icon: "💡" },
    { value: "Off-Topic", label: "Off-Topic", icon: "🎭" },
  ]

  const filteredPosts = forumPosts.filter((post) => {
    const matchesCategory = selectedCategory === "all" || post.category === selectedCategory
    const matchesSearch =
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.author.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const handleCreatePost = async () => {
    if (!currentUser || !newPost.title.trim() || !newPost.content.trim() || !newPost.category) return

    try {
      await createForumPost({
        ...newPost,
        authorId: currentUser.id,
      })

      // Refresh the posts after creating
      await fetchForumPosts()

      setNewPost({ title: "", content: "", category: "" })
      setIsCreateDialogOpen(false)

      toast({
        title: "Post Created! 🎉",
        description: "Your forum post has been published successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create post. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleLikePost = (postId: string) => {
    if (!currentUser) return
    updateForumPost(postId, {
      action: "like",
      userId: currentUser.id,
    })
  }

  const handleAddReply = async (postId: string) => {
    if (!currentUser || !replyInputs[postId]?.trim()) return

    await updateForumPost(postId, {
      action: "reply",
      content: replyInputs[postId].trim(),
      authorId: currentUser.id,
      author: `${currentUser.firstName} ${currentUser.lastName}`,
      avatar: currentUser.avatar,
    })

    setReplyInputs((prev) => ({ ...prev, [postId]: "" }))
    toast({
      title: "Reply added",
      description: "Your reply has been posted successfully.",
    })
  }

  const handleLikeReply = (postId: string, replyId: string) => {
    if (!currentUser) return
    updateForumPost(postId, {
      action: "likeReply",
      replyId,
      userId: currentUser.id,
    })
  }

  const handleDeleteReply = (postId: string, replyId: string) => {
    updateForumPost(postId, {
      action: "deleteReply",
      replyId,
    })
    toast({
      title: "Reply deleted",
      description: "Reply has been removed.",
    })
  }

  const handleDeletePost = async (postId: string) => {
    await deleteForumPost(postId)
    await fetchForumPosts() // Refresh after delete
    toast({
      title: "Post deleted",
      description: "Your forum post has been successfully deleted.",
    })
  }

  const toggleReplies = (postId: string) => {
    setExpandedReplies((prev) => ({ ...prev, [postId]: !prev[postId] }))
  }

  const getAuthorLevel = (score: number) => {
    if (score >= 1000) return { level: "Legend", color: "from-yellow-500 to-orange-500", icon: "👑" }
    if (score >= 500) return { level: "Champion", color: "from-purple-500 to-pink-500", icon: "🏆" }
    if (score >= 200) return { level: "Contributor", color: "from-blue-500 to-indigo-500", icon: "⭐" }
    if (score >= 50) return { level: "Helper", color: "from-green-500 to-teal-500", icon: "🌟" }
    return { level: "Newcomer", color: "from-gray-500 to-slate-500", icon: "🌱" }
  }

  if (!currentUser) return null

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Colorful Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-500 via-purple-600 to-indigo-500 p-8 text-white">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Community Forum 💬</h1>
              <p className="text-white/90 text-lg">Share ideas, ask questions, and connect with your community</p>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                  <Plus className="h-4 w-4 mr-2" />
                  New Post
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Forum Post</DialogTitle>
                  <DialogDescription>Share your thoughts with the community</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      placeholder="What's on your mind?"
                      value={newPost.title}
                      onChange={(e) => setNewPost((prev) => ({ ...prev, title: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select
                      value={newPost.category}
                      onValueChange={(value) => setNewPost((prev) => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.slice(1).map((category) => (
                          <SelectItem key={category.value} value={category.value}>
                            {category.icon} {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="content">Content *</Label>
                    <Textarea
                      id="content"
                      placeholder="Share your thoughts, ask questions, or start a discussion..."
                      className="min-h-[120px]"
                      value={newPost.content}
                      onChange={(e) => setNewPost((prev) => ({ ...prev, content: e.target.value }))}
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCreatePost}
                      disabled={!newPost.title.trim() || !newPost.content.trim() || !newPost.category}
                      className="bg-gradient-to-r from-violet-500 to-purple-600"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Post
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <div className="absolute top-4 right-4 opacity-20">
            <div className="w-32 h-32 rounded-full bg-white/10"></div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-cyan-500 text-white overflow-hidden relative">
            <div className="absolute inset-0 bg-black/10"></div>
            <CardHeader className="relative z-10">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-white/90">Total Posts</CardTitle>
                <MessageSquare className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold">{forumPosts.length}</div>
              <p className="text-xs text-white/80">Community discussions</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-500 to-teal-500 text-white overflow-hidden relative">
            <div className="absolute inset-0 bg-black/10"></div>
            <CardHeader className="relative z-10">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-white/90">Active Users</CardTitle>
                <Users className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold">{new Set(forumPosts.map((p) => p.authorId)).size}</div>
              <p className="text-xs text-white/80">Contributing members</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-violet-500 text-white overflow-hidden relative">
            <div className="absolute inset-0 bg-black/10"></div>
            <CardHeader className="relative z-10">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-white/90">Total Replies</CardTitle>
                <TrendingUp className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold">{forumPosts.reduce((acc, post) => acc + post.replies.length, 0)}</div>
              <p className="text-xs text-white/80">Community responses</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-pink-500 to-rose-500 text-white overflow-hidden relative">
            <div className="absolute inset-0 bg-black/10"></div>
            <CardHeader className="relative z-10">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-white/90">Total Likes</CardTitle>
                <Heart className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold">
                {forumPosts.reduce(
                  (acc, post) =>
                    acc +
                    post.likes.length +
                    post.replies.reduce((replyAcc, reply) => replyAcc + reply.likes.length, 0),
                  0,
                )}
              </div>
              <p className="text-xs text-white/80">Community appreciation</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search posts, authors, or content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.icon} {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">Loading posts...</span>
          </div>
        ) : (
          /* Forum Posts */
          <div className="space-y-4">
            {filteredPosts.length > 0 ? (
              filteredPosts.map((post) => {
                const authorLevel = getAuthorLevel(0)
                return (
                  <Card
                    key={post.id}
                    className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800"
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="relative">
                            <Avatar className="ring-2 ring-primary/20">
                              <AvatarImage src={post.avatar || "/placeholder.svg"} alt={post.author} />
                              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                                {post.author
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background"></div>
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <h3 className="font-semibold">{post.author}</h3>
                              <Badge className={`bg-gradient-to-r ${authorLevel.color} text-white border-0 text-xs`}>
                                {authorLevel.icon} {post.authorLevel || authorLevel.level}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(post.createdAt), "MMM d, h:mm a")}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge
                            className={`
                              ${post.category === "General" ? "bg-blue-100 text-blue-700 border-blue-200" : ""}
                              ${post.category === "Help" ? "bg-red-100 text-red-700 border-red-200" : ""}
                              ${post.category === "Events" ? "bg-green-100 text-green-700 border-green-200" : ""}
                              ${post.category === "Announcements" ? "bg-purple-100 text-purple-700 border-purple-200" : ""}
                              ${post.category === "Ideas" ? "bg-yellow-100 text-yellow-700 border-yellow-200" : ""}
                              ${post.category === "Off-Topic" ? "bg-gray-100 text-gray-700 border-gray-200" : ""}
                            `}
                          >
                            {post.category}
                          </Badge>
                          {post.authorId === currentUser.id && (
                            <div className="flex space-x-1">
                              <Button variant="ghost" size="sm" className="text-blue-600 hover:bg-blue-50">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Forum Post</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete this post? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDeletePost(post.id)}
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
                    <CardContent>
                      <div className="space-y-4">
                        <div className="p-4 rounded-lg bg-gradient-to-r from-slate-50 to-white dark:from-slate-800 dark:to-slate-700">
                          <h4 className="font-medium mb-2 text-lg">{post.title}</h4>
                          <p className="text-muted-foreground whitespace-pre-wrap">{post.content}</p>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              className={`${post.likes.includes(currentUser.id) ? "text-pink-600 bg-pink-50" : "text-pink-600 hover:bg-pink-50"} hover:text-pink-700`}
                              onClick={() => handleLikePost(post.id)}
                            >
                              <Heart
                                className={`h-4 w-4 mr-1 ${post.likes.includes(currentUser.id) ? "fill-current" : ""}`}
                              />
                              {post.likes.length}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                              onClick={() => toggleReplies(post.id)}
                            >
                              <MessageSquare className="h-4 w-4 mr-1" />
                              {post.replies.length} Replies
                            </Button>
                          </div>
                        </div>

                        {/* Replies Section */}
                        {expandedReplies[post.id] && (
                          <div className="border-t pt-4 space-y-4">
                            {/* Add Reply */}
                            <div className="flex space-x-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage
                                  src={currentUser.avatar || "/placeholder.svg"}
                                  alt={currentUser.firstName}
                                />
                                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm">
                                  {currentUser.firstName[0]}
                                  {currentUser.lastName[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 flex space-x-2">
                                <Input
                                  placeholder="Write a reply..."
                                  value={replyInputs[post.id] || ""}
                                  onChange={(e) => setReplyInputs((prev) => ({ ...prev, [post.id]: e.target.value }))}
                                  onKeyPress={(e) => e.key === "Enter" && handleAddReply(post.id)}
                                />
                                <Button
                                  size="sm"
                                  onClick={() => handleAddReply(post.id)}
                                  disabled={!replyInputs[post.id]?.trim()}
                                  className="bg-gradient-to-r from-violet-500 to-purple-600"
                                >
                                  <Send className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>

                            {/* Replies List */}
                            {post.replies.map((reply) => (
                              <div
                                key={reply.id}
                                className="flex space-x-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800"
                              >
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={reply.avatar || "/placeholder.svg"} alt={reply.author} />
                                  <AvatarFallback className="bg-gradient-to-br from-green-500 to-teal-600 text-white text-sm">
                                    {reply.author
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <p className="font-medium text-sm">{reply.author}</p>
                                      <p className="text-xs text-muted-foreground">
                                        {format(new Date(reply.createdAt), "MMM d, h:mm a")}
                                      </p>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className={`${reply.likes?.includes(currentUser.id) ? "text-pink-600 bg-pink-50" : "text-pink-600 hover:bg-pink-50"} hover:text-pink-700`}
                                        onClick={() => handleLikeReply(post.id, reply.id)}
                                      >
                                        <Heart
                                          className={`h-3 w-3 mr-1 ${reply.likes?.includes(currentUser.id) ? "fill-current" : ""}`}
                                        />
                                        {reply.likes?.length || 0}
                                      </Button>
                                      {reply.authorId === currentUser.id && (
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="text-red-600 hover:bg-red-50"
                                          onClick={() => handleDeleteReply(post.id, reply.id)}
                                        >
                                          <Trash2 className="h-3 w-3" />
                                        </Button>
                                      )}
                                    </div>
                                  </div>
                                  <p className="text-sm mt-1">{reply.content}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            ) : (
              <Card className="border-0 shadow-xl bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
                <CardContent className="text-center py-12">
                  <MessageSquare className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                  <h3 className="text-xl font-semibold mb-2">No posts found</h3>
                  <p className="text-muted-foreground mb-6">
                    {searchTerm || selectedCategory !== "all"
                      ? "Try adjusting your search or filter criteria."
                      : "Be the first to start a discussion in the community forum!"}
                  </p>
                  <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-gradient-to-r from-violet-500 to-purple-600">
                        <Plus className="h-4 w-4 mr-2" />
                        Create First Post
                      </Button>
                    </DialogTrigger>
                  </Dialog>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
