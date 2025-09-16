"use client"

import { useState, useEffect, useRef } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, Send, MoreVertical, Plus, MessageCircle, Users } from "lucide-react"
import { useAppStore } from "@/lib/store"
import { format } from "date-fns"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"

export default function MessagesPage() {
  const {
    conversations,
    messages,
    currentUser,
    users,
    sendMessage,
    createConversation,
    fetchConversations,
    fetchMessages,
    fetchUsers,
  } = useAppStore()
  const { toast } = useToast()

  const [selectedConversation, setSelectedConversation] = useState<any>(null)
  const [newMessage, setNewMessage] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [isNewChatOpen, setIsNewChatOpen] = useState(false)
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [groupName, setGroupName] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const loadData = async () => {
      if (currentUser) {
        await Promise.all([fetchUsers(), fetchConversations(currentUser.id)])
      }
    }
    loadData()
  }, [currentUser, fetchConversations, fetchUsers])

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id)
    }
  }, [selectedConversation, fetchMessages])

  const conversationMessages = messages
    .filter((msg) => msg.conversationId === selectedConversation?.id)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())

  // Ensure conversations is always an array
  const safeConversations = Array.isArray(conversations) ? conversations : []

  const filteredConversations = safeConversations.filter(
    (conv) =>
      conv.participantNames?.some((name) => name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (conv.groupName && conv.groupName.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  const availableUsers = users.filter((user) => user.id !== currentUser?.id)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [conversationMessages])

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !currentUser) return

    await sendMessage(selectedConversation.id, newMessage.trim())
    setNewMessage("")
  }

  const handleCreateConversation = async () => {
    if (!currentUser || selectedUsers.length === 0) return

    const participants = [currentUser.id, ...selectedUsers]
    const isGroup = selectedUsers.length > 1
    const finalGroupName = isGroup ? groupName.trim() || "Group Chat" : undefined

    const conversationId = await createConversation(participants, isGroup, finalGroupName)

    if (conversationId) {
      setSelectedUsers([])
      setGroupName("")
      setIsNewChatOpen(false)
      toast({
        title: "Conversation created! 💬",
        description: `New ${isGroup ? "group" : ""} conversation started.`,
      })
    }
  }

  const getConversationName = (conversation: any) => {
    if (conversation.isGroup) {
      return conversation.groupName || "Group Chat"
    }
    return (
      conversation.participantNames?.find(
        (name: string) => name !== `${currentUser?.firstName} ${currentUser?.lastName}`,
      ) || "Unknown"
    )
  }

  const getConversationAvatar = (conversation: any) => {
    if (conversation.isGroup) {
      return "/placeholder.svg?height=40&width=40"
    }
    const otherParticipantIndex = conversation.participants?.findIndex((id: string) => id !== currentUser?.id)
    return conversation.participantAvatars?.[otherParticipantIndex] || "/placeholder.svg?height=40&width=40"
  }

  if (!currentUser) return null

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Colorful Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-500 p-8 text-white">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Messages 💬</h1>
              <p className="text-white/90 text-lg">Connect with community members through real-time messaging</p>
            </div>
            <Dialog open={isNewChatOpen} onOpenChange={setIsNewChatOpen}>
              <DialogTrigger asChild>
                <Button className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                  <Plus className="h-4 w-4 mr-2" />
                  New Chat
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Start New Conversation</DialogTitle>
                  <DialogDescription>Select community members to start a conversation with.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Select Members</Label>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {availableUsers.map((user) => (
                        <div key={user.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={user.id}
                            checked={selectedUsers.includes(user.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedUsers((prev) => [...prev, user.id])
                              } else {
                                setSelectedUsers((prev) => prev.filter((id) => id !== user.id))
                              }
                            }}
                          />
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.firstName} />
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm">
                              {user.firstName[0]}
                              {user.lastName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <Label htmlFor={user.id} className="flex-1 cursor-pointer">
                            {user.firstName} {user.lastName}
                            {user.isOnline && <Badge className="ml-2 bg-green-500 text-white">Online</Badge>}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  {selectedUsers.length > 1 && (
                    <div className="space-y-2">
                      <Label htmlFor="groupName">Group Name (Optional)</Label>
                      <Input
                        id="groupName"
                        placeholder="Enter group name..."
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                      />
                    </div>
                  )}
                  <div className="flex space-x-2">
                    <Button
                      onClick={handleCreateConversation}
                      disabled={selectedUsers.length === 0}
                      className="bg-gradient-to-r from-emerald-500 to-teal-600"
                    >
                      Start Conversation
                    </Button>
                    <Button variant="outline" onClick={() => setIsNewChatOpen(false)}>
                      Cancel
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

        <div className="h-[calc(100vh-12rem)]">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
            {/* Conversations List */}
            <Card className="lg:col-span-1 border-0 shadow-xl bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                    Conversations
                  </span>
                  <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                    {safeConversations.length}
                  </Badge>
                </CardTitle>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search conversations..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[500px]">
                  {filteredConversations.length > 0 ? (
                    filteredConversations.map((conversation) => (
                      <div
                        key={conversation.id}
                        className={`p-4 border-b cursor-pointer hover:bg-muted/50 transition-colors ${
                          selectedConversation?.id === conversation.id ? "bg-muted" : ""
                        }`}
                        onClick={() => setSelectedConversation(conversation)}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="relative">
                            <Avatar>
                              <AvatarImage
                                src={getConversationAvatar(conversation) || "/placeholder.svg"}
                                alt={getConversationName(conversation)}
                              />
                              <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
                                {conversation.isGroup ? (
                                  <Users className="h-4 w-4" />
                                ) : (
                                  getConversationName(conversation)
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")
                                )}
                              </AvatarFallback>
                            </Avatar>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="font-medium truncate">
                                {getConversationName(conversation)}
                                {conversation.isGroup && (
                                  <Badge variant="outline" className="ml-2 text-xs">
                                    Group
                                  </Badge>
                                )}
                              </p>
                              <span className="text-xs text-muted-foreground">
                                {conversation.lastMessage &&
                                  format(new Date(conversation.lastMessage.createdAt), "h:mm a")}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground truncate">
                              {conversation.lastMessage?.content || "No messages yet"}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No conversations found</p>
                      <p className="text-sm">Start a new chat to get connected!</p>
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Chat Area */}
            {selectedConversation ? (
              <Card className="lg:col-span-2 flex flex-col border-0 shadow-xl bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800">
                <CardHeader className="border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage
                          src={getConversationAvatar(selectedConversation) || "/placeholder.svg"}
                          alt={getConversationName(selectedConversation)}
                        />
                        <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
                          {selectedConversation.isGroup ? (
                            <Users className="h-4 w-4" />
                          ) : (
                            getConversationName(selectedConversation)
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                          )}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">{getConversationName(selectedConversation)}</h3>
                        <p className="text-sm text-muted-foreground">
                          {selectedConversation.isGroup
                            ? `${selectedConversation.participants?.length || 0} members`
                            : "Active now"}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="flex-1 p-0 flex flex-col">
                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4">
                      {conversationMessages.length > 0 ? (
                        conversationMessages.map((message) => {
                          const isOwn = message.senderId === currentUser.id
                          return (
                            <div key={message.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                              <div className="flex items-start space-x-2 max-w-[70%]">
                                {!isOwn && (
                                  <Avatar className="h-8 w-8">
                                    <AvatarImage
                                      src={message.senderAvatar || "/placeholder.svg"}
                                      alt={message.senderName}
                                    />
                                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm">
                                      {message.senderName
                                        .split(" ")
                                        .map((n) => n[0])
                                        .join("")}
                                    </AvatarFallback>
                                  </Avatar>
                                )}
                                <div
                                  className={`rounded-lg p-3 ${
                                    isOwn ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white" : "bg-muted"
                                  }`}
                                >
                                  {!isOwn && (
                                    <p className="text-xs font-medium mb-1 opacity-70">{message.senderName}</p>
                                  )}
                                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                  <p className={`text-xs mt-1 ${isOwn ? "text-white/70" : "text-muted-foreground"}`}>
                                    {format(new Date(message.createdAt), "h:mm a")}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )
                        })
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>No messages yet</p>
                          <p className="text-sm">Start the conversation!</p>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>

                  <div className="border-t p-4">
                    <div className="flex space-x-2">
                      <Input
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                        className="flex-1"
                      />
                      <Button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim()}
                        className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="lg:col-span-2 flex items-center justify-center border-0 shadow-xl bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
                <div className="text-center">
                  <MessageCircle className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                  <h3 className="text-xl font-semibold mb-2">Select a conversation</h3>
                  <p className="text-muted-foreground mb-6">Choose a conversation from the list to start messaging</p>
                  <Button
                    onClick={() => setIsNewChatOpen(true)}
                    className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Start New Chat
                  </Button>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
