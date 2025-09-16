import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  avatar?: string
  bio?: string
  location?: string
  phone?: string
  communityScore: number
  joinedAt: Date
  isOnline?: boolean
  preferences?: {
    notifications: {
      email: boolean
      push: boolean
      helpRequests: boolean
      events: boolean
      messages: boolean
    }
    privacy: {
      showEmail: boolean
      showPhone: boolean
      showLocation: boolean
    }
  }
}

export interface HelpPost {
  id: string
  title: string
  description: string
  category: string
  location: string
  authorId: string
  author: string
  avatar?: string
  status: "active" | "in-progress" | "completed"
  urgency: "low" | "medium" | "high"
  isUrgent?: boolean
  timeframe?: string
  likes: string[]
  comments: Comment[]
  createdAt: Date
  updatedAt: Date
  completedAt?: Date
  helperId?: string
  helperName?: string
}

export interface Event {
  id: string
  title: string
  description: string
  category: string
  date: Date
  startTime: string
  endTime: string
  location: string
  organizerId: string
  organizer: string
  avatar?: string
  maxAttendees: number
  attendees: Array<{
    userId: string
    name: string
    avatar?: string
    joinedAt: Date
  }>
  status: "upcoming" | "ongoing" | "completed" | "cancelled"
  createdAt: Date
  updatedAt: Date
}

export interface ForumPost {
  id: string
  title: string
  content: string
  category: string
  authorId: string
  author: string
  avatar?: string
  authorLevel: string
  likes: string[]
  replies: Array<{
    id: string
    content: string
    authorId: string
    author: string
    avatar?: string
    createdAt: Date
    likes: string[]
  }>
  createdAt: Date
  updatedAt: Date
}

export interface Comment {
  id: string
  content: string
  authorId: string
  author: string
  avatar?: string
  createdAt: Date
}

export interface Conversation {
  id: string
  participants: string[]
  participantNames: string[]
  participantAvatars: string[]
  lastMessage?: {
    content: string
    senderId: string
    createdAt: Date
  }
  unreadCount?: number
  createdAt: Date
  updatedAt: Date
  isGroup?: boolean
  groupName?: string
}

export interface Message {
  id: string
  conversationId: string
  senderId: string
  senderName: string
  senderAvatar?: string
  content: string
  createdAt: Date
  isRead: boolean
}

export interface Notification {
  id: string
  userId: string
  type: "help_request" | "event" | "message" | "forum" | "system"
  title: string
  message: string
  isRead: boolean
  actionUrl?: string
  createdAt: Date
}

interface AppState {
  // Auth
  currentUser: User | null
  isAuthenticated: boolean

  // Data
  users: User[]
  helpPosts: HelpPost[]
  events: Event[]
  forumPosts: ForumPost[]
  conversations: Conversation[]
  messages: Message[]
  notifications: Notification[]

  // Loading states
  isLoading: boolean

  // Auth actions
  setCurrentUser: (user: User | null) => void
  register: (userData: { firstName: string; lastName: string; email: string; password: string }) => Promise<boolean>
  login: (email: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
  fetchProfile: () => Promise<void>
  updateProfile: (updates: Partial<User>) => Promise<void>

  // Data actions
  fetchUsers: () => Promise<void>
  fetchHelpPosts: () => Promise<void>
  fetchEvents: () => Promise<void>
  fetchForumPosts: () => Promise<void>
  fetchConversations: (userId: string) => Promise<void>
  fetchMessages: (conversationId: string) => Promise<void>

  // CRUD actions
  createHelpPost: (
    post: Omit<HelpPost, "id" | "createdAt" | "updatedAt" | "likes" | "comments" | "status">,
  ) => Promise<void>
  updateHelpPost: (id: string, updates: Partial<HelpPost>) => Promise<void>
  deleteHelpPost: (id: string) => Promise<void>

  createEvent: (event: Omit<Event, "id" | "createdAt" | "updatedAt" | "attendees" | "status">) => Promise<void>
  updateEvent: (id: string, updates: Partial<Event>) => Promise<void>
  deleteEvent: (id: string) => Promise<void>

  createForumPost: (
    post: Omit<ForumPost, "id" | "author" | "avatar" | "authorLevel" | "likes" | "replies" | "createdAt" | "updatedAt">,
  ) => Promise<void>
  updateForumPost: (id: string, updates: any) => Promise<void>
  deleteForumPost: (id: string) => Promise<void>

  sendMessage: (conversationId: string, content: string) => Promise<void>
  addMessage: (messageData: any) => void

  // Event actions
  joinEvent: (eventId: string, userId: string) => void
  leaveEvent: (eventId: string, userId: string) => void

  // Help Post actions
  likeHelpPost: (postId: string, userId: string) => void
  addCommentToHelpPost: (postId: string, comment: any) => Promise<void>
  deleteCommentFromHelpPost: (postId: string, commentId: string) => Promise<void>

  // Conversation actions
  createConversation: (participantIds: string[], isGroup?: boolean, groupName?: string) => Promise<string | null>

  // Utility actions
  updateCommunityScore: (action: string, points?: number) => Promise<void>
}

const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentUser: null,
      isAuthenticated: false,
      users: [],
      helpPosts: [],
      events: [],
      forumPosts: [],
      conversations: [],
      messages: [],
      notifications: [],
      isLoading: false,

