"use client"

import type React from "react"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { HelpCircle, Send, Mail, Phone, MessageCircle, Book, Search, ExternalLink } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const faqData = [
  {
    question: "How do I create a help request?",
    answer:
      "To create a help request, go to the Help Network section in your dashboard and click 'Request Help'. Fill out the form with details about what you need help with, including the category, urgency level, and description.",
  },
  {
    question: "How do I organize a community event?",
    answer:
      "Navigate to the Events section and click 'Create Event'. Provide details like the event title, date, time, location, and description. You can also set a maximum number of attendees if needed.",
  },
  {
    question: "How is my community score calculated?",
    answer:
      "Your community score is based on your participation: creating help posts (+5 points), completing help requests (+10 points), organizing events (+15 points), forum participation (+3 points), and receiving likes (+1-2 points).",
  },
  {
    question: "Can I edit or delete my posts?",
    answer:
      "Yes, you can edit or delete your own help posts and events. Look for the edit or delete buttons on your posts in the respective sections.",
  },
  {
    question: "How do I change my notification settings?",
    answer:
      "Go to Settings > Notification Preferences to customize which notifications you receive via email and push notifications.",
  },
  {
    question: "Is my personal information safe?",
    answer:
      "Yes, we take privacy seriously. Your personal information is encrypted and only shared with community members when you choose to interact with them.",
  },
  {
    question: "How do I report inappropriate content?",
    answer:
      "You can report inappropriate content by clicking the report button on any post or message. Our moderation team will review it promptly.",
  },
  {
    question: "Can I leave the community?",
    answer:
      "Yes, you can delete your account at any time from Settings > Danger Zone. This action is permanent and cannot be undone.",
  },
]

const supportCategories = [
  "Account Issues",
  "Technical Problems",
  "Feature Requests",
  "Community Guidelines",
  "Privacy & Security",
  "Billing & Payments",
  "Other",
]

const quickLinks = [
  {
    title: "Community Guidelines",
    description: "Learn about our community standards and rules",
    icon: Book,
    href: "/community-guidelines",
  },
  {
    title: "Privacy Policy",
    description: "Understand how we protect your data",
    icon: Book,
    href: "/privacy",
  },
  {
    title: "Terms of Service",
    description: "Read our terms and conditions",
    icon: Book,
    href: "/terms",
  },
  {
    title: "Feature Updates",
    description: "Stay updated with new features and improvements",
    icon: Book,
    href: "/updates",
  },
]

export default function HelpSupportPage() {
  const [ticketData, setTicketData] = useState({
    subject: "",
    category: "",
    priority: "",
    description: "",
  })
  const [searchQuery, setSearchQuery] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    toast({
      title: "Support ticket created",
      description: "We've received your request and will respond within 24 hours.",
    })

    setTicketData({
      subject: "",
      category: "",
      priority: "",
      description: "",
    })

    setIsSubmitting(false)
  }

  const handleChange = (field: string, value: string) => {
    setTicketData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const filteredFAQ = faqData.filter(
    (item) =>
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Help & Support</h1>
          <p className="text-muted-foreground">Get help with Community Connect and find answers to common questions</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* FAQ Section */}
            <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <HelpCircle className="h-5 w-5 text-blue-600" />
                  <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Frequently Asked Questions
                  </span>
                </CardTitle>
                <CardDescription>Find quick answers to common questions</CardDescription>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search FAQ..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {filteredFAQ.map((item, index) => (
                    <AccordionItem key={index} value={`item-${index}`}>
                      <AccordionTrigger className="text-left hover:text-blue-600">{item.question}</AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">{item.answer}</AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
                {filteredFAQ.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <HelpCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No FAQ items found matching your search.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Contact Form */}
            <Card className="border-0 shadow-xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageCircle className="h-5 w-5 text-emerald-600" />
                  <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                    Create Support Ticket
                  </span>
                </CardTitle>
                <CardDescription>Can't find what you're looking for? Send us a message</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleTicketSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="subject" className="text-sm font-medium">
                        Subject
                      </label>
                      <Input
                        id="subject"
                        placeholder="Brief description of your issue"
                        value={ticketData.subject}
                        onChange={(e) => handleChange("subject", e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="category" className="text-sm font-medium">
                        Category
                      </label>
                      <Select value={ticketData.category} onValueChange={(value) => handleChange("category", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {supportCategories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="priority" className="text-sm font-medium">
                      Priority
                    </label>
                    <Select value={ticketData.priority} onValueChange={(value) => handleChange("priority", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="description" className="text-sm font-medium">
                      Description
                    </label>
                    <Textarea
                      id="description"
                      placeholder="Please provide detailed information about your issue..."
                      className="min-h-[120px]"
                      value={ticketData.description}
                      onChange={(e) => handleChange("description", e.target.value)}
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Submit Ticket
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Information */}
            <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
              <CardHeader>
                <CardTitle className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3 p-3 rounded-lg bg-white/50 dark:bg-black/20">
                  <div className="p-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Email Support</p>
                    <p className="text-xs text-muted-foreground">support@communityconnect.com</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 rounded-lg bg-white/50 dark:bg-black/20">
                  <div className="p-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 text-white">
                    <Phone className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Phone Support</p>
                    <p className="text-xs text-muted-foreground">+1 (555) 123-4567</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 rounded-lg bg-white/50 dark:bg-black/20">
                  <div className="p-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 text-white">
                    <MessageCircle className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Live Chat</p>
                    <p className="text-xs text-muted-foreground">Available 9 AM - 5 PM EST</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Links */}
            <Card className="border-0 shadow-xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
              <CardHeader>
                <CardTitle className="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                  Quick Links
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 gap-3">
                  {quickLinks.map((link, index) => (
                    <a
                      key={index}
                      href={link.href}
                      className="flex items-center space-x-3 p-3 rounded-lg bg-white/50 dark:bg-black/20 hover:bg-white/70 dark:hover:bg-black/30 transition-colors group"
                    >
                      <div className="p-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 text-white">
                        <link.icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium group-hover:text-amber-600 transition-colors">{link.title}</p>
                        <p className="text-xs text-muted-foreground truncate">{link.description}</p>
                      </div>
                      <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-amber-600 transition-colors flex-shrink-0" />
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Response Time */}
            <Card className="border-0 shadow-xl bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-950/20 dark:to-gray-950/20">
              <CardHeader>
                <CardTitle className="text-slate-700 dark:text-slate-300">Response Times</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Email Support</span>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                    24 hours
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Live Chat</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-700">
                    5 minutes
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Phone Support</span>
                  <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                    Immediate
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
