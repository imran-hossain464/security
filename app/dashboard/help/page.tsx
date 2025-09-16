"use client"

import { useState, useEffect } from "react"
import { useAppStore } from "@/lib/store"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Heart, MessageCircle, MapPin, Clock, Plus, Search, Filter, Edit, Trash2, User, Send } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { useToast } from "@/hooks/use-toast"

export default function HelpPage() {
  const {
    currentUser,
    helpPosts,
    users,
    conversations,
    fetchHelpPosts,
    fetchUsers,
    likeHelpPost,
    addCommentToHelpPost,
    deleteCommentFromHelpPost,
    deleteHelpPost,
    createConversation,
    fetchConversations,
  } = useAppStore()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedUrgency, setSelectedUrgency] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [commentContent, setCommentContent] = useState("")
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null)
  const [contactMessage, setContactMessage] = useState("")
  const [contactingPostId, setContactingPostId] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      await Promise.all([
        fetchHelpPosts(),
        fetchUsers(),
        currentUser ? fetchConversations(currentUser.id) : Promise.resolve(),
      ])
      setIsLoading(false)
    }
    loadData()
  }, [fetchHelpPosts, fetchUsers, fetchConversations, currentUser])

  // Filter posts based on search and filters
  const filteredPosts = helpPosts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.author.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || post.category === selectedCategory
    const matchesUrgency = selectedUrgency === "all" || post.urgency === selectedUrgency
    const matchesStatus = selectedStatus === "all" || post.status === selectedStatus

    return matchesSearch && matchesCategory && matchesUrgency && matchesStatus
  })

  const categories = ["Moving", "Errands", "Pet Care", "Childcare", "Transportation", "Home Repair", "Other"]
  const urgencyLevels = ["low", "medium", "high"]
  const statusOptions = ["active", "in-progress", "completed"]

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "in-progress":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "completed":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const handleLike = async (postId: string) => {
    if (!currentUser) return
    likeHelpPost(postId, currentUser.id)

    const post = helpPosts.find((p) => p.id === postId)
    const isLiked = post?.likes.includes(currentUser.id)

    toast({
      title: isLiked ? "Removed like" : "Liked post",
      description: isLiked ? "You removed your like from this post." : "You liked this help request.",
    })
  }

  const handleAddComment = async (postId: string) => {
    if (!currentUser || !commentContent.trim()) return

    const comment = {
      id: Date.now().toString(),
      content: commentContent,
      authorId: currentUser.id,
      author: `${currentUser.firstName} ${currentUser.lastName}`,
      avatar: currentUser.avatar,
      createdAt: new Date(),
    }

    addCommentToHelpPost(postId, comment)
    setCommentContent("")
    setSelectedPostId(null)

    toast({
      title: "Comment added",
      description: "Your comment has been added successfully.",
    })
  }

  const handleDeleteComment = async (postId: string, commentId: string) => {
    deleteCommentFromHelpPost(postId, commentId)
    toast({
      title: "Comment deleted",
      description: "The comment has been deleted successfully.",
    })
  }

  const handleDeletePost = async (postId: string) => {
    deleteHelpPost(postId)
    toast({
      title: "Help post deleted",
      description: "Your help post has been successfully deleted.",
    })
  }

  const handleContactPerson = async (post: any) => {
    if (!currentUser || !contactMessage.trim()) return

    // Check if conversation already exists
    const existingConversation = conversations.find(
      (conv) =>
        conv.participants.includes(currentUser.id) &&
        conv.participants.includes(post.authorId) &&
        conv.participants.length === 2,
    )

    let conversationId = existingConversation?.id

    if (!conversationId) {
      // Create new conversation
      conversationId = await createConversation([currentUser.id, post.authorId])
    }

    if (conversationId) {
      // Navigate to messages with the conversation
      toast({
        title: "Message sent!",
        description: `Your message about "${post.title}" has been sent to ${post.author}.`,
      })

      setContactMessage("")
      setContactingPostId(null)

      // You could navigate to messages page here
      // router.push(`/dashboard/messages?conversation=${conversationId}`)
    }
  }

  if (!currentUser) return null

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Colorful Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-pink-500 via-rose-500 to-red-500 p-8 text-white">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Help Requests 💝</h1>
              <p className="text-white/90 text-lg">Find ways to help your community or request assistance</p>
            </div>
            <Link href="/dashboard/help/request">
              <Button className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                <Plus className="h-4 w-4 mr-2" />
                Request Help
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
                  placeholder="Search help requests..."
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

                <Select value={selectedUrgency} onValueChange={setSelectedUrgency}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Urgency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Urgency</SelectItem>
                    {urgencyLevels.map((urgency) => (
                      <SelectItem key={urgency} value={urgency}>
                        {urgency.charAt(0).toUpperCase() + urgency.slice(1)}
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

        {/* Help Posts */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">Loading help requests...</span>
          </div>
        ) : filteredPosts.length === 0 ? (
          <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800">
            <CardContent className="text-center py-12">
              <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-xl font-semibold mb-2">No help requests found</h3>
              <p className="text-muted-foreground mb-6">
                {searchTerm || selectedCategory !== "all" || selectedUrgency !== "all" || selectedStatus !== "all"
                  ? "Try adjusting your search or filters"
                  : "Be the first to request help in your community"}
              </p>
              <Link href="/dashboard/help/request">
                <Button className="bg-gradient-to-r from-pink-500 to-rose-500">
                  <Plus className="h-4 w-4 mr-2" />
                  Request Help
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredPosts.map((post) => (
              <Card
                key={post.id}
                className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={post.avatar || "/placeholder.svg?height=40&width=40"} alt={post.author} />
                        <AvatarFallback className="bg-gradient-to-br from-pink-500 to-rose-600 text-white">
                          {post.author
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-lg">{post.title}</h3>
                        <p className="text-sm text-muted-foreground">by {post.author}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getUrgencyColor(post.urgency)}>{post.urgency}</Badge>
                      <Badge className={getStatusColor(post.status)}>{post.status}</Badge>
                      {post.authorId === currentUser.id && (
                        <div className="flex space-x-1">
                          <Link href={`/dashboard/help/edit/${post.id}`}>
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
                                <AlertDialogTitle>Delete Help Post</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this help post? This action cannot be undone.
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
                <CardContent className="space-y-4">
                  <div>
                    <Badge variant="outline" className="mb-2">
                      {post.category}
                    </Badge>
                    <p className="text-muted-foreground">{post.description}</p>
                  </div>

                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {post.location}
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {format(post.createdAt, "MMM d, yyyy")}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center space-x-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleLike(post.id)}
                        className={`${
                          post.likes.includes(currentUser.id)
                            ? "text-red-600 hover:text-red-700"
                            : "text-muted-foreground hover:text-red-600"
                        }`}
                      >
                        <Heart
                          className={`h-4 w-4 mr-1 ${post.likes.includes(currentUser.id) ? "fill-current" : ""}`}
                        />
                        {post.likes.length}
                      </Button>

                      <Dialog
                        open={selectedPostId === post.id}
                        onOpenChange={(open) => setSelectedPostId(open ? post.id : null)}
                      >
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-blue-600">
                            <MessageCircle className="h-4 w-4 mr-1" />
                            {post.comments.length}
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>{post.title}</DialogTitle>
                            <DialogDescription>Comments and discussion</DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            {post.comments.length === 0 ? (
                              <p className="text-center text-muted-foreground py-8">No comments yet</p>
                            ) : (
                              post.comments.map((comment) => (
                                <div key={comment.id} className="flex space-x-3 p-3 rounded-lg bg-muted/50">
                                  <Avatar className="h-8 w-8">
                                    <AvatarImage src={comment.avatar || "/placeholder.svg?height=32&width=32"} />
                                    <AvatarFallback>
                                      <User className="h-4 w-4" />
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                      <p className="font-medium text-sm">{comment.author}</p>
                                      {comment.authorId === currentUser.id && (
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => handleDeleteComment(post.id, comment.id)}
                                          className="h-6 w-6 p-0 text-red-600"
                                        >
                                          <Trash2 className="h-3 w-3" />
                                        </Button>
                                      )}
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-1">{comment.content}</p>
                                    <p className="text-xs text-muted-foreground mt-2">
                                      {format(comment.createdAt, "MMM d, yyyy 'at' h:mm a")}
                                    </p>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                          <div className="space-y-4 pt-4 border-t">
                            <Textarea
                              placeholder="Add a comment..."
                              value={commentContent}
                              onChange={(e) => setCommentContent(e.target.value)}
                              rows={3}
                            />
                            <DialogFooter>
                              <Button
                                onClick={() => handleAddComment(post.id)}
                                disabled={!commentContent.trim()}
                                className="bg-gradient-to-r from-pink-500 to-rose-500"
                              >
                                Add Comment
                              </Button>
                            </DialogFooter>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>

                    {/* Contact Person Button */}
                    {post.authorId !== currentUser.id && post.status === "active" && (
                      <Dialog
                        open={contactingPostId === post.id}
                        onOpenChange={(open) => setContactingPostId(open ? post.id : null)}
                      >
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                          >
                            <Send className="h-4 w-4 mr-1" />
                            Offer Help
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Contact {post.author}</DialogTitle>
                            <DialogDescription>Send a message to offer help with "{post.title}"</DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <Textarea
                              placeholder={`Hi ${post.author}, I'd like to help with your request...`}
                              value={contactMessage}
                              onChange={(e) => setContactMessage(e.target.value)}
                              rows={4}
                            />
                          </div>
                          <DialogFooter>
                            <Button
                              variant="outline"
                              onClick={() => {
                                setContactingPostId(null)
                                setContactMessage("")
                              }}
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={() => handleContactPerson(post)}
                              disabled={!contactMessage.trim()}
                              className="bg-gradient-to-r from-green-500 to-emerald-600"
                            >
                              <Send className="h-4 w-4 mr-1" />
                              Send Message
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    )}
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