      // Auth actions
      setCurrentUser: (user) => {
        set({
          currentUser: user,
          isAuthenticated: !!user,
        })
      },

      register: async (userData) => {
        try {
          set({ isLoading: true })

          const response = await fetch("/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(userData),
          })

          if (!response.ok) {
            const error = await response.json()
            throw new Error(error.error || "Registration failed")
          }

          const data = await response.json()

          set({
            currentUser: data.user,
            isAuthenticated: true,
            isLoading: false,
          })

          return true
        } catch (error) {
          console.error("Registration error:", error)
          set({ isLoading: false })
          return false
        }
      },

      login: async (email, password) => {
        try {
          set({ isLoading: true })

          const response = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
          })

          if (!response.ok) {
            const error = await response.json()
            throw new Error(error.error || "Login failed")
          }

          const data = await response.json()

          set({
            currentUser: data.user,
            isAuthenticated: true,
            isLoading: false,
          })

          return true
        } catch (error) {
          console.error("Login error:", error)
          set({ isLoading: false })
          return false
        }
      },

      logout: async () => {
        try {
          await fetch("/api/auth/logout", { method: "POST" })

          set({
            currentUser: null,
            isAuthenticated: false,
            conversations: [],
            messages: [],
            notifications: [],
          })
        } catch (error) {
          console.error("Logout error:", error)
        }
      },

      fetchProfile: async () => {
        try {
          const response = await fetch("/api/auth/profile")

          if (response.ok) {
            const data = await response.json()
            set({
              currentUser: data.user,
              isAuthenticated: true,
            })
          } else {
            set({
              currentUser: null,
              isAuthenticated: false,
            })
          }
        } catch (error) {
          console.error("Fetch profile error:", error)
          set({
            currentUser: null,
            isAuthenticated: false,
          })
        }
      },

      updateProfile: async (updates) => {
        try {
          const response = await fetch("/api/auth/profile", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updates),
          })

          if (response.ok) {
            const data = await response.json()
            set({ currentUser: data.user })
          }
        } catch (error) {
          console.error("Update profile error:", error)
        }
      },

      // Data fetching
      fetchUsers: async () => {
        try {
          const response = await fetch("/api/users")
          if (response.ok) {
            const users = await response.json()
            set({ users })
          }
        } catch (error) {
          console.error("Fetch users error:", error)
        }
      },

      fetchHelpPosts: async () => {
        try {
          console.log("🔄 Fetching help posts...")
          const response = await fetch("/api/help-posts")

          if (response.ok) {
            const helpPosts = await response.json()
            console.log("✅ Fetched help posts:", helpPosts.length, "posts")

            set({ helpPosts })
          } else {
            console.error("❌ Failed to fetch help posts:", response.status, response.statusText)
            set({ helpPosts: [] })
          }
        } catch (error) {
          console.error("❌ Fetch help posts error:", error)
          set({ helpPosts: [] })
        }
      },

      fetchEvents: async () => {
        try {
          console.log("🔄 Fetching events...")
          const response = await fetch("/api/events")

          if (response.ok) {
            const events = await response.json()
            console.log("✅ Fetched events:", events.length, "events")

            set({ events })
          } else {
            console.error("❌ Failed to fetch events:", response.status, response.statusText)
            set({ events: [] })
          }
        } catch (error) {
          console.error("❌ Fetch events error:", error)
          set({ events: [] })
        }
      },

      fetchForumPosts: async () => {
        try {
          const response = await fetch("/api/forum-posts")
          if (response.ok) {
            const forumPosts = await response.json()
            set({ forumPosts })
          }
        } catch (error) {
          console.error("Fetch forum posts error:", error)
        }
      },

      fetchConversations: async (userId) => {
        try {
          const response = await fetch(`/api/conversations?userId=${userId}`)
          if (response.ok) {
            const data = await response.json()
            if (data.success) {
              set({ conversations: data.conversations || [] })
            } else {
              set({ conversations: [] })
            }
          } else {
            set({ conversations: [] })
          }
        } catch (error) {
          console.error("Fetch conversations error:", error)
          set({ conversations: [] })
        }
      },

      fetchMessages: async (conversationId) => {
        try {
          const response = await fetch(`/api/messages?conversationId=${conversationId}`)
          if (response.ok) {
            const data = await response.json()
            if (data.success) {
              set({ messages: data.messages || [] })
            } else {
              set({ messages: [] })
            }
          } else {
            set({ messages: [] })
          }
        } catch (error) {
          console.error("Fetch messages error:", error)
          set({ messages: [] })
        }
      },

      // CRUD operations
      createHelpPost: async (postData) => {
        try {
          console.log("🔄 Creating help post:", postData)

          const response = await fetch("/api/help-posts", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(postData),
          })

          if (response.ok) {
            const newPost = await response.json()
            console.log("✅ Created help post:", newPost)

            // Add to local state immediately
            set((state) => ({
              helpPosts: [newPost, ...state.helpPosts],
            }))

            // Refresh the data to ensure consistency
            await get().fetchHelpPosts()

            // Update community score
            get().updateCommunityScore("help_post_created")
          } else {
            console.error("❌ Failed to create help post:", response.status, response.statusText)
            const errorData = await response.json()
            console.error("Error details:", errorData)
            throw new Error(errorData.error || "Failed to create help post")
          }
        } catch (error) {
          console.error("❌ Create help post error:", error)
          throw error
        }
      },

      updateHelpPost: async (id, updates) => {
        try {
          const response = await fetch(`/api/help-posts/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updates),
          })

          if (response.ok) {
            set((state) => ({
              helpPosts: state.helpPosts.map((post) => (post.id === id ? { ...post, ...updates } : post)),
            }))

            // Update score if completed
            if (updates.status === "completed") {
              get().updateCommunityScore("help_post_completed")
            }
          }
        } catch (error) {
          console.error("Update help post error:", error)
        }
      },

      deleteHelpPost: async (id) => {
        try {
          const response = await fetch(`/api/help-posts/${id}`, {
            method: "DELETE",
          })

          if (response.ok) {
            set((state) => ({
              helpPosts: state.helpPosts.filter((post) => post.id !== id),
            }))
          }
        } catch (error) {
          console.error("Delete help post error:", error)
        }
      },

      createEvent: async (eventData) => {
        try {
          console.log("🔄 Creating event:", eventData)

          const response = await fetch("/api/events", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(eventData),
          })

          if (response.ok) {
            const newEvent = await response.json()
            console.log("✅ Created event:", newEvent)

            // Add to local state immediately
            set((state) => ({
              events: [newEvent, ...state.events],
            }))

            // Refresh the data to ensure consistency
            await get().fetchEvents()

            // Update community score
            get().updateCommunityScore("event_created")
          } else {
            console.error("❌ Failed to create event:", response.status, response.statusText)
            const errorData = await response.json()
            console.error("Error details:", errorData)
            throw new Error(errorData.error || "Failed to create event")
          }
        } catch (error) {
          console.error("❌ Create event error:", error)
          throw error
        }
      },

      updateEvent: async (id, updates) => {
        try {
          const response = await fetch(`/api/events/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updates),
          })

          if (response.ok) {
            set((state) => ({
              events: state.events.map((event) => (event.id === id ? { ...event, ...updates } : event)),
            }))
          }
        } catch (error) {
          console.error("Update event error:", error)
        }
      },

      deleteEvent: async (id) => {
        try {
          const response = await fetch(`/api/events/${id}`, {
            method: "DELETE",
          })

          if (response.ok) {
            set((state) => ({
              events: state.events.filter((event) => event.id !== id),
            }))
          }
        } catch (error) {
          console.error("Delete event error:", error)
        }
      },

      createForumPost: async (postData) => {
        try {
          const response = await fetch("/api/forum-posts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(postData),
          })

          if (response.ok) {
            const newPost = await response.json()
            set((state) => ({
              forumPosts: [newPost, ...state.forumPosts],
            }))

            // Refresh the data
            await get().fetchForumPosts()
          }
        } catch (error) {
          console.error("Create forum post error:", error)
        }
      },

      updateForumPost: async (id, updates) => {
        try {
          const response = await fetch(`/api/forum-posts/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updates),
          })

          if (response.ok) {
            const result = await response.json()

            if (updates.action === "like") {
              set((state) => ({
                forumPosts: state.forumPosts.map((post) => (post.id === id ? { ...post, likes: result.likes } : post)),
              }))
            } else if (updates.action === "reply") {
              set((state) => ({
                forumPosts: state.forumPosts.map((post) =>
                  post.id === id ? { ...post, replies: [...post.replies, result] } : post,
                ),
              }))
            } else if (updates.action === "likeReply") {
              set((state) => ({
                forumPosts: state.forumPosts.map((post) =>
                  post.id === id
                    ? {
                        ...post,
                        replies: post.replies.map((reply) =>
                          reply.id === result.replyId ? { ...reply, likes: result.likes } : reply,
                        ),
                      }
                    : post,
                ),
              }))
            } else if (updates.action === "deleteReply") {
              set((state) => ({
                forumPosts: state.forumPosts.map((post) =>
                  post.id === id
                    ? {
                        ...post,
                        replies: post.replies.filter((reply) => reply.id !== updates.replyId),
                      }
                    : post,
                ),
              }))
            } else {
              set((state) => ({
                forumPosts: state.forumPosts.map((post) => (post.id === id ? { ...post, ...updates } : post)),
              }))
            }
          }
        } catch (error) {
          console.error("Update forum post error:", error)
        }
      },

      deleteForumPost: async (id) => {
        try {
          const response = await fetch(`/api/forum-posts/${id}`, {
            method: "DELETE",
          })

          if (response.ok) {
            set((state) => ({
              forumPosts: state.forumPosts.filter((post) => post.id !== id),
            }))
          }
        } catch (error) {
          console.error("Delete forum post error:", error)
        }
      },

      sendMessage: async (conversationId, content) => {
        try {
          const { currentUser } = get()
          if (!currentUser) return

          const response = await fetch("/api/messages", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              conversationId,
              content,
              senderId: currentUser.id,
              senderName: `${currentUser.firstName} ${currentUser.lastName}`,
              senderAvatar: currentUser.avatar,
            }),
          })

          if (response.ok) {
            const data = await response.json()
            if (data.success) {
              set((state) => ({
                messages: [...state.messages, data.message],
              }))
            }
          }
        } catch (error) {
          console.error("Send message error:", error)
        }
      },

      addMessage: (messageData) => {
        const newMessage = {
          ...messageData,
          id: Date.now().toString(),
          createdAt: new Date(),
        }

        set((state) => ({
          messages: [...state.messages, newMessage],
        }))
      },

      // Event actions
      joinEvent: (eventId, userId) => {
        set((state) => ({
          events: state.events.map((event) =>
            event.id === eventId
              ? {
                  ...event,
                  attendees: [
                    ...event.attendees,
                    {
                      userId,
                      name: `${state.currentUser?.firstName} ${state.currentUser?.lastName}`,
                      avatar: state.currentUser?.avatar,
                      joinedAt: new Date(),
                    },
                  ],
                }
              : event,
          ),
        }))
      },

      leaveEvent: (eventId, userId) => {
        set((state) => ({
          events: state.events.map((event) =>
            event.id === eventId
              ? {
                  ...event,
                  attendees: event.attendees.filter((attendee) => attendee.userId !== userId),
                }
              : event,
          ),
        }))
      },

      // Help Post actions
      likeHelpPost: (postId, userId) => {
        set((state) => ({
          helpPosts: state.helpPosts.map((post) =>
            post.id === postId
              ? {
                  ...post,
                  likes: post.likes.includes(userId)
                    ? post.likes.filter((id) => id !== userId)
                    : [...post.likes, userId],
                }
              : post,
          ),
        }))
      },

      addCommentToHelpPost: async (postId, comment) => {
        set((state) => ({
          helpPosts: state.helpPosts.map((post) =>
            post.id === postId ? { ...post, comments: [...post.comments, comment] } : post,
          ),
        }))
      },

      deleteCommentFromHelpPost: async (postId, commentId) => {
        set((state) => ({
          helpPosts: state.helpPosts.map((post) =>
            post.id === postId
              ? { ...post, comments: post.comments.filter((comment) => comment.id !== commentId) }
              : post,
          ),
        }))
      },

      // Conversation actions
      createConversation: async (participantIds, isGroup = false, groupName) => {
        set((state) => ({
          conversations: [
            ...state.conversations,
            {
              id: Date.now().toString(),
              participants: participantIds,
              participantNames: participantIds.map((id) => state.users.find((user) => user.id === id)?.firstName || ""),
              participantAvatars: participantIds.map((id) => state.users.find((user) => user.id === id)?.avatar || ""),
              lastMessage: undefined,
              unreadCount: 0,
              createdAt: new Date(),
              updatedAt: new Date(),
              isGroup,
              groupName,
            },
          ],
        }))

        return Date.now().toString()
      },

      // Utility actions
      updateCommunityScore: async (action, points) => {
        set((state) => ({
          currentUser: state.currentUser
            ? {
                ...state.currentUser,
                communityScore: (state.currentUser.communityScore || 0) + (points || 0),
              }
            : null,
        }))
      },
    }),
    {
      name: "community-app-storage",
      partialize: (state) => ({
        currentUser: state.currentUser,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
)

export { useAppStore }
